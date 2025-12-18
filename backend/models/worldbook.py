from app import db
from datetime import datetime
import json

class WorldBook(db.Model):
    __tablename__ = 'worldbooks'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    
    # Can be attached to specific agents
    agent_id = db.Column(db.Integer, db.ForeignKey('agents.id'), nullable=True, index=True)
    
    # Global settings for this worldbook
    is_enabled = db.Column(db.Boolean, default=True)
    is_public = db.Column(db.Boolean, default=False)
    
    # Activation settings
    scan_depth = db.Column(db.Integer, default=5)  # How many messages back to scan
    token_budget = db.Column(db.Integer, default=1000)  # Max tokens to inject
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    entries = db.relationship('WorldBookEntry', backref='worldbook', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self, include_entries=False):
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'description': self.description,
            'agent_id': self.agent_id,
            'is_enabled': self.is_enabled,
            'is_public': self.is_public,
            'scan_depth': self.scan_depth,
            'token_budget': self.token_budget,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'entry_count': self.entries.count()
        }
        if include_entries:
            data['entries'] = [entry.to_dict() for entry in self.entries.order_by(WorldBookEntry.sort_order).all()]
        return data


class WorldBookEntry(db.Model):
    __tablename__ = 'worldbook_entries'
    
    id = db.Column(db.Integer, primary_key=True)
    worldbook_id = db.Column(db.Integer, db.ForeignKey('worldbooks.id'), nullable=False, index=True)
    
    name = db.Column(db.String(100), nullable=False)
    
    # Trigger keywords (comma-separated or JSON array)
    keywords = db.Column(db.Text, nullable=True)
    
    # The actual content to inject
    content = db.Column(db.Text, nullable=False)
    
    # Entry settings
    is_enabled = db.Column(db.Boolean, default=True)
    is_constant = db.Column(db.Boolean, default=False)  # Always active
    
    # Priority and ordering
    priority = db.Column(db.Integer, default=0)
    sort_order = db.Column(db.Integer, default=0)
    
    # Position in context
    position = db.Column(db.String(20), default='before_char')  # 'before_char', 'after_char', 'at_depth_X'
    depth = db.Column(db.Integer, default=0)  # For 'at_depth_X' position
    
    # Token settings
    selective = db.Column(db.Boolean, default=True)  # Use keyword matching
    secondary_keys = db.Column(db.Text, nullable=True)  # Secondary trigger keys
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def get_keywords(self):
        if self.keywords:
            try:
                return json.loads(self.keywords)
            except:
                return [k.strip() for k in self.keywords.split(',') if k.strip()]
        return []
    
    def set_keywords(self, keywords_list):
        self.keywords = json.dumps(keywords_list, ensure_ascii=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'worldbook_id': self.worldbook_id,
            'name': self.name,
            'keywords': self.get_keywords(),
            'content': self.content,
            'is_enabled': self.is_enabled,
            'is_constant': self.is_constant,
            'priority': self.priority,
            'sort_order': self.sort_order,
            'position': self.position,
            'depth': self.depth,
            'selective': self.selective,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
