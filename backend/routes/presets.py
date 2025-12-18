from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from models.preset import Preset

presets_bp = Blueprint('presets', __name__)


@presets_bp.route('', methods=['GET'])
@jwt_required()
def get_presets():
    user_id = get_jwt_identity()
    category = request.args.get('category')
    
    query = Preset.query.filter_by(user_id=user_id)
    
    if category:
        query = query.filter_by(category=category)
    
    presets = query.order_by(Preset.usage_count.desc(), Preset.updated_at.desc()).all()
    
    return jsonify({
        'presets': [preset.to_dict(include_content=False) for preset in presets]
    })


@presets_bp.route('/public', methods=['GET'])
@jwt_required()
def get_public_presets():
    user_id = get_jwt_identity()
    category = request.args.get('category')
    
    query = Preset.query.filter(
        Preset.is_public == True,
        Preset.user_id != user_id
    )
    
    if category:
        query = query.filter_by(category=category)
    
    presets = query.order_by(Preset.usage_count.desc()).limit(50).all()
    
    return jsonify({
        'presets': [preset.to_dict(include_content=False) for preset in presets]
    })


@presets_bp.route('/<int:preset_id>', methods=['GET'])
@jwt_required()
def get_preset(preset_id):
    user_id = get_jwt_identity()
    
    preset = Preset.query.get(preset_id)
    
    if not preset:
        return jsonify({'error': '预设不存在'}), 404
    
    if preset.user_id != user_id and not preset.is_public:
        return jsonify({'error': '无权访问此预设'}), 403
    
    return jsonify({'preset': preset.to_dict()})


@presets_bp.route('', methods=['POST'])
@jwt_required()
def create_preset():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('name'):
        return jsonify({'error': '请提供预设名称'}), 400
    
    preset = Preset(
        user_id=user_id,
        name=data['name'],
        description=data.get('description', ''),
        category=data.get('category'),
        is_public=data.get('is_public', False)
    )
    
    preset.set_content(data.get('content', {}))
    
    db.session.add(preset)
    db.session.commit()
    
    return jsonify({
        'message': '预设创建成功',
        'preset': preset.to_dict()
    }), 201


@presets_bp.route('/<int:preset_id>', methods=['PUT'])
@jwt_required()
def update_preset(preset_id):
    user_id = get_jwt_identity()
    
    preset = Preset.query.get(preset_id)
    
    if not preset:
        return jsonify({'error': '预设不存在'}), 404
    
    if preset.user_id != user_id:
        return jsonify({'error': '无权修改此预设'}), 403
    
    data = request.get_json()
    
    if 'name' in data:
        preset.name = data['name']
    if 'description' in data:
        preset.description = data['description']
    if 'category' in data:
        preset.category = data['category']
    if 'is_public' in data:
        preset.is_public = data['is_public']
    if 'content' in data:
        preset.set_content(data['content'])
    
    db.session.commit()
    
    return jsonify({
        'message': '预设更新成功',
        'preset': preset.to_dict()
    })


@presets_bp.route('/<int:preset_id>', methods=['DELETE'])
@jwt_required()
def delete_preset(preset_id):
    user_id = get_jwt_identity()
    
    preset = Preset.query.get(preset_id)
    
    if not preset:
        return jsonify({'error': '预设不存在'}), 404
    
    if preset.user_id != user_id:
        return jsonify({'error': '无权删除此预设'}), 403
    
    db.session.delete(preset)
    db.session.commit()
    
    return jsonify({'message': '预设删除成功'})


@presets_bp.route('/<int:preset_id>/use', methods=['POST'])
@jwt_required()
def use_preset(preset_id):
    user_id = get_jwt_identity()
    
    preset = Preset.query.get(preset_id)
    
    if not preset:
        return jsonify({'error': '预设不存在'}), 404
    
    if preset.user_id != user_id and not preset.is_public:
        return jsonify({'error': '无权使用此预设'}), 403
    
    # Increment usage count
    preset.usage_count += 1
    db.session.commit()
    
    return jsonify({
        'message': '预设已应用',
        'content': preset.get_content()
    })


@presets_bp.route('/<int:preset_id>/duplicate', methods=['POST'])
@jwt_required()
def duplicate_preset(preset_id):
    user_id = get_jwt_identity()
    
    original = Preset.query.get(preset_id)
    
    if not original:
        return jsonify({'error': '预设不存在'}), 404
    
    if original.user_id != user_id and not original.is_public:
        return jsonify({'error': '无权复制此预设'}), 403
    
    new_preset = Preset(
        user_id=user_id,
        name=f"{original.name} (副本)",
        description=original.description,
        category=original.category,
        content=original.content,
        is_public=False
    )
    
    db.session.add(new_preset)
    db.session.commit()
    
    return jsonify({
        'message': '预设复制成功',
        'preset': new_preset.to_dict()
    }), 201


@presets_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_categories():
    user_id = get_jwt_identity()
    
    categories = db.session.query(Preset.category).filter(
        Preset.user_id == user_id,
        Preset.category.isnot(None)
    ).distinct().all()
    
    return jsonify({
        'categories': [c[0] for c in categories if c[0]]
    })
