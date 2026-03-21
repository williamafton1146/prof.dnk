# 🏗️ Техническая архитектура ПрофДНК Platform

## Общая структура системы

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Browser    │  │    Mobile    │  │   Desktop    │         │
│  │  (React UI)  │  │  (Future)    │  │  (Future)    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                            │
                     HTTP/WebSocket
                            │
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                             │
│                     Next.js 14 (App Router)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │     SSR      │  │   CSR Pages  │  │  API Routes  │         │
│  │   Layouts    │  │  Components  │  │   (Future)   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  Libraries:                                                     │
│  - Framer Motion (animations)                                  │
│  - Tailwind CSS (styling)                                      │
│  - Recharts (data viz)                                         │
│  - React Hot Toast (notifications)                             │
└─────────────────────────────────────────────────────────────────┘
                            │
                        REST API
                            │
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND LAYER                              │
│                    FastAPI (Python 3.11)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │     Auth     │  │   Surveys    │  │  Testing     │         │
│  │   Service    │  │   Service    │  │   Service    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   AI Engine  │  │   Reports    │  │  WebSocket   │         │
│  │   (Insights) │  │  Generator   │  │   Manager    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                            │
                      ORM Queries
                            │
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                │
│                   PostgreSQL 16                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │    Users     │  │   Surveys    │  │     Test     │         │
│  │              │  │              │  │   Sessions   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Детальная архитектура Backend

### 1. Auth Service
```python
Endpoints:
- POST /auth/register  # Регистрация с валидацией
- POST /auth/login     # JWT токен генерация

Security:
- Bcrypt hashing (cost factor 12)
- JWT tokens (30 days expiration)
- Role-based access control
```

### 2. Survey Service
```python
Endpoints:
- GET  /surveys           # Список опросников
- POST /surveys           # Создание с валидацией
- GET  /surveys/{id}      # Детали опросника

Features:
- JSON schema для гибкой структуры
- Формулы расчета (scoring_formula)
- Условная логика (logic field)
```

### 3. Testing Service
```python
Endpoints:
- POST /test/{id}/start      # Создание сессии
- POST /test/{token}/answer  # Сохранение ответа
- POST /test/{token}/complete # Завершение + AI

Flow:
1. Клиент стартует сессию → UUID token
2. Каждый ответ сохраняется + WebSocket update
3. Completion → AI insights + results calculation
```

### 4. AI Engine
```python
def generate_ai_insights(answers, structure):
    """
    Анализирует ответы и возвращает:
    - emotional_tone: positive/negative/neutral
    - response_consistency: 0.0 - 1.0
    - thinking_patterns: []
    - recommendations: []
    - risk_flags: []
    """
    
    # Текстовый анализ
    text_answers = filter(is_string, answers.values())
    avg_length = mean(len(a) for a in text_answers)
    
    # Числовой анализ
    numeric_answers = filter(is_numeric, answers.values())
    avg_score = mean(numeric_answers)
    
    # Паттерн-матчинг
    patterns = detect_patterns(answers, structure)
    
    return insights
```

### 5. Report Generator
```python
# DOCX для клиента
doc = Document()
doc.add_heading('Результаты')
doc.add_paragraph(f'Имя: {client_name}')
# + графики, рекомендации, брендинг

# HTML для психолога
html = f"""
<style>/* Custom CSS */</style>
<div class="insights">
  {ai_insights_table}
  {detailed_answers_table}
  {charts_and_graphs}
</div>
"""
```

### 6. WebSocket Manager
```python
class ConnectionManager:
    active_connections: Dict[str, WebSocket]
    
    async def connect(session_token, websocket):
        # Добавить соединение
    
    async def send_progress(session_token, progress):
        # Broadcast обновление
    
    def disconnect(session_token):
        # Очистка
```

---

## Детальная архитектура Frontend

### 1. Pages Structure
```
app/
├── page.tsx              # Landing (анимации, features)
├── login/page.tsx        # Auth форма
├── register/page.tsx     # Регистрация
├── builder/page.tsx      # Конструктор (drag-drop)
├── test/[id]/page.tsx    # Прохождение теста
└── dashboard/page.tsx    # Кабинет психолога (future)
```

### 2. Component Breakdown

#### Landing Page
```typescript
Components:
- AnimatedBackground  # Mouse-reactive gradient
- HeroSection         # Title + CTA buttons
- FeaturesGrid        # 4 карточки с иконками
- StatsSection        # Числовая статистика
- CTASection          # Final call-to-action
```

#### Builder Page
```typescript
Components:
- SurveyInfoForm      # Название и описание
- QuestionTypeSelector # 4 типа кнопок
- QuestionsList       # Reorder.Group (drag-drop)
  └─ QuestionItem     # Editable вопрос
- SaveButton          # API call + копирование ссылки

State Management:
- surveyTitle: string
- surveyDescription: string
- questions: Question[]
- selectedType: QuestionType
```

#### Test Page
```typescript
Screens:
1. Welcome Screen
   - Client info form
   - Survey description
   - Start button

2. Question Screen
   - Progress bar
   - Question card (animated transitions)
   - Answer input (type-specific)
   - Navigation buttons

3. Completion Screen
   - Confetti animation
   - Results preview
   - Download report button

WebSocket Integration:
useEffect(() => {
  const ws = new WebSocket(url);
  ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    setProgress(data.progress);
  };
}, [sessionToken]);
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    username VARCHAR UNIQUE NOT NULL,
    full_name VARCHAR NOT NULL,
    hashed_password VARCHAR NOT NULL,
    role VARCHAR NOT NULL,  -- 'admin' | 'psychologist'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
```

### Surveys Table
```sql
CREATE TABLE surveys (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT,
    creator_id INTEGER REFERENCES users(id),
    structure JSONB NOT NULL,  -- Гибкая схема
    created_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Structure JSON format:
{
  "blocks": [
    {
      "id": "q1",
      "type": "text|choice|scale|matrix",
      "question": "...",
      "options": [...],  -- для choice
      "scale_min": 1,    -- для scale
      "scale_max": 10,   -- для scale
      "required": true,
      "logic": {...}     -- условная логика
    }
  ],
  "scoring_formula": {
    "category_name": {
      "questions": {"q1": 0.5, "q2": 0.3}
    }
  }
}

-- Indexes
CREATE INDEX idx_surveys_creator ON surveys(creator_id);
CREATE INDEX idx_surveys_active ON surveys(is_active);
```

### Test Sessions Table
```sql
CREATE TABLE test_sessions (
    id SERIAL PRIMARY KEY,
    session_token VARCHAR UNIQUE NOT NULL,
    survey_id INTEGER REFERENCES surveys(id),
    client_name VARCHAR NOT NULL,
    client_email VARCHAR,
    client_age INTEGER,
    answers JSONB DEFAULT '{}',
    results JSONB DEFAULT '{}',
    ai_insights JSONB DEFAULT '{}',
    progress FLOAT DEFAULT 0.0,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Answers JSON format:
{
  "q1": "Текстовый ответ",
  "q2": "Выбранный вариант",
  "q3": 8,  -- числовая оценка
}

-- Results JSON format:
{
  "scores": {
    "average": 7.5,
    "total": 45
  },
  "categories": {
    "analytical": 23.4,
    "creative": 15.6,
    "social": 18.9
  },
  "summary": "Краткое описание"
}

-- AI Insights JSON format:
{
  "emotional_tone": "positive|negative|neutral",
  "response_consistency": 0.89,
  "thinking_patterns": [
    "Подробные ответы - высокая вовлеченность"
  ],
  "recommendations": [
    "Клиент демонстрирует оптимистичный настрой"
  ],
  "risk_flags": []
}

-- Indexes
CREATE INDEX idx_sessions_token ON test_sessions(session_token);
CREATE INDEX idx_sessions_survey ON test_sessions(survey_id);
CREATE INDEX idx_sessions_completed ON test_sessions(completed_at);
```

---

## API Flow Examples

### 1. Создание опросника
```
Frontend                     Backend                    Database
   │                            │                           │
   │  POST /surveys             │                           │
   ├──────────────────────────> │                           │
   │  {title, description,      │                           │
   │   blocks, scoring}         │                           │
   │                            │  Validate schema          │
   │                            │  Create Survey            │
   │                            ├─────────────────────────> │
   │                            │                           │
   │                            │ <───────────────────────  │
   │                            │  survey_id = 1            │
   │                            │                           │
   │ <────────────────────────  │                           │
   │  {id: 1,                   │                           │
   │   share_link: "..."}       │                           │
   │                            │                           │
   │  Copy to clipboard         │                           │
   └──────────────────────────> │                           │
```

### 2. Прохождение теста
```
Client                       Backend                  WebSocket    Database
  │                            │                          │           │
  │  GET /surveys/1            │                          │           │
  ├──────────────────────────> │ ──────────────────────────────────> │
  │                            │                          │           │
  │ <──────────────────────────│ <─────────────────────────────────  │
  │  {survey structure}        │                          │           │
  │                            │                          │           │
  │  POST /test/1/start        │                          │           │
  ├──────────────────────────> │                          │           │
  │  {name, email, age}        │  Create session          │           │
  │                            ├────────────────────────────────────> │
  │ <──────────────────────────│                          │           │
  │  {session_token: "uuid"}   │                          │           │
  │                            │                          │           │
  │  Connect WebSocket         │                          │           │
  ├────────────────────────────┼────────────────────────> │           │
  │                            │                          │           │
  │  POST /test/{token}/answer │                          │           │
  ├──────────────────────────> │  Save + Calculate        │           │
  │  {question_id, answer}     │  progress                │           │
  │                            ├────────────────────────────────────> │
  │                            │                          │           │
  │                            │  Broadcast progress      │           │
  │                            ├────────────────────────> │           │
  │ <──────────────────────────┼──────────────────────────│           │
  │  {progress: 25%}           │                          │           │
  │                            │                          │           │
  │  (repeat for each answer)  │                          │           │
  │                            │                          │           │
  │  POST /test/{token}/complete                          │           │
  ├──────────────────────────> │                          │           │
  │                            │  Calculate results       │           │
  │                            │  Generate AI insights    │           │
  │                            ├────────────────────────────────────> │
  │ <──────────────────────────│                          │           │
  │  {results, insights}       │                          │           │
  │                            │                          │           │
  │  GET /reports/{token}/client                          │           │
  ├──────────────────────────> │                          │           │
  │                            │  Generate DOCX           │           │
  │ <──────────────────────────│                          │           │
  │  [file download]           │                          │           │
```

---

## Deployment Architecture

### Docker Compose Setup
```yaml
services:
  db:
    - PostgreSQL 16
    - Persistent volume
    - Health check
  
  backend:
    - Python 3.11
    - FastAPI + Uvicorn
    - Depends on: db
    - Port: 8000
  
  frontend:
    - Node 20
    - Next.js 14
    - Depends on: backend
    - Port: 3000
```

### Production Considerations

#### 1. Scaling
```
Load Balancer
     │
     ├─> Frontend Instance 1
     ├─> Frontend Instance 2
     └─> Frontend Instance 3
              │
        API Gateway
              │
     ├─> Backend Instance 1
     ├─> Backend Instance 2
     └─> Backend Instance 3
              │
     PostgreSQL Cluster
     (Primary + Replicas)
```

#### 2. Caching Layer
```
Redis Cache:
- Session tokens
- Survey structures (hot data)
- User profiles
- AI insights (pre-calculated)
```

#### 3. Background Jobs
```
Celery Workers:
- Email notifications
- Report generation (async)
- AI analysis (heavy compute)
- Data export
```

---

## Security Measures

### 1. Authentication
```python
- Bcrypt password hashing (cost 12)
- JWT tokens (HS256 algorithm)
- Token expiration (30 days)
- Refresh token mechanism (future)
```

### 2. Authorization
```python
@requires_role("psychologist")
def create_survey():
    # Only psychologists can create

@requires_role("admin")
def manage_users():
    # Only admins can manage
```

### 3. Input Validation
```python
# Pydantic models для всех входов
class SurveyCreate(BaseModel):
    title: str
    description: str
    blocks: List[QuestionBlock]
    
    @validator('title')
    def title_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Title cannot be empty')
        return v
```

### 4. CORS Policy
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Production: real domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Performance Optimizations

### 1. Database
- Indexes на часто используемые поля
- Connection pooling
- Query optimization (N+1 problem avoided)

### 2. Frontend
- Next.js SSR для быстрой first paint
- Code splitting
- Image optimization
- Lazy loading компонентов

### 3. Backend
- Async/await для I/O операций
- WebSocket для real-time (вместо polling)
- JSON вместо XML (меньше размер)

---

**Готово к масштабированию и production deployment! 🚀**
