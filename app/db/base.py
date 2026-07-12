# Import all the models, so that Base has them before being
# imported by Alembic
from app.db.session import Base
from app.models.models import (
    User, Vehicle, VehicleDocument, Driver, DriverDocument, Trip, TripTimeline, MaintenanceRecord, MaintenanceImage, FuelLog, Expense, Notification, SafetyScore, ActivityLog, AnalyticsCache
)
