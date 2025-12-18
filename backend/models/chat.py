from app import db
from datetime import datetime
import json

class ChatMessage(db.Model):
    __tablename__ = 'chat_messages'
    
    id = db.Column(db.Integer, primary_key=True)
    agent_id = db.Column(db.Integer, db.ForeignKey('agents.id'), nullable=True, index=True)
    topic_id = db.Column(db.Integer, db.ForeignKey('agent_topics.id'), nullable=True, index=True)
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id'), nullable=True, index=True)
    group_topic_id = db.Column(db.Integer, nullable=True, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    
    role = db.Column(db.String(20), nullable=False)  # 'user', 'assistant', 'system'
    content = db.Column(db.Text, nullable=False)
    
    # For group chat - which agent responded
    responding_agent_id = db.Column(db.Integer, db.ForeignKey('agents.id'), nullable=True)
    
    # Attachments (stored as JSON array)
    attachments = db.Column(db.Text, nullable=True)
    
    # Message metadata
    token_count = db.Column(db.Integer, nullable=True)
    is_edited = db.Column(db.Boolean, default=False)
    is_deleted = db.Column(db.Boolean, default=False)
    
    # Branching support
    parent_message_id = db.Column(db.Integer, db.ForeignKey('chat_messages.id'), nullable=True)
    branch_name = db.Column(db.String(100), nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Self-referential relationship for branching
    children = db.relationship('ChatMessage', backref=db.backref('parent', remote_side=[id]), lazy='dynamic')
    
    def get_attachments(self):
        if self.attachments:
            return json.loads(self.attachments)
        return []
    
    def set_attachments(self, attachments_list):
        self.attachments = json.dumps(attachments_list)
    
    def to_dict(self):
        return {
            'id': self.id,
            'agent_id': self.agent_id,
            'topic_id': self.topic_id,
            'group_id': self.group_id,
            'group_topic_id': self.group_topic_id,
            'user_id': self.user_id,
            'role': self.role,
            'content': self.content,
            'responding_agent_id': self.responding_agent_id,
            'attachments': self.get_attachments(),
            'token_count': self.token_count,
            'is_edited': self.is_edited,
            'parent_message_id': self.parent_message_id,
            'branch_name': self.branch_name,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
