from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from models.agent import Agent, AgentTopic
from models.chat import ChatMessage

topics_bp = Blueprint('topics', __name__)


@topics_bp.route('/agent/<int:agent_id>', methods=['GET'])
@jwt_required()
def get_agent_topics(agent_id):
    user_id = get_jwt_identity()
    
    agent = Agent.query.get(agent_id)
    
    if not agent:
        return jsonify({'error': 'Agent不存在'}), 404
    
    if agent.user_id != user_id and not agent.is_public:
        return jsonify({'error': '无权访问此Agent'}), 403
    
    topics = AgentTopic.query.filter_by(agent_id=agent_id).order_by(AgentTopic.sort_order, AgentTopic.created_at.desc()).all()
    
    return jsonify({
        'topics': [topic.to_dict() for topic in topics]
    })


@topics_bp.route('/agent/<int:agent_id>', methods=['POST'])
@jwt_required()
def create_topic(agent_id):
    user_id = get_jwt_identity()
    
    agent = Agent.query.get(agent_id)
    
    if not agent:
        return jsonify({'error': 'Agent不存在'}), 404
    
    if agent.user_id != user_id:
        return jsonify({'error': '无权操作此Agent'}), 403
    
    data = request.get_json()
    
    topic = AgentTopic(
        agent_id=agent_id,
        name=data.get('name', '新话题')
    )
    
    db.session.add(topic)
    db.session.commit()
    
    return jsonify({
        'message': '话题创建成功',
        'topic': topic.to_dict()
    }), 201


@topics_bp.route('/<int:topic_id>', methods=['GET'])
@jwt_required()
def get_topic(topic_id):
    user_id = get_jwt_identity()
    
    topic = AgentTopic.query.get(topic_id)
    
    if not topic:
        return jsonify({'error': '话题不存在'}), 404
    
    agent = Agent.query.get(topic.agent_id)
    
    if agent.user_id != user_id and not agent.is_public:
        return jsonify({'error': '无权访问此话题'}), 403
    
    return jsonify({'topic': topic.to_dict()})


@topics_bp.route('/<int:topic_id>', methods=['PUT'])
@jwt_required()
def update_topic(topic_id):
    user_id = get_jwt_identity()
    
    topic = AgentTopic.query.get(topic_id)
    
    if not topic:
        return jsonify({'error': '话题不存在'}), 404
    
    agent = Agent.query.get(topic.agent_id)
    
    if agent.user_id != user_id:
        return jsonify({'error': '无权修改此话题'}), 403
    
    data = request.get_json()
    
    if 'name' in data:
        topic.name = data['name']
    
    db.session.commit()
    
    return jsonify({
        'message': '话题更新成功',
        'topic': topic.to_dict()
    })


@topics_bp.route('/<int:topic_id>', methods=['DELETE'])
@jwt_required()
def delete_topic(topic_id):
    user_id = get_jwt_identity()
    
    topic = AgentTopic.query.get(topic_id)
    
    if not topic:
        return jsonify({'error': '话题不存在'}), 404
    
    agent = Agent.query.get(topic.agent_id)
    
    if agent.user_id != user_id:
        return jsonify({'error': '无权删除此话题'}), 403
    
    # Check if this is the last topic
    topic_count = AgentTopic.query.filter_by(agent_id=topic.agent_id).count()
    if topic_count <= 1:
        return jsonify({'error': '不能删除最后一个话题'}), 400
    
    db.session.delete(topic)
    db.session.commit()
    
    return jsonify({'message': '话题删除成功'})


@topics_bp.route('/agent/<int:agent_id>/order', methods=['PUT'])
@jwt_required()
def update_topic_order(agent_id):
    user_id = get_jwt_identity()
    
    agent = Agent.query.get(agent_id)
    
    if not agent:
        return jsonify({'error': 'Agent不存在'}), 404
    
    if agent.user_id != user_id:
        return jsonify({'error': '无权操作此Agent'}), 403
    
    data = request.get_json()
    
    if not data or 'order' not in data:
        return jsonify({'error': '请提供排序信息'}), 400
    
    order = data['order']
    
    for idx, topic_id in enumerate(order):
        topic = AgentTopic.query.get(topic_id)
        if topic and topic.agent_id == agent_id:
            topic.sort_order = idx
    
    db.session.commit()
    
    return jsonify({'message': '排序更新成功'})


@topics_bp.route('/<int:topic_id>/search', methods=['GET'])
@jwt_required()
def search_topic_messages(topic_id):
    user_id = get_jwt_identity()
    
    topic = AgentTopic.query.get(topic_id)
    
    if not topic:
        return jsonify({'error': '话题不存在'}), 404
    
    agent = Agent.query.get(topic.agent_id)
    
    if agent.user_id != user_id and not agent.is_public:
        return jsonify({'error': '无权访问此话题'}), 403
    
    search_term = request.args.get('q', '').strip()
    
    if not search_term:
        return jsonify({'error': '请提供搜索关键词'}), 400
    
    messages = ChatMessage.query.filter(
        ChatMessage.topic_id == topic_id,
        ChatMessage.is_deleted == False,
        ChatMessage.content.ilike(f'%{search_term}%')
    ).order_by(ChatMessage.created_at.desc()).limit(50).all()
    
    return jsonify({
        'messages': [msg.to_dict() for msg in messages]
    })
