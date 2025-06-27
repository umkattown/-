from flask_sqlalchemy import SQLAlchemy
from src.models.user import db

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(500), nullable=False)
    price = db.Column(db.Float, nullable=False)
    discounted_price = db.Column(db.Float, nullable=True)
    rating = db.Column(db.Float, nullable=True)
    reviews_count = db.Column(db.Integer, nullable=True, default=0)
    wb_id = db.Column(db.String(50), unique=True, nullable=False)  # ID товара на Wildberries
    category = db.Column(db.String(200), nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    def __repr__(self):
        return f'<Product {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'price': self.price,
            'discounted_price': self.discounted_price,
            'rating': self.rating,
            'reviews_count': self.reviews_count,
            'wb_id': self.wb_id,
            'category': self.category,
            'discount_percentage': round(((self.price - (self.discounted_price or self.price)) / self.price) * 100, 2) if self.price > 0 else 0
        }

