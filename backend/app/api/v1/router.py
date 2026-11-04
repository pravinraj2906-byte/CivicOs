from fastapi import APIRouter
from app.api.v1 import auth, citizens, grievances, officer, schemes, ai, feed

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(citizens.router)
api_router.include_router(grievances.router)
api_router.include_router(officer.router)
api_router.include_router(schemes.router)
api_router.include_router(ai.router)
api_router.include_router(feed.router)


