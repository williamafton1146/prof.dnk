"""
Скрипт для создания демо-данных
Запустить: python seed_demo_data.py
"""

import requests
import json

API_URL = "http://localhost:8000"

def create_demo_survey():
    """Создает демо опросник по профориентации"""
    
    survey_data = {
        "title": "Диагностика профессиональных предпочтений",
        "description": "Комплексная методика для определения склонностей к различным типам профессий",
        "blocks": [
            {
                "id": "q1",
                "type": "text",
                "question": "Опишите вашу идеальную профессию. Какой вы видите свою работу через 5 лет?",
                "required": True
            },
            {
                "id": "q2",
                "type": "choice",
                "question": "Какой формат работы вам наиболее комфортен?",
                "options": [
                    "Офис - люблю структуру и живое общение",
                    "Удаленка - ценю свободу и гибкость",
                    "Гибридный - лучшее из двух миров",
                    "Постоянные перемещения - энергия движения"
                ],
                "required": True
            },
            {
                "id": "q3",
                "type": "scale",
                "question": "Оцените свой уровень коммуникабельности",
                "scale_min": 1,
                "scale_max": 10,
                "scale_labels": {
                    "1": "Предпочитаю работать в одиночку",
                    "10": "Обожаю работу с людьми"
                },
                "required": True
            },
            {
                "id": "q4",
                "type": "choice",
                "question": "Что для вас важнее всего в работе?",
                "options": [
                    "Высокий доход и карьерный рост",
                    "Интересные задачи и развитие навыков",
                    "Стабильность и предсказуемость",
                    "Возможность помогать людям",
                    "Творческая реализация"
                ],
                "required": True
            },
            {
                "id": "q5",
                "type": "scale",
                "question": "Насколько вы готовы к рискам и неопределенности?",
                "scale_min": 1,
                "scale_max": 10,
                "scale_labels": {
                    "1": "Люблю стабильность и четкость",
                    "10": "Адреналин и вызовы - мое топливо"
                },
                "required": True
            },
            {
                "id": "q6",
                "type": "text",
                "question": "Какие навыки или знания вы хотели бы развивать в своей профессии?",
                "required": True
            },
            {
                "id": "q7",
                "type": "choice",
                "question": "Какой тип задач вам нравится решать?",
                "options": [
                    "Аналитические - данные, логика, расчеты",
                    "Творческие - дизайн, контент, идеи",
                    "Технические - код, железо, системы",
                    "Социальные - общение, переговоры, команда",
                    "Организационные - планирование, координация"
                ],
                "required": True
            },
            {
                "id": "q8",
                "type": "scale",
                "question": "Насколько для вас важен баланс между работой и личной жизнью?",
                "scale_min": 1,
                "scale_max": 10,
                "scale_labels": {
                    "1": "Готов работать 24/7 ради цели",
                    "10": "Баланс - это все для меня"
                },
                "required": True
            }
        ],
        "scoring_formula": {
            "analytical": {
                "questions": {"q3": 0.3, "q5": 0.4, "q7": 0.3}
            },
            "creative": {
                "questions": {"q3": 0.2, "q4": 0.5, "q7": 0.3}
            },
            "social": {
                "questions": {"q3": 0.6, "q4": 0.4}
            }
        }
    }
    
    try:
        response = requests.post(f"{API_URL}/surveys", json=survey_data)
        if response.status_code == 200:
            data = response.json()
            print("✅ Демо опросник создан!")
            print(f"📊 ID: {data['id']}")
            print(f"🔗 Ссылка: {data['share_link']}")
            print(f"📝 Название: {data['title']}")
            return data
        else:
            print(f"❌ Ошибка: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Ошибка подключения: {e}")
        print("Убедитесь, что backend запущен на http://localhost:8000")

if __name__ == "__main__":
    print("🚀 Создание демо-данных для ПрофДНК Platform...")
    print()
    create_demo_survey()
    print()
    print("💡 Теперь вы можете:")
    print("   1. Открыть ссылку и пройти тест")
    print("   2. Зайти в /builder и создать свой опросник")
    print("   3. Посмотреть аналитику в личном кабинете")
