# StackIt Backend API

A FastAPI-based backend for the StackIt Q&A Forum Platform.

## 🚀 Features

- **Complete Q&A System**: Questions, answers, voting, and user management
- **Tag System**: Categorize questions with tags and filter by tags
- **Search Functionality**: Full-text search across questions and answers
- **User Reputation**: Vote-based reputation system
- **RESTful API**: Clean, documented API endpoints with organized routers
- **Database**: MySQL with proper relationships and indexing (Railway MySQL support)
- **Validation**: Comprehensive input validation using Pydantic v2
- **Documentation**: Auto-generated API docs with Swagger UI
- **Modular Architecture**: Organized router structure for maintainability

## 🏗️ Architecture

```
backend/
├── app/
│   ├── database/
│   │   └── config.py          # Database configuration
│   ├── models/
│   │   └── models.py          # SQLAlchemy models
│   ├── schemas/
│   │   └── schemas.py         # Pydantic schemas
│   ├── services/
│   │   ├── user_service.py    # User business logic
│   │   ├── question_service.py # Question business logic
│   │   ├── answer_service.py  # Answer business logic
│   │   ├── vote_service.py    # Voting business logic
│   │   └── tag_service.py     # Tag business logic
│   ├── routers/
│   │   ├── __init__.py        # Router package
│   │   ├── users.py           # User endpoints
│   │   ├── questions.py       # Question endpoints
│   │   ├── answers.py         # Answer endpoints
│   │   ├── votes.py           # Vote endpoints
│   │   ├── tags.py            # Tag endpoints
│   │   ├── search.py          # Search endpoints
│   │   └── stats.py           # Statistics endpoints
│   └── main.py                # FastAPI application
├── requirements.txt           # Python dependencies
├── setup_database.py         # Database setup script
├── run.py                    # Server run script
└── README.md                 # This file
```

## 📋 Prerequisites

- Python 3.8+
- MySQL 8.0+ (Railway MySQL or local MySQL)
- pip (Python package manager)

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Database Setup

**Option A: Railway MySQL (Recommended for development)**
1. Sign up at [Railway](https://railway.app)
2. Create a new MySQL database
3. Get your connection string from Railway dashboard

**Option B: Local MySQL**
Make sure MySQL is running and create a database:

```sql
CREATE DATABASE stackit_db;
```

### 3. Environment Configuration

Create a `.env` file in the backend directory:

**For Railway MySQL:**
```env
DATABASE_URL=mysql+pymysql://root:your_password@host:port/railway
```

**For Local MySQL:**
```env
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/stackit_db
```

### 4. Initialize Database

Run the setup script to create tables and sample data:

```bash
python setup_database.py
```

### 5. Start the Server

```bash
python run.py
```

Or using uvicorn directly:

```bash
uvicorn app.main:app --reload
```

## 📡 API Endpoints

### Authentication
- `POST /api/users/` - Create a new user
- `GET /api/users/{user_id}` - Get user by ID
- `PUT /api/users/{user_id}` - Update user
- `GET /api/users/` - List all users

### Questions
- `POST /api/questions/` - Create a question
- `GET /api/questions/{question_id}` - Get question with answers
- `PUT /api/questions/{question_id}` - Update question
- `DELETE /api/questions/{question_id}` - Delete question
- `GET /api/questions/` - List questions with search/filter
- `GET /api/questions/user/{user_id}` - Get user's questions
- `POST /api/questions/{question_id}/solve` - Mark as solved

### Answers
- `POST /api/answers/` - Create an answer
- `GET /api/answers/{answer_id}` - Get answer by ID
- `PUT /api/answers/{answer_id}` - Update answer
- `DELETE /api/answers/{answer_id}` - Delete answer
- `GET /api/answers/question/{question_id}` - Get question's answers
- `GET /api/answers/user/{user_id}` - Get user's answers
- `POST /api/answers/{answer_id}/accept` - Accept answer

### Voting
- `POST /api/votes/` - Vote on question/answer
- `GET /api/votes/question/{question_id}` - Get question votes
- `GET /api/votes/answer/{answer_id}` - Get answer votes

### Tags
- `GET /api/tags/` - List all tags
- `GET /api/tags/popular` - Get popular tags
- `GET /api/tags/search` - Search tags
- `GET /api/tags/{tag_name}/questions` - Get questions by tag

### Search
- `GET /api/search/questions` - Search questions

### Statistics
- `GET /api/stats/` - Get platform statistics

## 🔍 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🎯 Key Features for Frontend Integration

### 1. Question Listing (Home Page)
```http
GET /api/questions/?page=1&limit=10&sort_by=created_at&sort_order=desc
```

### 2. Question Search
```http
GET /api/questions/?query=javascript&tags=javascript,react
```

### 3. Tag Filtering (Sidebar)
```http
GET /api/tags/popular?limit=20
GET /api/tags/{tag_name}/questions
```

### 4. Create Question
```http
POST /api/questions/
Content-Type: application/json

{
  "title": "How to handle async operations?",
  "content": "I need help with JavaScript async...",
  "tag_names": ["javascript", "async", "promises"]
}
```

### 5. Vote on Content
```http
POST /api/votes/
Content-Type: application/json

{
  "question_id": "question-uuid",
  "vote_type": 1  // 1 for upvote, -1 for downvote
}
```

## 🗄️ Database Schema

### Users
- `id` (Primary Key)
- `email`, `username`, `display_name`
- `reputation` (calculated from votes)
- `bio`, `avatar_url`

### Questions
- `id` (Primary Key)
- `user_id` (Foreign Key)
- `title`, `content`
- `views`, `vote_count`, `answer_count`
- `is_solved` (boolean)
- `created_at`, `updated_at`

### Answers
- `id` (Primary Key)
- `question_id`, `user_id` (Foreign Keys)
- `content`, `vote_count`
- `is_accepted` (boolean)
- `created_at`, `updated_at`

### Votes
- `id` (Primary Key)
- `user_id` (Foreign Key)
- `question_id` OR `answer_id` (Foreign Key)
- `vote_type` (1 for upvote, -1 for downvote)

### Tags
- `id` (Primary Key)
- `name`, `description`, `color`
- `usage_count` (auto-updated)

## 🔒 Security Features

- Input validation with Pydantic v2
- SQL injection prevention with SQLAlchemy ORM
- CORS configuration for frontend integration
- User ownership checks for CRUD operations
- Vote validation (can't vote on own content)
- Organized router structure for better security management

## 📊 Sample Data

The setup script creates:
- 3 sample users (John Doe, Jane Smith, Bob Wilson)
- 11 sample tags (javascript, python, react, mysql, etc.)
- 5 sample questions (including React optimization, MySQL vs PostgreSQL, etc.)
- 2 sample answers

## 🚀 Production Considerations

For production deployment:
1. Use environment variables for sensitive data (already implemented)
2. Set up proper CORS origins for your frontend domain
3. Add rate limiting and authentication (Auth0 integration planned)
4. Use a production ASGI server (e.g., Gunicorn with Uvicorn workers)
5. Set up database connection pooling
6. Add logging and monitoring
7. Consider using Railway or similar cloud database for production

## 🤝 API Usage Examples

### Get Questions for Home Page
```python
import requests

response = requests.get('http://localhost:8000/api/questions/')
questions = response.json()
```

### Create a Question
```python
import requests

question_data = {
    "title": "How to use React hooks?",
    "content": "I'm learning React hooks and need help...",
    "tag_names": ["react", "javascript", "hooks"]
}

response = requests.post('http://localhost:8000/api/questions/', json=question_data)
```

### Search Questions
```python
import requests

response = requests.get('http://localhost:8000/api/questions/?query=javascript&tags=react')
results = response.json()
```

This backend provides everything needed for your StackIt Q&A platform frontend! 🎉 