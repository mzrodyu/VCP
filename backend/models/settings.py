from app import db
from datetime import datetime
import json

class UserSettings(db.Model):
    __tablename__ = 'user_settings'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True, index=True)
    
    # UI Settings
    theme = db.Column(db.String(20), default='dark')
    sidebar_width = db.Column(db.Integer, default=260)
    notifications_sidebar_width = db.Column(db.Integer, default=300)
    
    # Chat Settings
    default_model = db.Column(db.String(100), nullable=True)
    default_temperature = db.Column(db.Float, default=0.7)
    stream_output = db.Column(db.Boolean, default=True)
    
    # API Settings (stored securely)
    vcp_api_url = db.Column(db.String(500), nullable=True)
    vcp_api_key = db.Column(db.String(500), nullable=True)
    
    # Notification Settings
    enable_notifications = db.Column(db.Boolean, default=True)
    notification_sound = db.Column(db.Boolean, default=True)
    
    # Other preferences (stored as JSON)
    preferences = db.Column(db.Text, nullable=True)
    
    # Item order (stored as JSON)
    agent_order = db.Column(db.Text, nullable=True)
    group_order = db.Column(db.Text, nullable=True)
    
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def get_preferences(self):
        if self.preferences:
            return json.loads(self.preferences)
        return {}
    
    def set_preferences(self, prefs):
        self.preferences = json.dumps(prefs, ensure_ascii=False)
    
    def get_agent_order(self):
        if self.agent_order:
            return json.loads(self.agent_order)
        return []
    
    def set_agent_order(self, order):
        self.agent_order = json.dumps(order)
    
    def get_group_order(self):
        if self.group_order:
            return json.loads(self.group_order)
        return []
    
    def set_group_order(self, order):
        self.group_order = json.dumps(order)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'theme': self.theme,
            'sidebar_width': self.sidebar_width,
            'notifications_sidebar_width': self.notifications_sidebar_width,
            'default_model': self.default_model,
            'default_temperature': self.default_temperature,
            'stream_output': self.stream_output,
            'vcp_api_url': self.vcp_api_url,
            'enable_notifications': self.enable_notifications,
            'notification_sound': self.notification_sound,
            'preferences': self.get_preferences(),
            'agent_order': self.get_agent_order(),
            'group_order': self.get_group_order(),
        }
