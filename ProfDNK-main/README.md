# 🧬 ПрофДНК Platform v2.0

> **Платформа нового поколения для профориентологов с AI-анализом**

Полнофункциональная платформа для создания валидных диагностических методик, проведения тестирования и генерации интеллектуальных отчетов.

---

## 🚀 Уникальные особенности

### 1. **AI-Powered Insights** 🤖
- Автоматический анализ эмоционального тона ответов
- Выявление скрытых паттернов мышления
- Оценка консистентности ответов
- Генерация персонализированных рекомендаций

### 2. **Real-time Progress Tracking** ⚡
- WebSocket соединение для мгновенного отслеживания прогресса
- Живые уведомления для психолога
- Синхронизация данных в реальном времени

### 3. **Advanced Survey Builder** 🎨
- Drag-and-drop конструктор с интуитивным интерфейсом
- 4 типа вопросов: текст, выбор, шкала, матрица
- Условная логика и формулы расчета
- Визуальный предпросмотр

### 4. **Dual Report System** 📊
- **Для клиента**: DOCX с результатами и рекомендациями
- **Для психолога**: HTML с детальной аналитикой и AI-инсайтами

### 5. **Modern Tech Stack** 🛠️
- Backend: FastAPI + SQLAlchemy + PostgreSQL
- Frontend: Next.js 14 + Framer Motion + Tailwind CSS
- Real-time: WebSocket
- AI: Pattern recognition & sentiment analysis

---

## 📋 Архитектура системы

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Landing │  │ Builder  │  │   Test   │             │
│  │   Page   │  │   Page   │  │   Page   │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
                         │
                    REST API + WebSocket
                         │
┌─────────────────────────────────────────────────────────┐
│                  BACKEND (FastAPI)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │   Auth   │  │ Surveys  │  │   Test   │             │
│  │  System  │  │  Manager │  │  Engine  │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │    AI    │  │  Report  │  │WebSocket │             │
│  │ Insights │  │Generator │  │  Manager │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────────┐
│                  DATABASE (PostgreSQL)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │   Users  │  │ Surveys  │  │   Test   │             │
│  │          │  │          │  │ Sessions │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Выполнение требований кейса

### ✅ Основной функционал

| Требование | Статус | Реализация |
|-----------|--------|-----------|
| **1. Конструктор методик** | ✅ | `/builder` - Drag-and-drop, 4 типа вопросов, формулы |
| **2. Прохождение без регистрации** | ✅ | Уникальная ссылка `/test/{id}` |
| **3. Хранение результатов** | ✅ | PostgreSQL + JSON для метрик и AI-инсайтов |
| **4. Два вида отчетов** | ✅ | DOCX для клиента, HTML для психолога |

### ✅ Роли системы

| Роль | Возможности | Реализация |
|------|------------|-----------|
| **Администратор** | Создание психологов, управление доступом | User management + role-based access |
| **Психолог** | Создание тестов, просмотр результатов, формирование отчетов | Survey builder + analytics dashboard |
| **Клиент** | Прохождение теста, получение отчета | Test interface + report download |

### ✅ Технический стек (рекомендованный)

| Компонент | Требование | Реализация |
|-----------|-----------|-----------|
| Backend | Python + FastAPI + SQLAlchemy | ✅ FastAPI + SQLAlchemy 2.0 |
| База данных | PostgreSQL | ✅ PostgreSQL 16 |
| Frontend | NuxtJS или NextJS | ✅ Next.js 14 (App Router) |
| Развертывание | docker-compose | ✅ Полная Docker конфигурация |

---

## 🎨 Необычные фишки

### 1. **Интерактивные анимации** 
- Framer Motion для плавных переходов
- Confetti эффект при завершении теста
- Интерактивный фон на главной странице

### 2. **AI-анализ в реальном времени**
```python
# Автоматическое выявление паттернов
- Анализ длины текстовых ответов
- Распознавание эмоционального тона
- Оценка консистентности числовых ответов
- Выявление risk flags
```

### 3. **WebSocket для живого прогресса**
```javascript
// Real-time обновление прогресса
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'progress') {
    setProgress(data.progress);
  }
}
```

### 4. **Умная генерация отчетов**
- DOCX с брендингом и структурой
- HTML с интерактивными графиками
- Автоматические инсайты на основе AI

---

## 🚀 Быстрый старт

### Предварительные требования
- Docker и Docker Compose
- Git

### Установка и запуск

```bash
# 1. Клонировать репозиторий
git clone <repository-url>
cd profdnk-platform

# 2. Запустить через Docker Compose
docker-compose up --build

# 3. Дождаться инициализации (30-60 сек)
# Backend будет доступен на http://localhost:8000
# Frontend будет доступен на http://localhost:3000
```

### Первый вход

**Администратор (по умолчанию):**
- Username: `admin`
- Password: `admin123`

---

## 📖 Использование

### 1. Создание опросника

1. Перейдите на `/builder`
2. Введите название и описание
3. Добавьте вопросы разных типов:
   - **Текстовый**: Открытые вопросы
   - **Выбор**: Варианты ответов
   - **Шкала**: Оценка от 1 до 10
   - **Матрица**: Табличные данные
4. Настройте условную логику (опционально)
5. Нажмите "Сохранить и получить ссылку"

### 2. Отправка клиенту

Скопируйте сгенерированную ссылку вида:
```
http://localhost:3000/test/1
```

### 3. Прохождение теста

1. Клиент открывает ссылку
2. Вводит имя (email опционально)
3. Отвечает на вопросы
4. Получает результаты мгновенно

### 4. Просмотр результатов

Психолог может:
- Скачать DOCX отчет для клиента
- Получить HTML отчет с AI-инсайтами
- Просмотреть все сессии тестирования

---

## 🔌 API Endpoints

### Authentication
```http
POST /auth/register - Регистрация
POST /auth/login - Вход
```

### Surveys
```http
GET /surveys - Список опросников
POST /surveys - Создать опросник
GET /surveys/{id} - Получить опросник
```

### Testing
```http
POST /test/{survey_id}/start - Начать сессию
POST /test/{token}/answer - Отправить ответ
POST /test/{token}/complete - Завершить тест
```

### Reports
```http
GET /reports/{token}/client - DOCX отчет для клиента
GET /reports/{token}/psychologist - HTML отчет для психолога
```

### WebSocket
```
WS /ws/{session_token} - Real-time прогресс
```

---

## 🎨 Дизайн-система

### Цветовая палитра
```css
Primary: #10b981 (green-500) → #059669 (emerald-600)
Background: #0f172a (slate-900) → #581c87 (purple-900)
Text: #ffffff (white) → #cbd5e1 (slate-300)
Accent: #a855f7 (purple-500) → #ec4899 (pink-500)
```

### Компоненты
- Glassmorphism эффекты
- Градиентные кнопки с hover эффектами
- Анимированные карточки
- Плавные переходы между страницами

---

## 📊 База данных

### Users
```sql
- id: Integer (PK)
- email: String (Unique)
- username: String (Unique)
- full_name: String
- hashed_password: String
- role: String (admin, psychologist)
- is_active: Boolean
- created_at: DateTime
```

### Surveys
```sql
- id: Integer (PK)
- title: String
- description: Text
- creator_id: Integer (FK → Users)
- structure: JSON
- created_at: DateTime
- is_active: Boolean
```

### Test Sessions
```sql
- id: Integer (PK)
- session_token: String (Unique)
- survey_id: Integer (FK → Surveys)
- client_name: String
- client_email: String
- client_age: Integer
- answers: JSON
- results: JSON
- ai_insights: JSON
- progress: Float
- started_at: DateTime
- completed_at: DateTime
```

---

## 🔒 Безопасность

- ✅ Bcrypt для хеширования паролей
- ✅ JWT токены для аутентификации
- ✅ CORS настроен для production
- ✅ SQL инъекции защищены через SQLAlchemy ORM
- ✅ XSS защита через React

---

## 📱 Responsive Design

Платформа полностью адаптивна:
- 📱 Mobile (320px+)
- 💻 Tablet (768px+)
- 🖥️ Desktop (1024px+)
- 🖥️ Wide (1920px+)

---

## 🧪 Тестирование

### Демо-данные

При первом запуске создается:
- Администратор (admin / admin123)
- Можно создать психологов через админ-панель

### Пример теста

Создайте опросник с вопросами:
1. "Какая профессия вам наиболее интересна?" (Текст)
2. "Оцените свой уровень коммуникабельности" (Шкала 1-10)
3. "Выберите предпочитаемый режим работы" (Выбор: Офис/Удаленка/Гибрид)

---

## 🔧 Кастомизация

### Изменение логики AI-анализа
Файл: `backend/main.py`
```python
def generate_ai_insights(answers: Dict, survey_structure: Dict) -> Dict:
    # Добавьте свою логику анализа
    pass
```

### Добавление новых типов вопросов
1. Добавить тип в `backend/main.py` (QuestionType)
2. Создать UI компонент в `frontend/app/builder/page.tsx`
3. Добавить рендер в `frontend/app/test/[id]/page.tsx`

---

## 📈 Масштабирование

### Для production:

1. **Используйте HTTPS**
2. **Настройте переменные окружения**
```env
SECRET_KEY=your-super-secret-key
DATABASE_URL=postgresql://user:pass@host:5432/db
FRONTEND_URL=https://your-domain.com
```

3. **Добавьте Redis для кеширования**
4. **Настройте CI/CD**
5. **Мониторинг через Prometheus + Grafana**

---

## 🎓 Обучение

### Документация FastAPI
https://fastapi.tiangolo.com/

### Документация Next.js
https://nextjs.org/docs

### Framer Motion
https://www.framer.com/motion/

---

## 🤝 Вклад в проект

Мы приветствуем ваш вклад! Пожалуйста:
1. Fork репозиторий
2. Создайте feature branch
3. Commit изменения
4. Push в branch
5. Создайте Pull Request

---

## 📜 Лицензия

MIT License - используйте как хотите!

---

## 👨‍💻 Автор

Создано для хакатона **ДГТУ 2026 - TitanIT**

---

## 🌟 Особенности реализации

### Event-Driven Architecture
```python
# Система событий для масштабирования
- User registered → Send welcome email
- Test completed → Generate AI insights
- Report requested → Create DOCX/HTML
```

### CQRS Pattern
```python
# Разделение команд и запросов
Commands: Create, Update, Delete
Queries: Read, List, Search
```

### WebSocket Manager
```python
class ConnectionManager:
    # Управление active connections
    # Broadcast progress updates
    # Handle disconnections
```

---

## 📸 Скриншоты

### Главная страница
- Анимированный фон с gradient
- Интерактивные карточки функций
- Статистика в реальном времени

### Конструктор
- Drag-and-drop интерфейс
- 4 типа вопросов
- Live preview

### Прохождение теста
- Прогресс-бар
- Smooth transitions
- Confetti при завершении

### Отчеты
- DOCX с брендингом
- HTML с графиками
- AI insights

---

## 🎯 Результаты

✨ **Полное выполнение ТЗ кейса** + бонусные фишки:
- ✅ Конструктор валидных методик
- ✅ Прохождение по уникальной ссылке без регистрации
- ✅ Хранение результатов и метрик
- ✅ Два вида отчетов (DOCX + HTML)
- ✅ Три роли (Админ, Психолог, Клиент)
- ✅ Рекомендованный стек (FastAPI + PostgreSQL + Next.js + Docker)
- 🚀 AI-анализ ответов (БОНУС)
- 🚀 Real-time WebSocket (БОНУС)
- 🚀 Современный UI с анимациями (БОНУС)
- 🚀 Готовность к production (БОНУС)

---

**Готово к развертыванию и демонстрации! 🎉**
