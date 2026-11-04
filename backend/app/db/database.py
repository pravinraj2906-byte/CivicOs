from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings

# Configure engine arguments based on database dialect
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """Dependency that yields a database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create all database tables defined in models and ensure schema columns exist."""
    # Import all models to ensure metadata is registered
    import app.db.models  # noqa: F401
    Base.metadata.create_all(bind=engine)

    # Automatically ensure newly added columns exist in SQLite database
    try:
        with engine.connect() as conn:
            result = conn.execute(text("PRAGMA table_info(schemes)"))
            columns = [row[1] for row in result.fetchall()]
            if columns:  # table exists
                scheme_columns = {
                    "target_groups": "TEXT",
                    "eligibility_rules": "TEXT",
                    "required_documents": "TEXT",
                    "official_portal": "VARCHAR(500)",
                    "application_steps": "TEXT",
                    "source_name": "VARCHAR(255)",
                    "source_url": "VARCHAR(500)",
                    "last_verified": "VARCHAR(50)",
                    "name_ta": "VARCHAR(255)",
                    "description_ta": "TEXT",
                    "benefits_ta": "TEXT",
                    "eligibility_criteria_ta": "TEXT",
                    "application_steps_ta": "TEXT",
                }
                for col_name, col_type in scheme_columns.items():
                    if col_name not in columns:
                        conn.execute(text(f"ALTER TABLE schemes ADD COLUMN {col_name} {col_type}"))
                conn.commit()
    except Exception:
        pass
