from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import auth, vehicles, drivers, trips, maintenance, financials, notifications, activity, analytics, ai

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="TransitIQ - AI Powered Smart Transport Operations Platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(vehicles.router, prefix=f"{settings.API_V1_STR}/vehicles", tags=["Vehicles"])
app.include_router(drivers.router, prefix=f"{settings.API_V1_STR}/drivers", tags=["Drivers"])
app.include_router(trips.router, prefix=f"{settings.API_V1_STR}/trips", tags=["Trips"])
app.include_router(maintenance.router, prefix=f"{settings.API_V1_STR}/maintenance", tags=["Maintenance"])
app.include_router(financials.router, prefix=f"{settings.API_V1_STR}/financials", tags=["Financials"])
app.include_router(notifications.router, prefix=f"{settings.API_V1_STR}/notifications", tags=["Notifications"])
app.include_router(activity.router, prefix=f"{settings.API_V1_STR}/activity", tags=["Activity Timeline"])
app.include_router(analytics.router, prefix=f"{settings.API_V1_STR}/analytics", tags=["Analytics & Reports"])
app.include_router(ai.router, prefix=f"{settings.API_V1_STR}/ai", tags=["AI Assistant"])

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "docs": "/docs",
        "version": "1.0.0"
    }
