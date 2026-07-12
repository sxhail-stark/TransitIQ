import uuid
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.models import (
    User, Vehicle, Driver, Trip, TripTimeline, MaintenanceRecord, FuelLog, Expense, Notification, SafetyScore, ActivityLog
)
from app.repositories.repositories import (
    user_repo, vehicle_repo, driver_repo, trip_repo, maintenance_repo, fuel_log_repo, expense_repo
)
from app.core.security import verify_password, get_password_hash, create_access_token

class AuthService:
    @staticmethod
    def authenticate_user(db: Session, email: str, password: str, role: str) -> User:
        user = user_repo.get_by_email(db, email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        if not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        if user.role != role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Incorrect role selection. User is registered as {user.role}.",
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User account is deactivated",
            )
        return user

    @staticmethod
    def register_user(db: Session, email: str, password: str, full_name: str, role: str) -> User:
        existing_user = user_repo.get_by_email(db, email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
        hashed_password = get_password_hash(password)
        user_in = {
            "email": email,
            "hashed_password": hashed_password,
            "full_name": full_name,
            "role": role,
            "is_active": True,
        }
        return user_repo.create(db, obj_in=user_in)


class TripService:
    @staticmethod
    def create_trip(db: Session, trip_in: Dict[str, Any]) -> Trip:
        # Validate business rules
        vehicle = vehicle_repo.get(db, trip_in["vehicle_id"])
        driver = driver_repo.get(db, trip_in["driver_id"])
        
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        if not driver:
            raise HTTPException(status_code=404, detail="Driver not found")
            
        # 1. Cargo weight <= vehicle capacity
        if trip_in["cargo_weight"] > vehicle.capacity:
            raise HTTPException(
                status_code=400,
                detail=f"Cargo weight ({trip_in['cargo_weight']} tons) exceeds vehicle capacity ({vehicle.capacity} tons)"
            )
            
        # 2. Vehicle status must be available
        if vehicle.status == "retired":
            raise HTTPException(status_code=400, detail="Cannot dispatch a retired vehicle")
        if vehicle.status == "in_shop":
            raise HTTPException(status_code=400, detail="Cannot dispatch a vehicle that is in maintenance")
        if vehicle.status != "available":
            raise HTTPException(status_code=400, detail=f"Vehicle is not available (Current status: {vehicle.status})")
            
        # 3. Driver status must be available
        if driver.status == "suspended":
            raise HTTPException(status_code=400, detail="Cannot dispatch a suspended driver")
        if driver.status != "available":
            raise HTTPException(status_code=400, detail=f"Driver is not available (Current status: {driver.status})")
            
        # 4. License must be valid (not expired)
        if driver.license_expiry < datetime.utcnow():
            raise HTTPException(
                status_code=400,
                detail=f"Cannot dispatch. Driver's license expired on {driver.license_expiry.strftime('%Y-%m-%d')}"
            )

        # Generate trip number
        trip_number = f"TRIP-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:4].upper()}"
        
        # Create Trip object
        db_trip = Trip(
            trip_number=trip_number,
            source=trip_in["source"],
            destination=trip_in["destination"],
            vehicle_id=trip_in["vehicle_id"],
            driver_id=trip_in["driver_id"],
            cargo_weight=trip_in["cargo_weight"],
            estimated_distance=trip_in["estimated_distance"],
            expected_fuel=trip_in["expected_fuel"],
            dispatch_time=trip_in["dispatch_time"],
            status="assigned"
        )
        
        # Save to DB
        db.add(db_trip)
        db.commit()
        db.refresh(db_trip)
        
        # Log to trip timeline
        timeline_entry = TripTimeline(
            trip_id=db_trip.id,
            status="assigned",
            description=f"Trip assigned to vehicle {vehicle.registration_number} and driver {driver.full_name}",
            timestamp=datetime.utcnow()
        )
        db.add(timeline_entry)
        
        # Add Activity Log
        activity = ActivityLog(
            action="trip_created",
            entity_type="trip",
            entity_id=db_trip.id,
            description=f"Trip {trip_number} created: {db_trip.source} to {db_trip.destination}"
        )
        db.add(activity)
        db.commit()
        
        return db_trip

    @staticmethod
    def update_trip_status(db: Session, trip_id: str, new_status: str, location: Optional[str] = None, description: Optional[str] = None) -> Trip:
        trip = trip_repo.get(db, trip_id)
        if not trip:
            raise HTTPException(status_code=404, detail="Trip not found")
            
        old_status = trip.status
        trip.status = new_status
        trip.updated_at = datetime.utcnow()
        
        # Handle state transitions and side effects
        if new_status == "dispatched" or new_status == "in_transit":
            # Update Vehicle & Driver Status to on_trip
            trip.vehicle.status = "on_trip"
            trip.driver.status = "on_trip"
        elif new_status == "completed":
            trip.completed_at = datetime.utcnow()
            trip.vehicle.status = "available"
            trip.driver.status = "available"
            trip.driver.trips_completed += 1
            # Increment odometer
            trip.vehicle.odometer += trip.estimated_distance
            # Recalculate dynamic scores
            SafetyScoreService.calculate_driver_score(db, trip.driver_id)
            SafetyScoreService.calculate_vehicle_score(db, trip.vehicle_id)
        elif new_status == "cancelled":
            trip.vehicle.status = "available"
            trip.driver.status = "available"
            
        db.add(trip)
        
        # Add to Timeline
        desc = description or f"Trip status changed from {old_status} to {new_status}"
        timeline_entry = TripTimeline(
            trip_id=trip.id,
            status=new_status,
            description=desc,
            location=location,
            timestamp=datetime.utcnow()
        )
        db.add(timeline_entry)
        
        # Add Activity Log
        activity = ActivityLog(
            action="trip_status_updated",
            entity_type="trip",
            entity_id=trip.id,
            description=f"Trip {trip.trip_number} status updated to {new_status}"
        )
        db.add(activity)
        db.commit()
        db.refresh(trip)
        
        return trip


class MaintenanceService:
    @staticmethod
    def create_record(db: Session, record_in: Dict[str, Any]) -> MaintenanceRecord:
        vehicle = vehicle_repo.get(db, record_in["vehicle_id"])
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")
            
        db_record = MaintenanceRecord(**record_in)
        db.add(db_record)
        db.commit()
        db.refresh(db_record)
        
        # Side effect: If scheduled for today or starts immediately
        if db_record.status == "in_progress":
            vehicle.status = "in_shop"
            db.add(vehicle)
            db.commit()
            
        # Log Activity
        activity = ActivityLog(
            action="maintenance_created",
            entity_type="vehicle",
            entity_id=vehicle.id,
            description=f"Maintenance '{db_record.title}' scheduled for vehicle {vehicle.registration_number}"
        )
        db.add(activity)
        db.commit()
        
        return db_record

    @staticmethod
    def update_status(db: Session, record_id: str, new_status: str) -> MaintenanceRecord:
        record = maintenance_repo.get(db, record_id)
        if not record:
            raise HTTPException(status_code=404, detail="Maintenance record not found")
            
        old_status = record.status
        record.status = new_status
        vehicle = record.vehicle
        
        if new_status == "in_progress":
            record.started_at = datetime.utcnow()
            # 1. When Maintenance Starts, Vehicle Status -> In Shop
            vehicle.status = "in_shop"
            db.add(vehicle)
        elif new_status == "completed":
            record.completed_at = datetime.utcnow()
            # 2. When Completed, Vehicle Status -> Available
            vehicle.status = "available"
            # Refresh vehicle maintenance due date (e.g. + 6 months)
            vehicle.maintenance_due = datetime.utcnow() + timedelta(days=180)
            db.add(vehicle)
            
            # Record an expense for it
            expense = Expense(
                category="repair",
                amount=record.cost,
                description=f"Maintenance Cost: {record.title}",
                date=datetime.utcnow(),
                vehicle_id=vehicle.id
            )
            db.add(expense)
            
            # Recalculate dynamic scores
            SafetyScoreService.calculate_vehicle_score(db, vehicle.id)
            
        db.add(record)
        
        # Log Activity
        activity = ActivityLog(
            action="maintenance_status_updated",
            entity_type="vehicle",
            entity_id=vehicle.id,
            description=f"Maintenance '{record.title}' for {vehicle.registration_number} status changed to {new_status}"
        )
        db.add(activity)
        db.commit()
        db.refresh(record)
        
        return record


class SafetyScoreService:
    @staticmethod
    def calculate_driver_score(db: Session, driver_id: str) -> int:
        driver = driver_repo.get(db, driver_id)
        if not driver:
            return 100
            
        # Dynamic base calculation:
        # Start at 100
        # Trips completed add positive weight
        # Incidents subtract heavily (-15 per incident)
        # Suspended status is -50
        # License renewal near expiry subtracts (-5)
        score = 100
        
        score -= (driver.incidents_count * 15)
        
        if driver.status == "suspended":
            score -= 40
            
        days_to_license_expiry = (driver.license_expiry - datetime.utcnow()).days
        if days_to_license_expiry < 0:
            score -= 30
        elif days_to_license_expiry < 30:
            score -= 10
            
        # Trips completed bonus (up to +10)
        trip_bonus = min(10, driver.trips_completed // 5)
        score += trip_bonus
        
        # Cap 0 - 100
        final_score = max(0, min(100, score))
        driver.safety_score = final_score
        db.add(driver)
        
        # Save detail safety log
        detail = SafetyScore(
            entity_type="driver",
            entity_id=driver_id,
            score=final_score,
            component_scores={
                "incidents_penalty": driver.incidents_count * 15,
                "license_status": "expired" if days_to_license_expiry < 0 else "valid",
                "completed_trips_bonus": trip_bonus
            },
            calculation_date=datetime.utcnow()
        )
        db.add(detail)
        db.commit()
        
        return final_score

    @staticmethod
    def calculate_vehicle_score(db: Session, vehicle_id: str) -> int:
        vehicle = vehicle_repo.get(db, vehicle_id)
        if not vehicle:
            return 100
            
        # Start at 100
        # Breakdowns/Maintenance count subtracts
        # Fuel efficiency anomalies
        # Age or health issues
        score = 100
        
        # Maintenance records count
        maint_count = len(vehicle.maintenance_records)
        score -= min(15, maint_count * 3)
        
        # Odometer penalty for wear and tear
        odometer_wear = min(10, int(vehicle.odometer // 50000))
        score -= odometer_wear
        
        # Health score impacts safety
        health_impact = (100 - vehicle.health_score) // 2
        score -= health_impact
        
        final_score = max(0, min(100, score))
        vehicle.safety_score = final_score
        db.add(vehicle)
        
        detail = SafetyScore(
            entity_type="vehicle",
            entity_id=vehicle_id,
            score=final_score,
            component_scores={
                "maintenance_records_penalty": maint_count * 3,
                "mileage_wear_penalty": odometer_wear,
                "health_degradation_penalty": health_impact
            },
            calculation_date=datetime.utcnow()
        )
        db.add(detail)
        db.commit()
        
        return final_score
