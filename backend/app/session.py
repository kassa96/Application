from fastapi.concurrency import run_in_threadpool
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from pathlib import Path
from app.config import test_settings
env_path = Path(__file__).resolve().parent.parent / '.env'  
print(env_path)
load_dotenv(dotenv_path=env_path)
DATABASE_URL = test_settings.DATABASE_URL
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_session_direct():
    return SessionLocal()
