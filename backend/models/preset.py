from app import db
from datetime import datetime
import json

class Preset(db.Model):
    __tablename__ = 'presets'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    
    # Preset content (stored as JSON)
    # Can include system prompts, jailbreak, etc.
    content = db.Column(db.Text, nullable=False)
    
    # Category for organization
    category = db.Column(db.String(50), nullable=True)
    
    # Visibility
    is_public = db.Column(db.Boolean, default=False)
    
    # Usage count for popularity
    usage_count = db.Column(db.Integer, default=0)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def get_content(self):
        if self.content:
            return json.loads(self.content)
        return {}
    
    def set_content(self, content_dict):
        self.content = json.dumps(content_dict, ensure_ascii=False)
    
    def to_dict(self, include_content=True):
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'is_public': self.is_public,
            'usage_count': self.usage_count,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_content:
            data['content'] = self.get_content()
        return data
