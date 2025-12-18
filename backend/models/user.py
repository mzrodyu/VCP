from app import db
from datetime import datetime
import bcrypt

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(128), nullable=False)
    display_name = db.Column(db.String(100), nullable=True)
    avatar_url = db.Column(db.String(500), nullable=True)
    is_admin = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    agents = db.relationship('Agent', backref='owner', lazy='dynamic', cascade='all, delete-orphan')
    notes = db.relationship('Note', backref='owner', lazy='dynamic', cascade='all, delete-orphan')
    presets = db.relationship('Preset', backref='owner', lazy='dynamic', cascade='all, delete-orphan')
    worldbooks = db.relationship('WorldBook', backref='owner', lazy='dynamic', cascade='all, delete-orphan')
    groups = db.relationship('Group', backref='owner', lazy='dynamic', cascade='all, delete-orphan')
    settings = db.relationship('UserSettings', backref='user', uselist=False, cascade='all, delete-orphan')
    
    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def to_dict(self, include_private=False):
        data = {
            'id': self.id,
            'username': self.username,
            'display_name': self.display_name or self.username,
            'avatar_url': self.avatar_url,
            'is_admin': self.is_admin,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
        if include_private:
            data['email'] = self.email
            data['is_active'] = self.is_active
            data['last_login'] = self.last_login.isoformat() if self.last_login else None
            data['updated_at'] = self.updated_at.isoformat() if self.updated_at else None
        return data
