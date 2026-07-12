import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from sqlalchemy.exc import OperationalError

DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:postgres@localhost:5432/transitiq"
)

# Handle potential MySQL fallback or drivers
if DATABASE_URL.startswith("mysql"):
    # Ensure mysqlclient or pymysql is used if specified
    if not DATABASE_URL.startswith("mysql+pymysql"):
        DATABASE_URL = DATABASE_URL.replace("mysql://", "mysql+pymysql://")

def create_safe_engine(url):
    if url.startswith("sqlite"):
        return create_engine(url, connect_args={"check_same_thread": False})
    
    try:
        # Attempt to initialize PostgreSQL/MySQL connection engine
        eng = create_engine(
            url,
            pool_size=20,
            max_overflow=10,
            pool_timeout=30,
            pool_recycle=1800,
        )
        # Test connection immediately
        with eng.connect() as conn:
            pass
        return eng
    except Exception as e:
        print(f"\n[Database Warning] Failed to connect to database ({url})")
        print(f"Error details: {e}")
        print("[Database Info] Automatically falling back to local SQLite (transitiq.db) for hackathon runtime stability...\n")
        return create_engine(
            "sqlite:///transitiq.db",
            connect_args={"check_same_thread": False}
        )

engine = create_safe_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
