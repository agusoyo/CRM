import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.engine import Engine
from sqlalchemy.event import listens_for

import os
import shutil

# Define the database URL - using SQLite
# En Vercel el sistema de archivos principal es de solo lectura.
# Si detectamos que estamos en Vercel, copiamos la BD a /tmp (que sí permite escritura).
if os.environ.get("VERCEL") == "1":
    tmp_db_path = "/tmp/crm.db"
    if not os.path.exists(tmp_db_path) and os.path.exists("./crm.db"):
        shutil.copy2("./crm.db", tmp_db_path)
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{tmp_db_path}"
else:
    SQLALCHEMY_DATABASE_URL = "sqlite:///./crm.db"

# Create the engine. For SQLite, connect_args={"check_same_thread": False} is required
# because FastAPI can use multiple threads per request, and SQLite needs to be configured for it.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Enable Foreign Key support in SQLite
@listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

# Create a SessionLocal class for database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative base class for models
Base = declarative_base()

# Dependency to get db session in FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
