"""
Migration script to add Clerk support to existing database
"""
from sqlalchemy import create_engine, text
from decouple import config

# Database connection
DATABASE_URL = config('DATABASE_URL', default='mysql+pymysql://root:NBLLoCdsFXdbJfwPwkdkUPIrnozOewMH@gondola.proxy.rlwy.net:25577/railway')

def migrate_database():
    engine = create_engine(DATABASE_URL)
    
    try:
        with engine.connect() as conn:
            # Add new columns to users table
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN clerk_id VARCHAR(255) UNIQUE"))
                print("✅ Added clerk_id column")
            except Exception as e:
                print(f"clerk_id column might already exist: {e}")
            
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE"))
                print("✅ Added is_active column")
            except Exception as e:
                print(f"is_active column might already exist: {e}")
            
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN last_login DATETIME"))
                print("✅ Added last_login column")
            except Exception as e:
                print(f"last_login column might already exist: {e}")
            
            # Create index on clerk_id
            try:
                conn.execute(text("CREATE INDEX idx_users_clerk_id ON users(clerk_id)"))
                print("✅ Created index on clerk_id")
            except Exception as e:
                print(f"Index might already exist: {e}")
            
            conn.commit()
            print("✅ Database migration completed successfully!")
            
    except Exception as e:
        print(f"❌ Migration failed: {e}")

if __name__ == "__main__":
    migrate_database() 