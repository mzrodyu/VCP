from flask import Blueprint, request, jsonify, Response, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_socketio import emit, join_room, leave_room
import json
import httpx
import re
from app import db, socketio
from models.agent import Agent, AgentTopic
from models.chat import ChatMessage
from models.worldbook import WorldBook, WorldBookEntry
from models.settings import UserSettings

chat_bp = Blueprint('chat', __name__)


def get_worldbook_entries(user_id, agent_id, messages):
    """Get relevant worldbook entries based on recent messages"""
    entries_to_inject = []
    
    # Get worldbooks for this agent and global worldbooks
    worldbooks = WorldBook.query.filter(
        WorldBook.user_id == user_id,
        WorldBook.is_enabled == True,
        (WorldBook.agent_id == agent_id) | (WorldBook.agent_id == None)
    ).all()
    
    if not worldbooks:
        return entries_to_inject
    
    # Combine recent message content for keyword matching
    scan_depth = max(wb.scan_depth for wb in worldbooks) if worldbooks else 5
    recent_messages = messages[-scan_depth:] if len(messages) > scan_depth else messages
    combined_text = ' '.join([msg.get('content', '') for msg in recent_messages]).lower()
    
    for worldbook in worldbooks:
        for entry in worldbook.entries.filter_by(is_enabled=True).all():
            should_include = False
            
            if entry.is_constant:
                should_include = True
            elif entry.selective:
                keywords = entry.get_keywords()
                for keyword in keywords:
                    if keyword.lower() in combined_text:
                        should_include = True
                        break
            
            if should_include:
                entries_to_inject.append({
                    'content': entry.content,
                    'position': entry.position,
                    'depth': entry.depth,
                    'priority': entry.priority
                })
    
    # Sort by priority
    entries_to_inject.sort(key=lambda x: x['priority'], reverse=True)
    
    return entries_to_inject


def build_context(agent, messages, worldbook_entries):
    """Build the full context for the API call"""
    context = []
    
    # Add system prompt
    system_prompt_parts = []
    
    if agent.system_prompt_main:
        system_prompt_parts.append(agent.system_prompt_main)
    
    # Add worldbook entries that go before character
    for entry in worldbook_entries:
        if entry['position'] == 'before_char':
            system_prompt_parts.append(entry['content'])
    
    if agent.system_prompt_assistant:
        system_prompt_parts.append(f"[助手笔记]\n{agent.system_prompt_assistant}")
    
    # Add worldbook entries that go after character
    for entry in worldbook_entries:
        if entry['position'] == 'after_char':
            system_prompt_parts.append(entry['content'])
    
    if system_prompt_parts:
        context.append({
            'role': 'system',
            'content': '\n\n'.join(system_prompt_parts)
        })
    
    # Add chat messages
    for msg in messages:
        context.append({
            'role': msg.get('role', 'user'),
            'content': msg.get('content', '')
        })
    
    # Add jailbreak prompt at the end if exists
    if agent.system_prompt_jailbreak:
        context.append({
            'role': 'system',
            'content': agent.system_prompt_jailbreak
        })
    
    return context


def apply_regex_rules(content, rules):
    """Apply regex replacement rules to content"""
    if not rules:
        return content
    
    result = content
    for rule in rules:
        if rule.get('enabled', True):
            try:
                pattern = rule.get('pattern', '')
                replacement = rule.get('replacement', '')
                flags = 0
                if rule.get('flags', {}).get('i'):
                    flags |= re.IGNORECASE
                if rule.get('flags', {}).get('g'):
                    result = re.sub(pattern, replacement, result, flags=flags)
                else:
                    result = re.sub(pattern, replacement, result, count=1, flags=flags)
            except Exception as e:
                print(f"Regex error: {e}")
    
    return result


@chat_bp.route('/history/<int:topic_id>', methods=['GET'])
@jwt_required()
def get_chat_history(topic_id):
    user_id = get_jwt_identity()
    
    topic = AgentTopic.query.get(topic_id)
    
    if not topic:
        return jsonify({'error': '话题不存在'}), 404
    
    agent = Agent.query.get(topic.agent_id)
    
    if agent.user_id != user_id and not agent.is_public:
        return jsonify({'error': '无权访问此话题'}), 403
    
    messages = ChatMessage.query.filter_by(
        topic_id=topic_id,
        is_deleted=False
    ).order_by(ChatMessage.created_at).all()
    
    return jsonify({
        'messages': [msg.to_dict() for msg in messages]
    })


@chat_bp.route('/send', methods=['POST'])
@jwt_required()
def send_message():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    topic_id = data.get('topic_id')
    content = data.get('content', '').strip()
    attachments = data.get('attachments', [])
    
    if not topic_id:
        return jsonify({'error': '请提供话题ID'}), 400
    
    if not content and not attachments:
        return jsonify({'error': '请输入消息内容'}), 400
    
    topic = AgentTopic.query.get(topic_id)
    
    if not topic:
        return jsonify({'error': '话题不存在'}), 404
    
    agent = Agent.query.get(topic.agent_id)
    
    if agent.user_id != user_id:
        return jsonify({'error': '无权操作此话题'}), 403
    
    # Create user message
    user_message = ChatMessage(
        agent_id=agent.id,
        topic_id=topic_id,
        user_id=user_id,
        role='user',
        content=content
    )
    
    if attachments:
        user_message.set_attachments(attachments)
    
    db.session.add(user_message)
    db.session.commit()
    
    return jsonify({
        'message': user_message.to_dict()
    }), 201


@chat_bp.route('/generate', methods=['POST'])
@jwt_required()
def generate_response():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    topic_id = data.get('topic_id')
    
    if not topic_id:
        return jsonify({'error': '请提供话题ID'}), 400
    
    topic = AgentTopic.query.get(topic_id)
    
    if not topic:
        return jsonify({'error': '话题不存在'}), 404
    
    agent = Agent.query.get(topic.agent_id)
    
    if agent.user_id != user_id:
        return jsonify({'error': '无权操作此话题'}), 403
    
    # Get user settings for API configuration
    settings = UserSettings.query.filter_by(user_id=user_id).first()
    
    if not settings or not settings.vcp_api_url:
        return jsonify({'error': '请先配置API设置'}), 400
    
    # Get chat history
    messages = ChatMessage.query.filter_by(
        topic_id=topic_id,
        is_deleted=False
    ).order_by(ChatMessage.created_at).all()
    
    messages_list = [{'role': msg.role, 'content': msg.content} for msg in messages]
    
    # Get worldbook entries
    worldbook_entries = get_worldbook_entries(user_id, agent.id, messages_list)
    
    # Build context
    context = build_context(agent, messages_list, worldbook_entries)
    
    # Prepare API request
    api_url = settings.vcp_api_url.rstrip('/')
    api_key = settings.vcp_api_key or ''
    
    headers = {
        'Content-Type': 'application/json'
    }
    if api_key:
        headers['Authorization'] = f'Bearer {api_key}'
    
    payload = {
        'model': agent.model or settings.default_model or 'gpt-3.5-turbo',
        'messages': context,
        'temperature': agent.temperature,
        'max_tokens': agent.max_output_tokens,
        'top_p': agent.top_p,
        'stream': agent.stream_output
    }
    
    if agent.stream_output:
        def generate():
            full_response = ""
            try:
                with httpx.Client(timeout=120.0) as client:
                    with client.stream('POST', f'{api_url}/v1/chat/completions', 
                                       headers=headers, json=payload) as response:
                        for line in response.iter_lines():
                            if line.startswith('data: '):
                                data_str = line[6:]
                                if data_str.strip() == '[DONE]':
                                    break
                                try:
                                    chunk_data = json.loads(data_str)
                                    if 'choices' in chunk_data and chunk_data['choices']:
                                        delta = chunk_data['choices'][0].get('delta', {})
                                        if 'content' in delta:
                                            content = delta['content']
                                            full_response += content
                                            yield f"data: {json.dumps({'content': content})}\n\n"
                                except json.JSONDecodeError:
                                    continue
                
                # Apply regex rules
                processed_response = apply_regex_rules(full_response, agent.get_regex_rules())
                
                # Save assistant message
                assistant_message = ChatMessage(
                    agent_id=agent.id,
                    topic_id=topic_id,
                    user_id=user_id,
                    role='assistant',
                    content=processed_response
                )
                db.session.add(assistant_message)
                db.session.commit()
                
                yield f"data: {json.dumps({'done': True, 'message_id': assistant_message.id})}\n\n"
                
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
        
        return Response(generate(), mimetype='text/event-stream')
    
    else:
        # Non-streaming response
        try:
            with httpx.Client(timeout=120.0) as client:
                response = client.post(f'{api_url}/v1/chat/completions', 
                                       headers=headers, json=payload)
                response.raise_for_status()
                result = response.json()
                
                if 'choices' in result and result['choices']:
                    content = result['choices'][0].get('message', {}).get('content', '')
                    
                    # Apply regex rules
                    processed_content = apply_regex_rules(content, agent.get_regex_rules())
                    
                    # Save assistant message
                    assistant_message = ChatMessage(
                        agent_id=agent.id,
                        topic_id=topic_id,
                        user_id=user_id,
                        role='assistant',
                        content=processed_content
                    )
                    db.session.add(assistant_message)
                    db.session.commit()
                    
                    return jsonify({
                        'message': assistant_message.to_dict()
                    })
                else:
                    return jsonify({'error': 'API返回格式错误'}), 500
                    
        except httpx.HTTPError as e:
            return jsonify({'error': f'API请求失败: {str(e)}'}), 500


@chat_bp.route('/message/<int:message_id>', methods=['PUT'])
@jwt_required()
def update_message(message_id):
    user_id = get_jwt_identity()
    
    message = ChatMessage.query.get(message_id)
    
    if not message:
        return jsonify({'error': '消息不存在'}), 404
    
    if message.user_id != user_id:
        return jsonify({'error': '无权修改此消息'}), 403
    
    data = request.get_json()
    
    if 'content' in data:
        message.content = data['content']
        message.is_edited = True
    
    db.session.commit()
    
    return jsonify({
        'message': message.to_dict()
    })


@chat_bp.route('/message/<int:message_id>', methods=['DELETE'])
@jwt_required()
def delete_message(message_id):
    user_id = get_jwt_identity()
    
    message = ChatMessage.query.get(message_id)
    
    if not message:
        return jsonify({'error': '消息不存在'}), 404
    
    if message.user_id != user_id:
        return jsonify({'error': '无权删除此消息'}), 403
    
    message.is_deleted = True
    db.session.commit()
    
    return jsonify({'message': '消息删除成功'})


@chat_bp.route('/topic/<int:topic_id>/clear', methods=['DELETE'])
@jwt_required()
def clear_topic_history(topic_id):
    user_id = get_jwt_identity()
    
    topic = AgentTopic.query.get(topic_id)
    
    if not topic:
        return jsonify({'error': '话题不存在'}), 404
    
    agent = Agent.query.get(topic.agent_id)
    
    if agent.user_id != user_id:
        return jsonify({'error': '无权操作此话题'}), 403
    
    ChatMessage.query.filter_by(topic_id=topic_id).update({'is_deleted': True})
    db.session.commit()
    
    return jsonify({'message': '聊天记录已清空'})


@chat_bp.route('/regenerate', methods=['POST'])
@jwt_required()
def regenerate_response():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    message_id = data.get('message_id')
    
    if not message_id:
        return jsonify({'error': '请提供消息ID'}), 400
    
    message = ChatMessage.query.get(message_id)
    
    if not message or message.role != 'assistant':
        return jsonify({'error': '消息不存在或不是助手消息'}), 404
    
    if message.user_id != user_id:
        return jsonify({'error': '无权操作此消息'}), 403
    
    # Delete this message
    message.is_deleted = True
    db.session.commit()
    
    # Return topic_id for client to call generate endpoint
    return jsonify({
        'topic_id': message.topic_id,
        'message': '请重新生成回复'
    })


# WebSocket events for real-time chat
@socketio.on('join')
def on_join(data):
    room = f"topic_{data.get('topic_id')}"
    join_room(room)


@socketio.on('leave')
def on_leave(data):
    room = f"topic_{data.get('topic_id')}"
    leave_room(room)
