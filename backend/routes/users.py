from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
from app import db
from models.user import User

users_bp = Blueprint('users', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@users_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': '用户不存在'}), 404
    
    return jsonify({'user': user.to_dict(include_private=True)})


@users_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': '用户不存在'}), 404
    
    data = request.get_json()
    
    if 'display_name' in data:
        user.display_name = data['display_name'].strip()
    
    db.session.commit()
    
    return jsonify({
        'message': '更新成功',
        'user': user.to_dict(include_private=True)
    })


@users_bp.route('/avatar', methods=['POST'])
@jwt_required()
def upload_avatar():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': '用户不存在'}), 404
    
    if 'file' not in request.files:
        return jsonify({'error': '没有上传文件'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': '未选择文件'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': '不支持的文件格式'}), 400
    
    # Save the file
    filename = f"user_{user_id}_avatar.{file.filename.rsplit('.', 1)[1].lower()}"
    filepath = os.path.join(current_app.config['AVATAR_FOLDER'], filename)
    file.save(filepath)
    
    # Update user's avatar URL
    user.avatar_url = f"/api/users/avatar/{filename}"
    db.session.commit()
    
    return jsonify({
        'message': '头像上传成功',
        'avatar_url': user.avatar_url
    })


@users_bp.route('/avatar/<filename>', methods=['GET'])
def get_avatar(filename):
    from flask import send_from_directory
    return send_from_directory(current_app.config['AVATAR_FOLDER'], filename)


@users_bp.route('/<int:target_user_id>', methods=['GET'])
@jwt_required()
def get_user_public_profile(target_user_id):
    user = User.query.get(target_user_id)
    
    if not user:
        return jsonify({'error': '用户不存在'}), 404
    
    return jsonify({'user': user.to_dict()})
