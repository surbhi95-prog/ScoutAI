from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings

# How does your application connect to the database
# it'll provide connection to the db
# pip install pydantic-settings dotenv
# SessionLocal = API req will open a session, when done the session is closed
# engine = knows where your db lives (host, port, pass, username, etc)
# Base = Whenever you create a Python class that inherits from Base, I'll automatically convert it into a MySQL table.

class Base(DeclarativeBase): # every class will inherit this
    pass #if it does not inherit, SQLAAlch will ignore it, iherited class ==>mysql db table

engine = create_engine( # engine obj
    settings.DATABASE_URL,
    echo=True
)

# each req will have its own session
SessionLocal = sessionmaker(
    bind= engine, # connects with mysql engine we created above
    autoflush=False, # do not automatically send changes to the db
    autocommit= False # do not save changes automatically
)

def get_db():
    db = SessionLocal() # gives a database session to a FastAPI endpoint and guarantees it gets closed, even if an error occurs.
    try:
        yield db
    finally:
        db.close()