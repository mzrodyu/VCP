from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from models.note import Note

notes_bp = Blueprint('notes', __name__)


@notes_bp.route('', methods=['GET'])
@jwt_required()
def get_notes():
    user_id = get_jwt_identity()
    parent_id = request.args.get('parent_id', type=int)
    include_archived = request.args.get('archived', 'false').lower() == 'true'
    
    query = Note.query.filter_by(user_id=user_id, parent_id=parent_id)
    
    if not include_archived:
        query = query.filter_by(is_archived=False)
    
    notes = query.order_by(Note.is_pinned.desc(), Note.sort_order, Note.updated_at.desc()).all()
    
    return jsonify({
        'notes': [note.to_dict(include_content=False) for note in notes]
    })


@notes_bp.route('/tree', methods=['GET'])
@jwt_required()
def get_notes_tree():
    user_id = get_jwt_identity()
    
    def build_tree(parent_id=None):
        notes = Note.query.filter_by(
            user_id=user_id,
            parent_id=parent_id,
            is_archived=False
        ).order_by(Note.is_pinned.desc(), Note.sort_order).all()
        
        result = []
        for note in notes:
            note_dict = note.to_dict(include_content=False)
            if note.is_folder:
                note_dict['children'] = build_tree(note.id)
            result.append(note_dict)
        return result
    
    return jsonify({
        'tree': build_tree()
    })


@notes_bp.route('/<int:note_id>', methods=['GET'])
@jwt_required()
def get_note(note_id):
    user_id = get_jwt_identity()
    
    note = Note.query.get(note_id)
    
    if not note:
        return jsonify({'error': '笔记不存在'}), 404
    
    if note.user_id != user_id:
        return jsonify({'error': '无权访问此笔记'}), 403
    
    return jsonify({'note': note.to_dict()})


@notes_bp.route('', methods=['POST'])
@jwt_required()
def create_note():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('title'):
        return jsonify({'error': '请提供笔记标题'}), 400
    
    parent_id = data.get('parent_id')
    
    # Verify parent exists and belongs to user
    if parent_id:
        parent = Note.query.get(parent_id)
        if not parent or parent.user_id != user_id or not parent.is_folder:
            return jsonify({'error': '父文件夹无效'}), 400
    
    note = Note(
        user_id=user_id,
        parent_id=parent_id,
        title=data['title'],
        content=data.get('content', ''),
        is_folder=data.get('is_folder', False),
        color=data.get('color'),
        tags=','.join(data.get('tags', [])) if data.get('tags') else None
    )
    
    db.session.add(note)
    db.session.commit()
    
    return jsonify({
        'message': '笔记创建成功',
        'note': note.to_dict()
    }), 201


@notes_bp.route('/<int:note_id>', methods=['PUT'])
@jwt_required()
def update_note(note_id):
    user_id = get_jwt_identity()
    
    note = Note.query.get(note_id)
    
    if not note:
        return jsonify({'error': '笔记不存在'}), 404
    
    if note.user_id != user_id:
        return jsonify({'error': '无权修改此笔记'}), 403
    
    data = request.get_json()
    
    if 'title' in data:
        note.title = data['title']
    if 'content' in data and not note.is_folder:
        note.content = data['content']
    if 'is_pinned' in data:
        note.is_pinned = data['is_pinned']
    if 'is_archived' in data:
        note.is_archived = data['is_archived']
    if 'color' in data:
        note.color = data['color']
    if 'tags' in data:
        note.tags = ','.join(data['tags']) if data['tags'] else None
    if 'parent_id' in data:
        new_parent_id = data['parent_id']
        if new_parent_id:
            parent = Note.query.get(new_parent_id)
            if not parent or parent.user_id != user_id or not parent.is_folder:
                return jsonify({'error': '父文件夹无效'}), 400
            # Prevent circular reference
            if new_parent_id == note.id:
                return jsonify({'error': '不能将笔记移动到自身'}), 400
        note.parent_id = new_parent_id
    
    db.session.commit()
    
    return jsonify({
        'message': '笔记更新成功',
        'note': note.to_dict()
    })


@notes_bp.route('/<int:note_id>', methods=['DELETE'])
@jwt_required()
def delete_note(note_id):
    user_id = get_jwt_identity()
    
    note = Note.query.get(note_id)
    
    if not note:
        return jsonify({'error': '笔记不存在'}), 404
    
    if note.user_id != user_id:
        return jsonify({'error': '无权删除此笔记'}), 403
    
    # If it's a folder, delete all children recursively
    def delete_recursive(note_to_delete):
        for child in note_to_delete.children.all():
            delete_recursive(child)
        db.session.delete(note_to_delete)
    
    delete_recursive(note)
    db.session.commit()
    
    return jsonify({'message': '笔记删除成功'})


@notes_bp.route('/order', methods=['PUT'])
@jwt_required()
def update_notes_order():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or 'order' not in data:
        return jsonify({'error': '请提供排序信息'}), 400
    
    order = data['order']
    parent_id = data.get('parent_id')
    
    for idx, note_id in enumerate(order):
        note = Note.query.get(note_id)
        if note and note.user_id == user_id:
            note.sort_order = idx
            if parent_id is not None:
                note.parent_id = parent_id if parent_id else None
    
    db.session.commit()
    
    return jsonify({'message': '排序更新成功'})


@notes_bp.route('/search', methods=['GET'])
@jwt_required()
def search_notes():
    user_id = get_jwt_identity()
    search_term = request.args.get('q', '').strip()
    
    if not search_term:
        return jsonify({'error': '请提供搜索关键词'}), 400
    
    notes = Note.query.filter(
        Note.user_id == user_id,
        Note.is_archived == False,
        (Note.title.ilike(f'%{search_term}%') | Note.content.ilike(f'%{search_term}%'))
    ).order_by(Note.updated_at.desc()).limit(50).all()
    
    return jsonify({
        'notes': [note.to_dict() for note in notes]
    })
