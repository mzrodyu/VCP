from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from models.settings import UserSettings

settings_bp = Blueprint('settings', __name__)


@settings_bp.route('', methods=['GET'])
@jwt_required()
def get_settings():
    user_id = get_jwt_identity()
    
    settings = UserSettings.query.filter_by(user_id=user_id).first()
    
    if not settings:
        # Create default settings
        settings = UserSettings(user_id=user_id)
        db.session.add(settings)
        db.session.commit()
    
    return jsonify({'settings': settings.to_dict()})


@settings_bp.route('', methods=['PUT'])
@jwt_required()
def update_settings():
    user_id = get_jwt_identity()
    
    settings = UserSettings.query.filter_by(user_id=user_id).first()
    
    if not settings:
        settings = UserSettings(user_id=user_id)
        db.session.add(settings)
    
    data = request.get_json()
    
    if 'theme' in data:
        settings.theme = data['theme']
    if 'sidebar_width' in data:
        settings.sidebar_width = data['sidebar_width']
    if 'notifications_sidebar_width' in data:
        settings.notifications_sidebar_width = data['notifications_sidebar_width']
    if 'default_model' in data:
        settings.default_model = data['default_model']
    if 'default_temperature' in data:
        settings.default_temperature = data['default_temperature']
    if 'stream_output' in data:
        settings.stream_output = data['stream_output']
    if 'vcp_api_url' in data:
        settings.vcp_api_url = data['vcp_api_url']
    if 'vcp_api_key' in data:
        settings.vcp_api_key = data['vcp_api_key']
    if 'enable_notifications' in data:
        settings.enable_notifications = data['enable_notifications']
    if 'notification_sound' in data:
        settings.notification_sound = data['notification_sound']
    if 'preferences' in data:
        settings.set_preferences(data['preferences'])
    if 'agent_order' in data:
        settings.set_agent_order(data['agent_order'])
    if 'group_order' in data:
        settings.set_group_order(data['group_order'])
    
    db.session.commit()
    
    return jsonify({
        'message': '设置更新成功',
        'settings': settings.to_dict()
    })


@settings_bp.route('/api', methods=['GET'])
@jwt_required()
def get_api_settings():
    user_id = get_jwt_identity()
    
    settings = UserSettings.query.filter_by(user_id=user_id).first()
    
    if not settings:
        return jsonify({
            'vcp_api_url': '',
            'has_api_key': False
        })
    
    return jsonify({
        'vcp_api_url': settings.vcp_api_url or '',
        'has_api_key': bool(settings.vcp_api_key)
    })


@settings_bp.route('/api', methods=['PUT'])
@jwt_required()
def update_api_settings():
    user_id = get_jwt_identity()
    
    settings = UserSettings.query.filter_by(user_id=user_id).first()
    
    if not settings:
        settings = UserSettings(user_id=user_id)
        db.session.add(settings)
    
    data = request.get_json()
    
    if 'vcp_api_url' in data:
        settings.vcp_api_url = data['vcp_api_url']
    if 'vcp_api_key' in data:
        settings.vcp_api_key = data['vcp_api_key']
    
    db.session.commit()
    
    return jsonify({
        'message': 'API设置更新成功',
        'vcp_api_url': settings.vcp_api_url or '',
        'has_api_key': bool(settings.vcp_api_key)
    })


@settings_bp.route('/test-api', methods=['POST'])
@jwt_required()
def test_api_connection():
    user_id = get_jwt_identity()
    
    settings = UserSettings.query.filter_by(user_id=user_id).first()
    
    if not settings or not settings.vcp_api_url:
        return jsonify({'error': '请先配置API地址'}), 400
    
    import httpx
    
    try:
        headers = {}
        if settings.vcp_api_key:
            headers['Authorization'] = f'Bearer {settings.vcp_api_key}'
        
        with httpx.Client(timeout=10.0) as client:
            # Try to get models list to verify connection
            response = client.get(
                f"{settings.vcp_api_url.rstrip('/')}/v1/models",
                headers=headers
            )
            response.raise_for_status()
            
            result = response.json()
            models = []
            if 'data' in result:
                models = [m.get('id', '') for m in result['data']]
            
            return jsonify({
                'success': True,
                'message': 'API连接成功',
                'models': models
            })
            
    except httpx.TimeoutException:
        return jsonify({'error': 'API连接超时'}), 408
    except httpx.HTTPStatusError as e:
        return jsonify({'error': f'API返回错误: {e.response.status_code}'}), 502
    except Exception as e:
        return jsonify({'error': f'API连接失败: {str(e)}'}), 500


@settings_bp.route('/models', methods=['GET'])
@jwt_required()
def get_available_models():
    user_id = get_jwt_identity()
    
    settings = UserSettings.query.filter_by(user_id=user_id).first()
    
    if not settings or not settings.vcp_api_url:
        return jsonify({'models': []})
    
    import httpx
    
    try:
        headers = {}
        if settings.vcp_api_key:
            headers['Authorization'] = f'Bearer {settings.vcp_api_key}'
        
        with httpx.Client(timeout=10.0) as client:
            response = client.get(
                f"{settings.vcp_api_url.rstrip('/')}/v1/models",
                headers=headers
            )
            response.raise_for_status()
            
            result = response.json()
            models = []
            if 'data' in result:
                models = [m.get('id', '') for m in result['data']]
            
            return jsonify({'models': models})
            
    except Exception as e:
        return jsonify({'models': [], 'error': str(e)})
