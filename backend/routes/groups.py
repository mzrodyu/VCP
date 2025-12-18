from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from models.group import Group, GroupMember
from models.agent import Agent
from models.chat import ChatMessage
import json

groups_bp = Blueprint('groups', __name__)


@groups_bp.route('', methods=['GET'])
@jwt_required()
def get_groups():
    user_id = get_jwt_identity()
    
    groups = Group.query.filter_by(user_id=user_id).order_by(Group.sort_order, Group.created_at.desc()).all()
    
    return jsonify({
        'groups': [group.to_dict(include_members=True) for group in groups]
    })


@groups_bp.route('/<int:group_id>', methods=['GET'])
@jwt_required()
def get_group(group_id):
    user_id = get_jwt_identity()
    
    group = Group.query.get(group_id)
    
    if not group:
        return jsonify({'error': '群组不存在'}), 404
    
    if group.user_id != user_id and not group.is_public:
        return jsonify({'error': '无权访问此群组'}), 403
    
    return jsonify({'group': group.to_dict(include_members=True)})


@groups_bp.route('', methods=['POST'])
@jwt_required()
def create_group():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('name'):
        return jsonify({'error': '请提供群组名称'}), 400
    
    group = Group(
        user_id=user_id,
        name=data['name'],
        description=data.get('description', ''),
        chat_mode=data.get('chat_mode', 'sequential'),
        allow_self_response=data.get('allow_self_response', False),
        is_public=data.get('is_public', False)
    )
    
    # Initialize default topic
    group.set_topics([{
        'id': 'default',
        'name': '主要对话',
        'created_at': None
    }])
    
    db.session.add(group)
    db.session.commit()
    
    return jsonify({
        'message': '群组创建成功',
        'group': group.to_dict(include_members=True)
    }), 201


@groups_bp.route('/<int:group_id>', methods=['PUT'])
@jwt_required()
def update_group(group_id):
    user_id = get_jwt_identity()
    
    group = Group.query.get(group_id)
    
    if not group:
        return jsonify({'error': '群组不存在'}), 404
    
    if group.user_id != user_id:
        return jsonify({'error': '无权修改此群组'}), 403
    
    data = request.get_json()
    
    if 'name' in data:
        group.name = data['name']
    if 'description' in data:
        group.description = data['description']
    if 'chat_mode' in data:
        group.chat_mode = data['chat_mode']
    if 'allow_self_response' in data:
        group.allow_self_response = data['allow_self_response']
    if 'is_public' in data:
        group.is_public = data['is_public']
    if 'topics' in data:
        group.set_topics(data['topics'])
    
    db.session.commit()
    
    return jsonify({
        'message': '群组更新成功',
        'group': group.to_dict(include_members=True)
    })


@groups_bp.route('/<int:group_id>', methods=['DELETE'])
@jwt_required()
def delete_group(group_id):
    user_id = get_jwt_identity()
    
    group = Group.query.get(group_id)
    
    if not group:
        return jsonify({'error': '群组不存在'}), 404
    
    if group.user_id != user_id:
        return jsonify({'error': '无权删除此群组'}), 403
    
    db.session.delete(group)
    db.session.commit()
    
    return jsonify({'message': '群组删除成功'})


# Group Members
@groups_bp.route('/<int:group_id>/members', methods=['GET'])
@jwt_required()
def get_group_members(group_id):
    user_id = get_jwt_identity()
    
    group = Group.query.get(group_id)
    
    if not group:
        return jsonify({'error': '群组不存在'}), 404
    
    if group.user_id != user_id and not group.is_public:
        return jsonify({'error': '无权访问此群组'}), 403
    
    members = group.members.order_by(GroupMember.sort_order).all()
    
    return jsonify({
        'members': [member.to_dict() for member in members]
    })


@groups_bp.route('/<int:group_id>/members', methods=['POST'])
@jwt_required()
def add_group_member(group_id):
    user_id = get_jwt_identity()
    
    group = Group.query.get(group_id)
    
    if not group:
        return jsonify({'error': '群组不存在'}), 404
    
    if group.user_id != user_id:
        return jsonify({'error': '无权操作此群组'}), 403
    
    data = request.get_json()
    agent_id = data.get('agent_id')
    
    if not agent_id:
        return jsonify({'error': '请提供Agent ID'}), 400
    
    agent = Agent.query.get(agent_id)
    
    if not agent or (agent.user_id != user_id and not agent.is_public):
        return jsonify({'error': '无效的Agent'}), 400
    
    # Check if already a member
    existing = GroupMember.query.filter_by(group_id=group_id, agent_id=agent_id).first()
    if existing:
        return jsonify({'error': 'Agent已在群组中'}), 409
    
    member = GroupMember(
        group_id=group_id,
        agent_id=agent_id,
        trigger_probability=data.get('trigger_probability', 1.0),
        custom_prompt=data.get('custom_prompt')
    )
    
    db.session.add(member)
    db.session.commit()
    
    return jsonify({
        'message': '成员添加成功',
        'member': member.to_dict()
    }), 201


@groups_bp.route('/<int:group_id>/members/<int:member_id>', methods=['PUT'])
@jwt_required()
def update_group_member(group_id, member_id):
    user_id = get_jwt_identity()
    
    group = Group.query.get(group_id)
    
    if not group:
        return jsonify({'error': '群组不存在'}), 404
    
    if group.user_id != user_id:
        return jsonify({'error': '无权操作此群组'}), 403
    
    member = GroupMember.query.get(member_id)
    
    if not member or member.group_id != group_id:
        return jsonify({'error': '成员不存在'}), 404
    
    data = request.get_json()
    
    if 'is_active' in data:
        member.is_active = data['is_active']
    if 'trigger_probability' in data:
        member.trigger_probability = data['trigger_probability']
    if 'custom_prompt' in data:
        member.custom_prompt = data['custom_prompt']
    
    db.session.commit()
    
    return jsonify({
        'message': '成员更新成功',
        'member': member.to_dict()
    })


@groups_bp.route('/<int:group_id>/members/<int:member_id>', methods=['DELETE'])
@jwt_required()
def remove_group_member(group_id, member_id):
    user_id = get_jwt_identity()
    
    group = Group.query.get(group_id)
    
    if not group:
        return jsonify({'error': '群组不存在'}), 404
    
    if group.user_id != user_id:
        return jsonify({'error': '无权操作此群组'}), 403
    
    member = GroupMember.query.get(member_id)
    
    if not member or member.group_id != group_id:
        return jsonify({'error': '成员不存在'}), 404
    
    db.session.delete(member)
    db.session.commit()
    
    return jsonify({'message': '成员移除成功'})


@groups_bp.route('/<int:group_id>/members/order', methods=['PUT'])
@jwt_required()
def update_members_order(group_id):
    user_id = get_jwt_identity()
    
    group = Group.query.get(group_id)
    
    if not group:
        return jsonify({'error': '群组不存在'}), 404
    
    if group.user_id != user_id:
        return jsonify({'error': '无权操作此群组'}), 403
    
    data = request.get_json()
    
    if not data or 'order' not in data:
        return jsonify({'error': '请提供排序信息'}), 400
    
    order = data['order']
    
    for idx, member_id in enumerate(order):
        member = GroupMember.query.get(member_id)
        if member and member.group_id == group_id:
            member.sort_order = idx
    
    db.session.commit()
    
    return jsonify({'message': '排序更新成功'})


# Group Topics
@groups_bp.route('/<int:group_id>/topics', methods=['POST'])
@jwt_required()
def create_group_topic(group_id):
    user_id = get_jwt_identity()
    
    group = Group.query.get(group_id)
    
    if not group:
        return jsonify({'error': '群组不存在'}), 404
    
    if group.user_id != user_id:
        return jsonify({'error': '无权操作此群组'}), 403
    
    data = request.get_json()
    
    topics = group.get_topics()
    new_topic = {
        'id': f"topic_{len(topics) + 1}_{int(import_time())}",
        'name': data.get('name', '新话题'),
        'created_at': None
    }
    topics.append(new_topic)
    group.set_topics(topics)
    
    db.session.commit()
    
    return jsonify({
        'message': '话题创建成功',
        'topic': new_topic,
        'topics': topics
    }), 201


def import_time():
    import time
    return time.time()


# Group Chat
@groups_bp.route('/<int:group_id>/chat/<topic_id>', methods=['GET'])
@jwt_required()
def get_group_chat_history(group_id, topic_id):
    user_id = get_jwt_identity()
    
    group = Group.query.get(group_id)
    
    if not group:
        return jsonify({'error': '群组不存在'}), 404
    
    if group.user_id != user_id and not group.is_public:
        return jsonify({'error': '无权访问此群组'}), 403
    
    messages = ChatMessage.query.filter_by(
        group_id=group_id,
        group_topic_id=topic_id,
        is_deleted=False
    ).order_by(ChatMessage.created_at).all()
    
    return jsonify({
        'messages': [msg.to_dict() for msg in messages]
    })
