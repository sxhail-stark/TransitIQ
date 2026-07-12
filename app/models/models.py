import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Boolean, Integer, Float, DateTime, 
    ForeignKey, Text, JSON, Table, Index
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.session import Base

# Helper to generate UUIDs as strings if needed, or native UUIDs
def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)  # Fleet Manager, Dispatcher, Safety Officer, Financial Analyst, Driver
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    driver_profile = relationship("Driver", back_populates="user", uselist=False)
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    activity_logs = relationship("ActivityLog", back_populates="user")


class Vehicle(Base):
    __tablename__ = "vehicles"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    registration_number = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    model = Column(String(255), nullable=False)
    capacity = Column(Float, nullable=False)  # Cargo capacity in metric tons
    fuel_type = Column(String(50), nullable=False)  # Diesel, Petrol, CNG, EV
    odometer = Column(Float, default=0.0)
    insurance_number = Column(String(100), nullable=False)
    fitness_certificate = Column(String(100), nullable=False)
    rc_number = Column(String(100), nullable=False)
    status = Column(String(50), default="available", index=True)  # available, on_trip, in_shop, retired
    safety_score = Column(Integer, default=100)
    health_score = Column(Integer, default=100)
    maintenance_due = Column(DateTime, nullable=True)
    current_driver_id = Column(String(36), ForeignKey("drivers.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    current_driver = relationship("Driver", foreign_keys=[current_driver_id], back_populates="current_vehicles")
    documents = relationship("VehicleDocument", back_populates="vehicle", cascade="all, delete-orphan")
    trips = relationship("Trip", back_populates="vehicle")
    maintenance_records = relationship("MaintenanceRecord", back_populates="vehicle", cascade="all, delete-orphan")
    fuel_logs = relationship("FuelLog", back_populates="vehicle", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="vehicle", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="vehicle")


class VehicleDocument(Base):
    __tablename__ = "vehicle_documents"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    vehicle_id = Column(String(36), ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False)
    doc_type = Column(String(50), nullable=False)  # insurance, fitness, rc
    doc_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    expiry_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    vehicle = relationship("Vehicle", back_populates="documents")


class Driver(Base):
    __tablename__ = "drivers"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=True, index=True)
    license_number = Column(String(100), unique=True, nullable=False, index=True)
    license_expiry = Column(DateTime, nullable=False)
    phone = Column(String(20), nullable=False)
    photo_url = Column(String(500), nullable=True)
    experience_years = Column(Integer, nullable=False)
    status = Column(String(50), default="available", index=True)  # available, on_trip, suspended
    safety_score = Column(Integer, default=100)
    trips_completed = Column(Integer, default=0)
    incidents_count = Column(Integer, default=0)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="driver_profile")
    current_vehicles = relationship("Vehicle", foreign_keys=[Vehicle.current_driver_id], back_populates="current_driver")
    documents = relationship("DriverDocument", back_populates="driver", cascade="all, delete-orphan")
    trips = relationship("Trip", back_populates="driver")
    fuel_logs = relationship("FuelLog", back_populates="driver")
    notifications = relationship("Notification", back_populates="driver")


class DriverDocument(Base):
    __tablename__ = "driver_documents"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    driver_id = Column(String(36), ForeignKey("drivers.id", ondelete="CASCADE"), nullable=False)
    doc_type = Column(String(50), nullable=False)  # license, medical, others
    doc_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    expiry_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    driver = relationship("Driver", back_populates="documents")


class Trip(Base):
    __tablename__ = "trips"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    trip_number = Column(String(50), unique=True, nullable=False, index=True)
    source = Column(String(255), nullable=False)
    destination = Column(String(255), nullable=False)
    vehicle_id = Column(String(36), ForeignKey("vehicles.id", ondelete="RESTRICT"), nullable=False)
    driver_id = Column(String(36), ForeignKey("drivers.id", ondelete="RESTRICT"), nullable=False)
    cargo_weight = Column(Float, nullable=False)
    estimated_distance = Column(Float, nullable=False)
    expected_fuel = Column(Float, nullable=False)
    actual_fuel = Column(Float, nullable=True)
    dispatch_time = Column(DateTime, nullable=False, index=True)
    status = Column(String(50), default="draft", index=True)  # draft, assigned, dispatched, in_transit, completed, cancelled, delayed
    eta = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    vehicle = relationship("Vehicle", back_populates="trips")
    driver = relationship("Driver", back_populates="trips")
    timeline = relationship("TripTimeline", back_populates="trip", cascade="all, delete-orphan")
    fuel_logs = relationship("FuelLog", back_populates="trip")
    expenses = relationship("Expense", back_populates="trip")
    notifications = relationship("Notification", back_populates="trip")


class TripTimeline(Base):
    __tablename__ = "trip_timeline"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    trip_id = Column(String(36), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String(255), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationships
    trip = relationship("Trip", back_populates="timeline")


class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    vehicle_id = Column(String(36), ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    maintenance_type = Column(String(50), nullable=False)  # routine, repair, inspection
    cost = Column(Float, default=0.0)
    status = Column(String(50), default="scheduled", index=True)  # scheduled, in_progress, completed, overdue
    scheduled_date = Column(DateTime, nullable=False)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    workshop = Column(String(255), nullable=False)
    invoice_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    vehicle = relationship("Vehicle", back_populates="maintenance_records")
    images = relationship("MaintenanceImage", back_populates="maintenance", cascade="all, delete-orphan")


class MaintenanceImage(Base):
    __tablename__ = "maintenance_images"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    maintenance_id = Column(String(36), ForeignKey("maintenance_records.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(String(500), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    maintenance = relationship("MaintenanceRecord", back_populates="images")


class FuelLog(Base):
    __tablename__ = "fuel_logs"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    vehicle_id = Column(String(36), ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False)
    driver_id = Column(String(36), ForeignKey("drivers.id", ondelete="RESTRICT"), nullable=False)
    trip_id = Column(String(36), ForeignKey("trips.id", ondelete="SET NULL"), nullable=True)
    quantity = Column(Float, nullable=False)  # in liters
    cost = Column(Float, nullable=False)
    odometer = Column(Float, nullable=False)
    date = Column(DateTime, nullable=False)
    location = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    vehicle = relationship("Vehicle", back_populates="fuel_logs")
    driver = relationship("Driver", back_populates="fuel_logs")
    trip = relationship("Trip", back_populates="fuel_logs")


class Expense(Base):
    __tablename__ = "expenses"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    category = Column(String(50), nullable=False)  # repair, insurance, tax, toll, others
    amount = Column(Float, nullable=False)
    description = Column(Text, nullable=False)
    date = Column(DateTime, nullable=False)
    vehicle_id = Column(String(36), ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=True)
    trip_id = Column(String(36), ForeignKey("trips.id", ondelete="SET NULL"), nullable=True)
    invoice_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    vehicle = relationship("Vehicle", back_populates="expenses")
    trip = relationship("Trip", back_populates="expenses")


class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), nullable=False)  # license_expiry, maintenance_due, trip_delayed, vehicle_retired, driver_suspended, fuel_anomaly
    priority = Column(String(20), default="medium")  # low, medium, high
    is_read = Column(Boolean, default=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    vehicle_id = Column(String(36), ForeignKey("vehicles.id", ondelete="SET NULL"), nullable=True)
    driver_id = Column(String(36), ForeignKey("drivers.id", ondelete="SET NULL"), nullable=True)
    trip_id = Column(String(36), ForeignKey("trips.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="notifications")
    vehicle = relationship("Vehicle", back_populates="notifications")
    driver = relationship("Driver", back_populates="notifications")
    trip = relationship("Trip", back_populates="notifications")


class SafetyScore(Base):
    __tablename__ = "safety_scores"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    entity_type = Column(String(50), nullable=False)  # driver, vehicle
    entity_id = Column(String(36), nullable=False, index=True)  # UUID of driver or vehicle
    score = Column(Integer, nullable=False)
    component_scores = Column(JSON, nullable=False)  # {"speeding": 90, "harsh_braking": 85, etc.}
    calculation_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)


class ActivityLog(Base):
    __tablename__ = "activity_logs"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(255), nullable=False)
    entity_type = Column(String(50), nullable=True)
    entity_id = Column(String(36), nullable=True)
    description = Column(Text, nullable=False)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="activity_logs")


class AnalyticsCache(Base):
    __tablename__ = "analytics_cache"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    key = Column(String(255), unique=True, nullable=False, index=True)
    value = Column(JSON, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
