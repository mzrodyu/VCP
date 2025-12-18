from app import db
from datetime import datetime
import json

class Agent(db.Model):
    __tablename__ = 'agents'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    avatar_url = db.Column(db.String(500), nullable=True)
    
    # System prompt modules (stored as JSON)
    system_prompt_main = db.Column(db.Text, nullable=True)  # Main system prompt
    system_prompt_jailbreak = db.Column(db.Text, nullable=True)  # Jailbreak prompt
    system_prompt_assistant = db.Column(db.Text, nullable=True)  # Assistant notes
    
    # Model settings
    model = db.Column(db.String(100), nullable=True)
    temperature = db.Column(db.Float, default=0.7)
    context_token_limit = db.Column(db.Integer, default=4000)
    max_output_tokens = db.Column(db.Integer, default=1000)
    top_p = db.Column(db.Float, default=0.9)
    top_k = db.Column(db.Integer, default=40)
    stream_output = db.Column(db.Boolean, default=True)
    
    # Style settings (stored as JSON)
    style_settings = db.Column(db.Text, nullable=True)
    
    # Regex rules (stored as JSON)
    regex_rules = db.Column(db.Text, nullable=True)
    
    # TTS settings
    tts_voice_primary = db.Column(db.String(100), nullable=True)
    tts_regex_primary = db.Column(db.String(200), nullable=True)
    tts_voice_secondary = db.Column(db.String(100), nullable=True)
    tts_regex_secondary = db.Column(db.String(200), nullable=True)
    tts_speed = db.Column(db.Float, default=1.0)
    
    # Visibility
    is_public = db.Column(db.Boolean, default=False)
    
    # Metadata
    sort_order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    topics = db.relationship('AgentTopic', backref='agent', lazy='dynamic', cascade='all, delete-orphan')
    messages = db.relationship('ChatMessage', backref='agent', lazy='dynamic', cascade='all, delete-orphan')
    
    def get_style_settings(self):
        if self.style_settings:
            return json.loads(self.style_settings)
        return {}
    
    def set_style_settings(self, settings):
        self.style_settings = json.dumps(settings)
    
    def get_regex_rules(self):
        if self.regex_rules:
            return json.loads(self.regex_rules)
        return []
    
    def set_regex_rules(self, rules):
        self.regex_rules = json.dumps(rules)
    
    def to_dict(self, include_prompts=False):
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'description': self.description,
            'avatar_url': self.avatar_url,
            'model': self.model,
            'temperature': self.temperature,
            'context_token_limit': self.context_token_limit,
            'max_output_tokens': self.max_output_tokens,
            'top_p': self.top_p,
            'top_k': self.top_k,
            'stream_output': self.stream_output,
            'is_public': self.is_public,
            'sort_order': self.sort_order,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'style_settings': self.get_style_settings(),
            'tts_voice_primary': self.tts_voice_primary,
            'tts_speed': self.tts_speed,
        }
        if include_prompts:
            data['system_prompt_main'] = self.system_prompt_main
            data['system_prompt_jailbreak'] = self.system_prompt_jailbreak
            data['system_prompt_assistant'] = self.system_prompt_assistant
            data['regex_rules'] = self.get_regex_rules()
        return data


class AgentTopic(db.Model):
    __tablename__ = 'agent_topics'
    
    id = db.Column(db.Integer, primary_key=True)
    agent_id = db.Column(db.Integer, db.ForeignKey('agents.id'), nullable=False, index=True)
    name = db.Column(db.String(200), nullable=False, default='主要对话')
    sort_order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    messages = db.relationship('ChatMessage', backref='topic', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'agent_id': self.agent_id,
            'name': self.name,
            'sort_order': self.sort_order,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'message_count': self.messages.count()
        }
