import requests
import json
import time
from typing import List, Dict, Optional
from src.models.product import Product, db

class WildberriesParser:
    def __init__(self):
        self.base_url = "https://search.wb.ru/exactmatch/ru/common/v4/search"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
        }
    
    def search_products(self, query: str, limit: int = 100) -> List[Dict]:
        """
        Поиск товаров по запросу
        """
        products = []
        page = 1
        
        while len(products) < limit:
            params = {
                'appType': '1',
                'curr': 'rub',
                'dest': '-1257786',
                'page': page,
                'query': query,
                'resultset': 'catalog',
                'sort': 'popular',
                'spp': '0',
                'suppressSpellcheck': 'false'
            }
            
            try:
                response = requests.get(self.base_url, params=params, headers=self.headers)
                response.raise_for_status()
                
                data = response.json()
                
                if 'data' not in data or 'products' not in data['data']:
                    break
                
                page_products = data['data']['products']
                
                if not page_products:
                    break
                
                for product_data in page_products:
                    if len(products) >= limit:
                        break
                    
                    product = self._parse_product(product_data, query)
                    if product:
                        products.append(product)
                
                page += 1
                time.sleep(0.5)  # Задержка между запросами
                
            except Exception as e:
                print(f"Ошибка при парсинге страницы {page}: {e}")
                break
        
        return products
    
    def _parse_product(self, product_data: Dict, category: str) -> Optional[Dict]:
        """
        Парсинг данных одного товара
        """
        try:
            wb_id = str(product_data.get('id', ''))
            name = product_data.get('name', '').strip()
            
            # Цены
            price_data = product_data.get('priceU', 0) / 100  # Цена в копейках
            sale_price_data = product_data.get('salePriceU')
            
            if sale_price_data:
                discounted_price = sale_price_data / 100
                price = price_data
            else:
                price = price_data
                discounted_price = None
            
            # Рейтинг и отзывы
            rating = product_data.get('rating', 0)
            reviews_count = product_data.get('feedbacks', 0)
            
            if not name or not wb_id or price <= 0:
                return None
            
            return {
                'wb_id': wb_id,
                'name': name,
                'price': price,
                'discounted_price': discounted_price,
                'rating': rating,
                'reviews_count': reviews_count,
                'category': category
            }
            
        except Exception as e:
            print(f"Ошибка при парсинге товара: {e}")
            return None
    
    def save_products_to_db(self, products_data: List[Dict]) -> int:
        """
        Сохранение товаров в базу данных
        """
        saved_count = 0
        
        for product_data in products_data:
            try:
                # Проверяем, существует ли товар
                existing_product = Product.query.filter_by(wb_id=product_data['wb_id']).first()
                
                if existing_product:
                    # Обновляем существующий товар
                    existing_product.name = product_data['name']
                    existing_product.price = product_data['price']
                    existing_product.discounted_price = product_data['discounted_price']
                    existing_product.rating = product_data['rating']
                    existing_product.reviews_count = product_data['reviews_count']
                    existing_product.category = product_data['category']
                else:
                    # Создаем новый товар
                    product = Product(
                        wb_id=product_data['wb_id'],
                        name=product_data['name'],
                        price=product_data['price'],
                        discounted_price=product_data['discounted_price'],
                        rating=product_data['rating'],
                        reviews_count=product_data['reviews_count'],
                        category=product_data['category']
                    )
                    db.session.add(product)
                
                saved_count += 1
                
            except Exception as e:
                print(f"Ошибка при сохранении товара {product_data.get('name', 'Unknown')}: {e}")
                continue
        
        try:
            db.session.commit()
            print(f"Успешно сохранено {saved_count} товаров")
        except Exception as e:
            db.session.rollback()
            print(f"Ошибка при сохранении в базу данных: {e}")
            saved_count = 0
        
        return saved_count
    
    def parse_and_save(self, query: str, limit: int = 100) -> Dict:
        """
        Полный цикл парсинга и сохранения
        """
        print(f"Начинаем парсинг товаров по запросу: {query}")
        
        products = self.search_products(query, limit)
        
        if not products:
            return {
                'success': False,
                'message': 'Товары не найдены',
                'count': 0
            }
        
        saved_count = self.save_products_to_db(products)
        
        return {
            'success': True,
            'message': f'Успешно спарсено и сохранено {saved_count} товаров',
            'count': saved_count,
            'query': query
        }

