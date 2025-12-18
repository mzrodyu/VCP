import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from config import Config

db = SQLAlchemy()
jwt = JWTManager()
socketio = SocketIO(cors_allowed_origins="*", async_mode='eventlet')

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Ensure directories exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['AVATAR_FOLDER'], exist_ok=True)
    os.makedirs(os.path.dirname(app.config['SQLALCHEMY_DATABASE_URI'].replace('sqlite:///', '')), exist_ok=True)
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    socketio.init_app(app)
    CORS(app, supports_credentials=True)
    
    # Register blueprints
    from routes.auth import auth_bp
    from routes.users import users_bp
    from routes.agents import agents_bp
    from routes.chat import chat_bp
    from routes.topics import topics_bp
    from routes.notes import notes_bp
    from routes.presets import presets_bp
    from routes.worldbook import worldbook_bp
    from routes.admin import admin_bp
    from routes.groups import groups_bp
    from routes.settings import settings_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(agents_bp, url_prefix='/api/agents')
    app.register_blueprint(chat_bp, url_prefix='/api/chat')
    app.register_blueprint(topics_bp, url_prefix='/api/topics')
    app.register_blueprint(notes_bp, url_prefix='/api/notes')
    app.register_blueprint(presets_bp, url_prefix='/api/presets')
    app.register_blueprint(worldbook_bp, url_prefix='/api/worldbook')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(groups_bp, url_prefix='/api/groups')
    app.register_blueprint(settings_bp, url_prefix='/api/settings')
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
    return app

if __name__ == '__main__':
    app = create_app()
    socketio.run(app, host='0.0.0.0', port=5001, debug=True)
