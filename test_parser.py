#!/usr/bin/env python3
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from src.main import app
from src.parser.wb_parser import WildberriesParser

def test_parser():
    with app.app_context():
        parser = WildberriesParser()
        
        # Тестируем парсинг небольшого количества товаров
        result = parser.parse_and_save("смартфон", limit=10)
        
        print("Результат парсинга:")
        print(f"Успех: {result['success']}")
        print(f"Сообщение: {result['message']}")
        print(f"Количество: {result['count']}")

if __name__ == "__main__":
    test_parser()

