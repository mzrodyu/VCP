from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
from app import db
from models.agent import Agent, AgentTopic
from models.user import User

agents_bp = Blueprint('agents', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@agents_bp.route('', methods=['GET'])
@jwt_required()
def get_agents():
    user_id = get_jwt_identity()
    
    # Get user's own agents
    agents = Agent.query.filter_by(user_id=user_id).order_by(Agent.sort_order, Agent.created_at.desc()).all()
    
    return jsonify({
        'agents': [agent.to_dict() for agent in agents]
    })


@agents_bp.route('/public', methods=['GET'])
@jwt_required()
def get_public_agents():
    user_id = get_jwt_identity()
    
    # Get public agents from other users
    agents = Agent.query.filter(
        Agent.is_public == True,
        Agent.user_id != user_id
    ).order_by(Agent.created_at.desc()).limit(50).all()
    
    return jsonify({
        'agents': [agent.to_dict() for agent in agents]
    })


@agents_bp.route('/<int:agent_id>', methods=['GET'])
@jwt_required()
def get_agent(agent_id):
    user_id = get_jwt_identity()
    
    agent = Agent.query.get(agent_id)
    
    if not agent:
        return jsonify({'error': 'Agent不存在'}), 404
    
    # Check access permission
    if agent.user_id != user_id and not agent.is_public:
        return jsonify({'error': '无权访问此Agent'}), 403
    
    include_prompts = agent.user_id == user_id
    
    return jsonify({
        'agent': agent.to_dict(include_prompts=include_prompts)
    })


@agents_bp.route('', methods=['POST'])
@jwt_required()
def create_agent():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('name'):
        return jsonify({'error': '请提供Agent名称'}), 400
    
    agent = Agent(
        user_id=user_id,
        name=data['name'],
        description=data.get('description', ''),
        system_prompt_main=data.get('system_prompt_main', f"你是 {data['name']}。"),
        system_prompt_jailbreak=data.get('system_prompt_jailbreak', ''),
        system_prompt_assistant=data.get('system_prompt_assistant', ''),
        model=data.get('model', ''),
        temperature=data.get('temperature', 0.7),
        context_token_limit=data.get('context_token_limit', 4000),
        max_output_tokens=data.get('max_output_tokens', 1000),
        top_p=data.get('top_p', 0.9),
        top_k=data.get('top_k', 40),
        stream_output=data.get('stream_output', True),
        is_public=data.get('is_public', False),
    )
    
    if data.get('style_settings'):
        agent.set_style_settings(data['style_settings'])
    
    if data.get('regex_rules'):
        agent.set_regex_rules(data['regex_rules'])
    
    db.session.add(agent)
    db.session.flush()
    
    # Create default topic
    default_topic = AgentTopic(
        agent_id=agent.id,
        name='主要对话'
    )
    db.session.add(default_topic)
    db.session.commit()
    
    return jsonify({
        'message': 'Agent创建成功',
        'agent': agent.to_dict(include_prompts=True)
    }), 201


@agents_bp.route('/<int:agent_id>', methods=['PUT'])
@jwt_required()
def update_agent(agent_id):
    user_id = get_jwt_identity()
    
    agent = Agent.query.get(agent_id)
    
    if not agent:
        return jsonify({'error': 'Agent不存在'}), 404
    
    if agent.user_id != user_id:
        return jsonify({'error': '无权修改此Agent'}), 403
    
    data = request.get_json()
    
    # Update fields
    if 'name' in data:
        agent.name = data['name']
    if 'description' in data:
        agent.description = data['description']
    if 'system_prompt_main' in data:
        agent.system_prompt_main = data['system_prompt_main']
    if 'system_prompt_jailbreak' in data:
        agent.system_prompt_jailbreak = data['system_prompt_jailbreak']
    if 'system_prompt_assistant' in data:
        agent.system_prompt_assistant = data['system_prompt_assistant']
    if 'model' in data:
        agent.model = data['model']
    if 'temperature' in data:
        agent.temperature = data['temperature']
    if 'context_token_limit' in data:
        agent.context_token_limit = data['context_token_limit']
    if 'max_output_tokens' in data:
        agent.max_output_tokens = data['max_output_tokens']
    if 'top_p' in data:
        agent.top_p = data['top_p']
    if 'top_k' in data:
        agent.top_k = data['top_k']
    if 'stream_output' in data:
        agent.stream_output = data['stream_output']
    if 'is_public' in data:
        agent.is_public = data['is_public']
    if 'style_settings' in data:
        agent.set_style_settings(data['style_settings'])
    if 'regex_rules' in data:
        agent.set_regex_rules(data['regex_rules'])
    if 'tts_voice_primary' in data:
        agent.tts_voice_primary = data['tts_voice_primary']
    if 'tts_speed' in data:
        agent.tts_speed = data['tts_speed']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Agent更新成功',
        'agent': agent.to_dict(include_prompts=True)
    })


@agents_bp.route('/<int:agent_id>', methods=['DELETE'])
@jwt_required()
def delete_agent(agent_id):
    user_id = get_jwt_identity()
    
    agent = Agent.query.get(agent_id)
    
    if not agent:
        return jsonify({'error': 'Agent不存在'}), 404
    
    if agent.user_id != user_id:
        return jsonify({'error': '无权删除此Agent'}), 403
    
    db.session.delete(agent)
    db.session.commit()
    
    return jsonify({'message': 'Agent删除成功'})


@agents_bp.route('/<int:agent_id>/avatar', methods=['POST'])
@jwt_required()
def upload_agent_avatar(agent_id):
    user_id = get_jwt_identity()
    
    agent = Agent.query.get(agent_id)
    
    if not agent:
        return jsonify({'error': 'Agent不存在'}), 404
    
    if agent.user_id != user_id:
        return jsonify({'error': '无权修改此Agent'}), 403
    
    if 'file' not in request.files:
        return jsonify({'error': '没有上传文件'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': '未选择文件'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': '不支持的文件格式'}), 400
    
    # Save the file
    filename = f"agent_{agent_id}_avatar.{file.filename.rsplit('.', 1)[1].lower()}"
    filepath = os.path.join(current_app.config['AVATAR_FOLDER'], filename)
    file.save(filepath)
    
    # Update agent's avatar URL
    agent.avatar_url = f"/api/agents/avatar/{filename}"
    db.session.commit()
    
    return jsonify({
        'message': '头像上传成功',
        'avatar_url': agent.avatar_url
    })


@agents_bp.route('/avatar/<filename>', methods=['GET'])
def get_agent_avatar(filename):
    from flask import send_from_directory
    return send_from_directory(current_app.config['AVATAR_FOLDER'], filename)


@agents_bp.route('/order', methods=['PUT'])
@jwt_required()
def update_agent_order():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or 'order' not in data:
        return jsonify({'error': '请提供排序信息'}), 400
    
    order = data['order']
    
    for idx, agent_id in enumerate(order):
        agent = Agent.query.get(agent_id)
        if agent and agent.user_id == user_id:
            agent.sort_order = idx
    
    db.session.commit()
    
    return jsonify({'message': '排序更新成功'})


@agents_bp.route('/<int:agent_id>/duplicate', methods=['POST'])
@jwt_required()
def duplicate_agent(agent_id):
    user_id = get_jwt_identity()
    
    original = Agent.query.get(agent_id)
    
    if not original:
        return jsonify({'error': 'Agent不存在'}), 404
    
    # Allow duplicating own agents or public agents
    if original.user_id != user_id and not original.is_public:
        return jsonify({'error': '无权复制此Agent'}), 403
    
    # Create a copy
    new_agent = Agent(
        user_id=user_id,
        name=f"{original.name} (副本)",
        description=original.description,
        avatar_url=original.avatar_url,
        system_prompt_main=original.system_prompt_main,
        system_prompt_jailbreak=original.system_prompt_jailbreak,
        system_prompt_assistant=original.system_prompt_assistant,
        model=original.model,
        temperature=original.temperature,
        context_token_limit=original.context_token_limit,
        max_output_tokens=original.max_output_tokens,
        top_p=original.top_p,
        top_k=original.top_k,
        stream_output=original.stream_output,
        style_settings=original.style_settings,
        regex_rules=original.regex_rules,
        tts_voice_primary=original.tts_voice_primary,
        tts_speed=original.tts_speed,
        is_public=False,
    )
    
    db.session.add(new_agent)
    db.session.flush()
    
    # Create default topic
    default_topic = AgentTopic(
        agent_id=new_agent.id,
        name='主要对话'
    )
    db.session.add(default_topic)
    db.session.commit()
    
    return jsonify({
        'message': 'Agent复制成功',
        'agent': new_agent.to_dict(include_prompts=True)
    }), 201
