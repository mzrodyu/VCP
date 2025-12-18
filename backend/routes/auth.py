from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import datetime
from app import db
from models.user import User
from models.settings import UserSettings

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data:
        return jsonify({'error': '请提供注册信息'}), 400
    
    username = data.get('username', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    display_name = data.get('display_name', '').strip()
    
    if not username or not email or not password:
        return jsonify({'error': '用户名、邮箱和密码不能为空'}), 400
    
    if len(username) < 3 or len(username) > 80:
        return jsonify({'error': '用户名长度应在3-80个字符之间'}), 400
    
    if len(password) < 6:
        return jsonify({'error': '密码长度至少6个字符'}), 400
    
    # Check if username or email already exists
    if User.query.filter_by(username=username).first():
        return jsonify({'error': '用户名已存在'}), 409
    
    if User.query.filter_by(email=email).first():
        return jsonify({'error': '邮箱已被注册'}), 409
    
    # Create new user
    user = User(
        username=username,
        email=email,
        display_name=display_name or username
    )
    user.set_password(password)
    
    # Check if this is the first user - make them admin
    if User.query.count() == 0:
        user.is_admin = True
    
    db.session.add(user)
    db.session.flush()
    
    # Create default settings for user
    settings = UserSettings(user_id=user.id)
    db.session.add(settings)
    
    db.session.commit()
    
    # Create access token
    access_token = create_access_token(identity=user.id)
    
    return jsonify({
        'message': '注册成功',
        'user': user.to_dict(include_private=True),
        'access_token': access_token
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data:
        return jsonify({'error': '请提供登录信息'}), 400
    
    username = data.get('username', '').strip()
    password = data.get('password', '')
    
    if not username or not password:
        return jsonify({'error': '用户名和密码不能为空'}), 400
    
    # Find user by username or email
    user = User.query.filter(
        (User.username == username) | (User.email == username.lower())
    ).first()
    
    if not user or not user.check_password(password):
        return jsonify({'error': '用户名或密码错误'}), 401
    
    if not user.is_active:
        return jsonify({'error': '账户已被禁用，请联系管理员'}), 403
    
    # Update last login time
    user.last_login = datetime.utcnow()
    db.session.commit()
    
    # Create access token
    access_token = create_access_token(identity=user.id)
    
    return jsonify({
        'message': '登录成功',
        'user': user.to_dict(include_private=True),
        'access_token': access_token
    })


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': '用户不存在'}), 404
    
    return jsonify({'user': user.to_dict(include_private=True)})


@auth_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': '用户不存在'}), 404
    
    data = request.get_json()
    
    if 'display_name' in data:
        user.display_name = data['display_name'].strip()
    
    if 'avatar_url' in data:
        user.avatar_url = data['avatar_url']
    
    if 'email' in data:
        new_email = data['email'].strip().lower()
        if new_email != user.email:
            if User.query.filter_by(email=new_email).first():
                return jsonify({'error': '邮箱已被使用'}), 409
            user.email = new_email
    
    db.session.commit()
    
    return jsonify({
        'message': '更新成功',
        'user': user.to_dict(include_private=True)
    })


@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': '用户不存在'}), 404
    
    data = request.get_json()
    old_password = data.get('old_password', '')
    new_password = data.get('new_password', '')
    
    if not old_password or not new_password:
        return jsonify({'error': '请提供旧密码和新密码'}), 400
    
    if not user.check_password(old_password):
        return jsonify({'error': '旧密码错误'}), 401
    
    if len(new_password) < 6:
        return jsonify({'error': '新密码长度至少6个字符'}), 400
    
    user.set_password(new_password)
    db.session.commit()
    
    return jsonify({'message': '密码修改成功'})
