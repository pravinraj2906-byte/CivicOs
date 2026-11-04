from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import init_db, SessionLocal
from app.services.seed_service import seed_database
from app.api.v1.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup & shutdown events."""
    # 1. Initialize database tables
    init_db()
    
    # 2. Seed development fixtures if enabled
    if settings.AUTO_SEED:
        db = SessionLocal()
        try:
            seed_database(db)
        finally:
            db.close()
            
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Intelligent Citizen-Government Interaction Platform Backend API",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# CORS middleware for Flutter mobile app and React web dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["System"])
def health_check():
    """Health check endpoint to verify service availability."""
    return {
        "status": "ok",
        "service": "CivicOS API"
    }


@app.get("/", tags=["System"])
def root():
    """Root endpoint providing quick navigation links."""
    return {
        "message": "Welcome to CivicOS API",
        "version": settings.VERSION,
        "docs": "/docs",
        "health": "/health"
    }


# Include all v1 API routes
app.include_router(api_router, prefix=settings.API_V1_STR)
