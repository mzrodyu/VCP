from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from models.user import User
from models.agent import Agent
from models.chat import ChatMessage
from models.note import Note
from models.preset import Preset
from models.worldbook import WorldBook
from models.group import Group
from functools import wraps

admin_bp = Blueprint('admin', __name__)


def admin_required(f):
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or not user.is_admin:
            return jsonify({'error': '需要管理员权限'}), 403
        
        return f(*args, **kwargs)
    return decorated_function


@admin_bp.route('/stats', methods=['GET'])
@admin_required
def get_stats():
    stats = {
        'total_users': User.query.count(),
        'active_users': User.query.filter_by(is_active=True).count(),
        'total_agents': Agent.query.count(),
        'public_agents': Agent.query.filter_by(is_public=True).count(),
        'total_messages': ChatMessage.query.filter_by(is_deleted=False).count(),
        'total_notes': Note.query.count(),
        'total_presets': Preset.query.count(),
        'public_presets': Preset.query.filter_by(is_public=True).count(),
        'total_worldbooks': WorldBook.query.count(),
        'total_groups': Group.query.count(),
    }
    
    return jsonify({'stats': stats})


@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_users():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('search', '')
    
    query = User.query
    
    if search:
        query = query.filter(
            (User.username.ilike(f'%{search}%')) |
            (User.email.ilike(f'%{search}%')) |
            (User.display_name.ilike(f'%{search}%'))
        )
    
    pagination = query.order_by(User.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'users': [user.to_dict(include_private=True) for user in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    })


@admin_bp.route('/users/<int:target_user_id>', methods=['GET'])
@admin_required
def get_user_detail(target_user_id):
    user = User.query.get(target_user_id)
    
    if not user:
        return jsonify({'error': '用户不存在'}), 404
    
    user_data = user.to_dict(include_private=True)
    user_data['agent_count'] = user.agents.count()
    user_data['note_count'] = user.notes.count()
    user_data['preset_count'] = user.presets.count()
    user_data['worldbook_count'] = user.worldbooks.count()
    user_data['group_count'] = user.groups.count()
    
    return jsonify({'user': user_data})


@admin_bp.route('/users/<int:target_user_id>', methods=['PUT'])
@admin_required
def update_user(target_user_id):
    current_user_id = get_jwt_identity()
    
    user = User.query.get(target_user_id)
    
    if not user:
        return jsonify({'error': '用户不存在'}), 404
    
    data = request.get_json()
    
    if 'is_active' in data:
        # Don't allow deactivating yourself
        if target_user_id == current_user_id and not data['is_active']:
            return jsonify({'error': '不能禁用自己的账户'}), 400
        user.is_active = data['is_active']
    
    if 'is_admin' in data:
        # Don't allow removing your own admin status
        if target_user_id == current_user_id and not data['is_admin']:
            return jsonify({'error': '不能移除自己的管理员权限'}), 400
        user.is_admin = data['is_admin']
    
    if 'display_name' in data:
        user.display_name = data['display_name']
    
    db.session.commit()
    
    return jsonify({
        'message': '用户更新成功',
        'user': user.to_dict(include_private=True)
    })


@admin_bp.route('/users/<int:target_user_id>/reset-password', methods=['POST'])
@admin_required
def reset_user_password(target_user_id):
    user = User.query.get(target_user_id)
    
    if not user:
        return jsonify({'error': '用户不存在'}), 404
    
    data = request.get_json()
    new_password = data.get('new_password')
    
    if not new_password or len(new_password) < 6:
        return jsonify({'error': '新密码长度至少6个字符'}), 400
    
    user.set_password(new_password)
    db.session.commit()
    
    return jsonify({'message': '密码重置成功'})


@admin_bp.route('/users/<int:target_user_id>', methods=['DELETE'])
@admin_required
def delete_user(target_user_id):
    current_user_id = get_jwt_identity()
    
    if target_user_id == current_user_id:
        return jsonify({'error': '不能删除自己的账户'}), 400
    
    user = User.query.get(target_user_id)
    
    if not user:
        return jsonify({'error': '用户不存在'}), 404
    
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({'message': '用户删除成功'})


@admin_bp.route('/agents', methods=['GET'])
@admin_required
def get_all_agents():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('search', '')
    public_only = request.args.get('public_only', 'false').lower() == 'true'
    
    query = Agent.query
    
    if search:
        query = query.filter(Agent.name.ilike(f'%{search}%'))
    
    if public_only:
        query = query.filter_by(is_public=True)
    
    pagination = query.order_by(Agent.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    agents_data = []
    for agent in pagination.items:
        agent_dict = agent.to_dict()
        agent_dict['owner_name'] = agent.owner.username if agent.owner else None
        agents_data.append(agent_dict)
    
    return jsonify({
        'agents': agents_data,
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    })


@admin_bp.route('/agents/<int:agent_id>/visibility', methods=['PUT'])
@admin_required
def update_agent_visibility(agent_id):
    agent = Agent.query.get(agent_id)
    
    if not agent:
        return jsonify({'error': 'Agent不存在'}), 404
    
    data = request.get_json()
    
    if 'is_public' in data:
        agent.is_public = data['is_public']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Agent可见性更新成功',
        'agent': agent.to_dict()
    })


@admin_bp.route('/presets', methods=['GET'])
@admin_required
def get_all_presets():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    public_only = request.args.get('public_only', 'false').lower() == 'true'
    
    query = Preset.query
    
    if public_only:
        query = query.filter_by(is_public=True)
    
    pagination = query.order_by(Preset.usage_count.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    presets_data = []
    for preset in pagination.items:
        preset_dict = preset.to_dict(include_content=False)
        preset_dict['owner_name'] = preset.owner.username if preset.owner else None
        presets_data.append(preset_dict)
    
    return jsonify({
        'presets': presets_data,
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    })


@admin_bp.route('/worldbooks', methods=['GET'])
@admin_required
def get_all_worldbooks():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    public_only = request.args.get('public_only', 'false').lower() == 'true'
    
    query = WorldBook.query
    
    if public_only:
        query = query.filter_by(is_public=True)
    
    pagination = query.order_by(WorldBook.updated_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    worldbooks_data = []
    for wb in pagination.items:
        wb_dict = wb.to_dict()
        wb_dict['owner_name'] = wb.owner.username if wb.owner else None
        worldbooks_data.append(wb_dict)
    
    return jsonify({
        'worldbooks': worldbooks_data,
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    })


@admin_bp.route('/system/cleanup', methods=['POST'])
@admin_required
def cleanup_system():
    """Clean up deleted messages and other maintenance tasks"""
    # Permanently delete soft-deleted messages older than 30 days
    from datetime import datetime, timedelta
    
    cutoff_date = datetime.utcnow() - timedelta(days=30)
    
    deleted_count = ChatMessage.query.filter(
        ChatMessage.is_deleted == True,
        ChatMessage.updated_at < cutoff_date
    ).delete()
    
    db.session.commit()
    
    return jsonify({
        'message': '系统清理完成',
        'deleted_messages': deleted_count
    })
