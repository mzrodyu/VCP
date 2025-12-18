import os
from datetime import timedelta

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'vcp-chat-web-secret-key-change-in-production'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key-change-in-production'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'data', 'vcpchat.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    UPLOAD_FOLDER = os.path.join(basedir, 'data', 'uploads')
    AVATAR_FOLDER = os.path.join(basedir, 'data', 'avatars')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    
    # VCP API Configuration
    VCP_API_URL = os.environ.get('VCP_API_URL') or 'http://localhost:5000'
    VCP_API_KEY = os.environ.get('VCP_API_KEY') or ''
    
    # Pagination
    ITEMS_PER_PAGE = 20
