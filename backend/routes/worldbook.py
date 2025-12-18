from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from models.worldbook import WorldBook, WorldBookEntry
from models.agent import Agent

worldbook_bp = Blueprint('worldbook', __name__)


@worldbook_bp.route('', methods=['GET'])
@jwt_required()
def get_worldbooks():
    user_id = get_jwt_identity()
    agent_id = request.args.get('agent_id', type=int)
    
    query = WorldBook.query.filter_by(user_id=user_id)
    
    if agent_id:
        query = query.filter((WorldBook.agent_id == agent_id) | (WorldBook.agent_id == None))
    
    worldbooks = query.order_by(WorldBook.updated_at.desc()).all()
    
    return jsonify({
        'worldbooks': [wb.to_dict() for wb in worldbooks]
    })


@worldbook_bp.route('/public', methods=['GET'])
@jwt_required()
def get_public_worldbooks():
    user_id = get_jwt_identity()
    
    worldbooks = WorldBook.query.filter(
        WorldBook.is_public == True,
        WorldBook.user_id != user_id
    ).order_by(WorldBook.updated_at.desc()).limit(50).all()
    
    return jsonify({
        'worldbooks': [wb.to_dict() for wb in worldbooks]
    })


@worldbook_bp.route('/<int:worldbook_id>', methods=['GET'])
@jwt_required()
def get_worldbook(worldbook_id):
    user_id = get_jwt_identity()
    
    worldbook = WorldBook.query.get(worldbook_id)
    
    if not worldbook:
        return jsonify({'error': '世界书不存在'}), 404
    
    if worldbook.user_id != user_id and not worldbook.is_public:
        return jsonify({'error': '无权访问此世界书'}), 403
    
    return jsonify({'worldbook': worldbook.to_dict(include_entries=True)})


@worldbook_bp.route('', methods=['POST'])
@jwt_required()
def create_worldbook():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('name'):
        return jsonify({'error': '请提供世界书名称'}), 400
    
    agent_id = data.get('agent_id')
    if agent_id:
        agent = Agent.query.get(agent_id)
        if not agent or agent.user_id != user_id:
            return jsonify({'error': '无效的Agent'}), 400
    
    worldbook = WorldBook(
        user_id=user_id,
        name=data['name'],
        description=data.get('description', ''),
        agent_id=agent_id,
        is_enabled=data.get('is_enabled', True),
        is_public=data.get('is_public', False),
        scan_depth=data.get('scan_depth', 5),
        token_budget=data.get('token_budget', 1000)
    )
    
    db.session.add(worldbook)
    db.session.commit()
    
    return jsonify({
        'message': '世界书创建成功',
        'worldbook': worldbook.to_dict()
    }), 201


@worldbook_bp.route('/<int:worldbook_id>', methods=['PUT'])
@jwt_required()
def update_worldbook(worldbook_id):
    user_id = get_jwt_identity()
    
    worldbook = WorldBook.query.get(worldbook_id)
    
    if not worldbook:
        return jsonify({'error': '世界书不存在'}), 404
    
    if worldbook.user_id != user_id:
        return jsonify({'error': '无权修改此世界书'}), 403
    
    data = request.get_json()
    
    if 'name' in data:
        worldbook.name = data['name']
    if 'description' in data:
        worldbook.description = data['description']
    if 'is_enabled' in data:
        worldbook.is_enabled = data['is_enabled']
    if 'is_public' in data:
        worldbook.is_public = data['is_public']
    if 'scan_depth' in data:
        worldbook.scan_depth = data['scan_depth']
    if 'token_budget' in data:
        worldbook.token_budget = data['token_budget']
    if 'agent_id' in data:
        agent_id = data['agent_id']
        if agent_id:
            agent = Agent.query.get(agent_id)
            if not agent or agent.user_id != user_id:
                return jsonify({'error': '无效的Agent'}), 400
        worldbook.agent_id = agent_id
    
    db.session.commit()
    
    return jsonify({
        'message': '世界书更新成功',
        'worldbook': worldbook.to_dict()
    })


@worldbook_bp.route('/<int:worldbook_id>', methods=['DELETE'])
@jwt_required()
def delete_worldbook(worldbook_id):
    user_id = get_jwt_identity()
    
    worldbook = WorldBook.query.get(worldbook_id)
    
    if not worldbook:
        return jsonify({'error': '世界书不存在'}), 404
    
    if worldbook.user_id != user_id:
        return jsonify({'error': '无权删除此世界书'}), 403
    
    db.session.delete(worldbook)
    db.session.commit()
    
    return jsonify({'message': '世界书删除成功'})


# Worldbook Entries
@worldbook_bp.route('/<int:worldbook_id>/entries', methods=['GET'])
@jwt_required()
def get_entries(worldbook_id):
    user_id = get_jwt_identity()
    
    worldbook = WorldBook.query.get(worldbook_id)
    
    if not worldbook:
        return jsonify({'error': '世界书不存在'}), 404
    
    if worldbook.user_id != user_id and not worldbook.is_public:
        return jsonify({'error': '无权访问此世界书'}), 403
    
    entries = worldbook.entries.order_by(WorldBookEntry.sort_order).all()
    
    return jsonify({
        'entries': [entry.to_dict() for entry in entries]
    })


@worldbook_bp.route('/<int:worldbook_id>/entries', methods=['POST'])
@jwt_required()
def create_entry(worldbook_id):
    user_id = get_jwt_identity()
    
    worldbook = WorldBook.query.get(worldbook_id)
    
    if not worldbook:
        return jsonify({'error': '世界书不存在'}), 404
    
    if worldbook.user_id != user_id:
        return jsonify({'error': '无权操作此世界书'}), 403
    
    data = request.get_json()
    
    if not data or not data.get('name'):
        return jsonify({'error': '请提供条目名称'}), 400
    
    entry = WorldBookEntry(
        worldbook_id=worldbook_id,
        name=data['name'],
        content=data.get('content', ''),
        is_enabled=data.get('is_enabled', True),
        is_constant=data.get('is_constant', False),
        priority=data.get('priority', 0),
        position=data.get('position', 'before_char'),
        depth=data.get('depth', 0),
        selective=data.get('selective', True)
    )
    
    if data.get('keywords'):
        entry.set_keywords(data['keywords'])
    
    db.session.add(entry)
    db.session.commit()
    
    return jsonify({
        'message': '条目创建成功',
        'entry': entry.to_dict()
    }), 201


@worldbook_bp.route('/entries/<int:entry_id>', methods=['PUT'])
@jwt_required()
def update_entry(entry_id):
    user_id = get_jwt_identity()
    
    entry = WorldBookEntry.query.get(entry_id)
    
    if not entry:
        return jsonify({'error': '条目不存在'}), 404
    
    worldbook = WorldBook.query.get(entry.worldbook_id)
    
    if worldbook.user_id != user_id:
        return jsonify({'error': '无权修改此条目'}), 403
    
    data = request.get_json()
    
    if 'name' in data:
        entry.name = data['name']
    if 'content' in data:
        entry.content = data['content']
    if 'keywords' in data:
        entry.set_keywords(data['keywords'])
    if 'is_enabled' in data:
        entry.is_enabled = data['is_enabled']
    if 'is_constant' in data:
        entry.is_constant = data['is_constant']
    if 'priority' in data:
        entry.priority = data['priority']
    if 'position' in data:
        entry.position = data['position']
    if 'depth' in data:
        entry.depth = data['depth']
    if 'selective' in data:
        entry.selective = data['selective']
    
    db.session.commit()
    
    return jsonify({
        'message': '条目更新成功',
        'entry': entry.to_dict()
    })


@worldbook_bp.route('/entries/<int:entry_id>', methods=['DELETE'])
@jwt_required()
def delete_entry(entry_id):
    user_id = get_jwt_identity()
    
    entry = WorldBookEntry.query.get(entry_id)
    
    if not entry:
        return jsonify({'error': '条目不存在'}), 404
    
    worldbook = WorldBook.query.get(entry.worldbook_id)
    
    if worldbook.user_id != user_id:
        return jsonify({'error': '无权删除此条目'}), 403
    
    db.session.delete(entry)
    db.session.commit()
    
    return jsonify({'message': '条目删除成功'})


@worldbook_bp.route('/<int:worldbook_id>/entries/order', methods=['PUT'])
@jwt_required()
def update_entries_order(worldbook_id):
    user_id = get_jwt_identity()
    
    worldbook = WorldBook.query.get(worldbook_id)
    
    if not worldbook:
        return jsonify({'error': '世界书不存在'}), 404
    
    if worldbook.user_id != user_id:
        return jsonify({'error': '无权操作此世界书'}), 403
    
    data = request.get_json()
    
    if not data or 'order' not in data:
        return jsonify({'error': '请提供排序信息'}), 400
    
    order = data['order']
    
    for idx, entry_id in enumerate(order):
        entry = WorldBookEntry.query.get(entry_id)
        if entry and entry.worldbook_id == worldbook_id:
            entry.sort_order = idx
    
    db.session.commit()
    
    return jsonify({'message': '排序更新成功'})


@worldbook_bp.route('/<int:worldbook_id>/duplicate', methods=['POST'])
@jwt_required()
def duplicate_worldbook(worldbook_id):
    user_id = get_jwt_identity()
    
    original = WorldBook.query.get(worldbook_id)
    
    if not original:
        return jsonify({'error': '世界书不存在'}), 404
    
    if original.user_id != user_id and not original.is_public:
        return jsonify({'error': '无权复制此世界书'}), 403
    
    # Create copy of worldbook
    new_worldbook = WorldBook(
        user_id=user_id,
        name=f"{original.name} (副本)",
        description=original.description,
        is_enabled=original.is_enabled,
        is_public=False,
        scan_depth=original.scan_depth,
        token_budget=original.token_budget
    )
    
    db.session.add(new_worldbook)
    db.session.flush()
    
    # Copy all entries
    for entry in original.entries.all():
        new_entry = WorldBookEntry(
            worldbook_id=new_worldbook.id,
            name=entry.name,
            keywords=entry.keywords,
            content=entry.content,
            is_enabled=entry.is_enabled,
            is_constant=entry.is_constant,
            priority=entry.priority,
            sort_order=entry.sort_order,
            position=entry.position,
            depth=entry.depth,
            selective=entry.selective
        )
        db.session.add(new_entry)
    
    db.session.commit()
    
    return jsonify({
        'message': '世界书复制成功',
        'worldbook': new_worldbook.to_dict(include_entries=True)
    }), 201
