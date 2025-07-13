#!/usr/bin/env python3
"""
Database setup script for StackIt API
This script creates tables and populates them with sample data
"""

import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add the app directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.models.models import Base, User, Question, Answer, Vote, Tag
from app.database.config import engine

def create_tables():
    """Create all database tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully!")

def create_sample_data():
    """Create sample data for testing"""
    print("Creating sample data...")
    
    # Create a session
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Create sample users
        users = [
            User(
                id="temp-user-123",
                email="john@example.com",
                username="john_doe",
                display_name="John Doe",
                bio="Full-stack developer passionate about web technologies",
                reputation=150
            ),
            User(
                id="user-456",
                email="jane@example.com",
                username="jane_smith",
                display_name="Jane Smith",
                bio="Frontend developer specializing in React",
                reputation=200
            ),
            User(
                id="user-789",
                email="bob@example.com",
                username="bob_wilson",
                display_name="Bob Wilson",
                bio="Backend developer with expertise in Python and databases",
                reputation=180
            )
        ]
        
        for user in users:
            db.add(user)
        
        # Create sample tags
        tags = [
            Tag(name="javascript", description="JavaScript programming language", color="#f7df1e"),
            Tag(name="python", description="Python programming language", color="#3776ab"),
            Tag(name="react", description="React JavaScript library", color="#61dafb"),
            Tag(name="nodejs", description="Node.js runtime environment", color="#339933"),
            Tag(name="mysql", description="MySQL database", color="#4479a1"),
            Tag(name="fastapi", description="FastAPI web framework", color="#009688"),
            Tag(name="css", description="Cascading Style Sheets", color="#1572b6"),
            Tag(name="html", description="HyperText Markup Language", color="#e34f26"),
            Tag(name="git", description="Version control system", color="#f05032"),
            Tag(name="api", description="Application Programming Interface", color="#ff6b6b")
        ]
        
        for tag in tags:
            db.add(tag)
        
        db.commit()
        
        # Create sample questions
        questions = [
            Question(
                user_id="temp-user-123",
                title="How to handle async operations in JavaScript?",
                content="I'm having trouble understanding how to properly handle asynchronous operations in JavaScript. Can someone explain the difference between callbacks, promises, and async/await?",
                views=45,
                vote_count=3,
                answer_count=2
            ),
            Question(
                user_id="user-456",
                title="Best practices for React component optimization",
                content="What are the best practices for optimizing React components? I'm looking for techniques to improve performance in a large application.",
                views=32,
                vote_count=5,
                answer_count=3
            ),
            Question(
                user_id="user-789",
                title="MySQL vs PostgreSQL: Which to choose?",
                content="I'm starting a new project and need to choose between MySQL and PostgreSQL. What are the key differences and use cases for each?",
                views=78,
                vote_count=7,
                answer_count=4
            ),
            Question(
                user_id="temp-user-123",
                title="FastAPI vs Flask: Performance comparison",
                content="Has anyone done a performance comparison between FastAPI and Flask? I'm considering migrating from Flask to FastAPI.",
                views=23,
                vote_count=2,
                answer_count=1
            )
        ]
        
        for question in questions:
            db.add(question)
        
        db.commit()
        
        # Get question IDs after commit
        js_question = db.query(Question).filter(Question.title.like("%async%")).first()
        react_question = db.query(Question).filter(Question.title.like("%React%")).first()
        db_question = db.query(Question).filter(Question.title.like("%MySQL%")).first()
        
        # Associate tags with questions
        js_tag = db.query(Tag).filter(Tag.name == "javascript").first()
        react_tag = db.query(Tag).filter(Tag.name == "react").first()
        python_tag = db.query(Tag).filter(Tag.name == "python").first()
        mysql_tag = db.query(Tag).filter(Tag.name == "mysql").first()
        fastapi_tag = db.query(Tag).filter(Tag.name == "fastapi").first()
        
        if js_question and js_tag:
            js_question.tags.append(js_tag)
            js_tag.usage_count += 1
        
        if react_question and react_tag:
            react_question.tags.append(react_tag)
            react_tag.usage_count += 1
        
        if db_question and mysql_tag:
            db_question.tags.append(mysql_tag)
            mysql_tag.usage_count += 1
        
        # Create sample answers
        answers = [
            Answer(
                question_id=js_question.id,
                user_id="user-456",
                content="Great question! Here's a breakdown of async operations in JavaScript:\n\n**Callbacks**: Functions passed as arguments to other functions, executed after some operation completes.\n\n**Promises**: Objects representing eventual completion/failure of async operations.\n\n**Async/Await**: Syntactic sugar over promises, making async code look more like synchronous code.",
                vote_count=5,
                is_accepted=True
            ),
            Answer(
                question_id=react_question.id,
                user_id="user-789",
                content="Here are key React optimization techniques:\n\n1. **React.memo()** - Prevents unnecessary re-renders\n2. **useMemo()** - Memoizes expensive calculations\n3. **useCallback()** - Memoizes functions\n4. **Code splitting** - Load components on demand\n5. **Virtualization** - For large lists",
                vote_count=3,
                is_accepted=False
            )
        ]
        
        for answer in answers:
            db.add(answer)
        
        db.commit()
        
        # Mark questions as solved if they have accepted answers
        if js_question:
            js_question.is_solved = True
        
        db.commit()
        
        print("✅ Sample data created successfully!")
        
    except Exception as e:
        print(f"❌ Error creating sample data: {e}")
        db.rollback()
    finally:
        db.close()

def main():
    """Main function to set up the database"""
    print("🚀 Setting up StackIt database...")
    
    try:
        create_tables()
        create_sample_data()
        print("✅ Database setup completed successfully!")
        print("\n📋 What was created:")
        print("  - Database tables (users, questions, answers, votes, tags)")
        print("  - 3 sample users")
        print("  - 10 sample tags")
        print("  - 4 sample questions")
        print("  - 2 sample answers")
        print("\n🔧 You can now start the API server with:")
        print("  cd backend && python -m app.main")
        print("  or")
        print("  cd backend && uvicorn app.main:app --reload")
        
    except Exception as e:
        print(f"❌ Database setup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 