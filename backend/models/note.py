from app import db
from datetime import datetime

class Note(db.Model):
    __tablename__ = 'notes'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    parent_id = db.Column(db.Integer, db.ForeignKey('notes.id'), nullable=True, index=True)
    
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=True)
    is_folder = db.Column(db.Boolean, default=False)
    
    # For sorting
    sort_order = db.Column(db.Integer, default=0)
    
    # Metadata
    is_pinned = db.Column(db.Boolean, default=False)
    is_archived = db.Column(db.Boolean, default=False)
    color = db.Column(db.String(20), nullable=True)
    tags = db.Column(db.String(500), nullable=True)  # Comma-separated tags
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Self-referential relationship for folders
    children = db.relationship('Note', backref=db.backref('parent', remote_side=[id]), lazy='dynamic')
    
    def to_dict(self, include_content=True):
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'parent_id': self.parent_id,
            'title': self.title,
            'is_folder': self.is_folder,
            'sort_order': self.sort_order,
            'is_pinned': self.is_pinned,
            'is_archived': self.is_archived,
            'color': self.color,
            'tags': self.tags.split(',') if self.tags else [],
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'children_count': self.children.count() if self.is_folder else 0
        }
        if include_content and not self.is_folder:
            data['content'] = self.content
        return data
