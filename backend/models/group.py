from app import db
from datetime import datetime
import json

class Group(db.Model):
    __tablename__ = 'groups'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    avatar_url = db.Column(db.String(500), nullable=True)
    
    # Group chat settings
    chat_mode = db.Column(db.String(20), default='sequential')  # 'sequential', 'random', 'manual'
    allow_self_response = db.Column(db.Boolean, default=False)
    
    # Topics stored as JSON array
    topics = db.Column(db.Text, nullable=True)
    
    # Visibility
    is_public = db.Column(db.Boolean, default=False)
    
    sort_order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    members = db.relationship('GroupMember', backref='group', lazy='dynamic', cascade='all, delete-orphan')
    messages = db.relationship('ChatMessage', backref='group', lazy='dynamic', cascade='all, delete-orphan')
    
    def get_topics(self):
        if self.topics:
            return json.loads(self.topics)
        return [{'id': 'default', 'name': '主要对话', 'created_at': self.created_at.isoformat() if self.created_at else None}]
    
    def set_topics(self, topics_list):
        self.topics = json.dumps(topics_list, ensure_ascii=False)
    
    def to_dict(self, include_members=False):
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'description': self.description,
            'avatar_url': self.avatar_url,
            'chat_mode': self.chat_mode,
            'allow_self_response': self.allow_self_response,
            'topics': self.get_topics(),
            'is_public': self.is_public,
            'sort_order': self.sort_order,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'member_count': self.members.count()
        }
        if include_members:
            data['members'] = [member.to_dict() for member in self.members.order_by(GroupMember.sort_order).all()]
        return data


class GroupMember(db.Model):
    __tablename__ = 'group_members'
    
    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id'), nullable=False, index=True)
    agent_id = db.Column(db.Integer, db.ForeignKey('agents.id'), nullable=False, index=True)
    
    # Member settings
    is_active = db.Column(db.Boolean, default=True)
    trigger_probability = db.Column(db.Float, default=1.0)  # For random mode
    
    # Custom prompt override for this group
    custom_prompt = db.Column(db.Text, nullable=True)
    
    sort_order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship to agent
    agent = db.relationship('Agent', backref='group_memberships')
    
    def to_dict(self):
        return {
            'id': self.id,
            'group_id': self.group_id,
            'agent_id': self.agent_id,
            'agent_name': self.agent.name if self.agent else None,
            'agent_avatar': self.agent.avatar_url if self.agent else None,
            'is_active': self.is_active,
            'trigger_probability': self.trigger_probability,
            'sort_order': self.sort_order,
        }
