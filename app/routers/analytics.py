from typing import List, Dict, Any
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.models.models import FuelLog, Expense, Driver, Vehicle, Trip
from app.routers.deps import get_current_user, RoleChecker

router = APIRouter()

any_staff = RoleChecker(["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"])

@router.get("/summary")
def get_analytics_summary(
    db: Session = Depends(get_db),
    current_user = Depends(any_staff)
):
    # 1. Total records count
    total_vehicles = db.query(Vehicle).count()
    active_vehicles = db.query(Vehicle).filter(Vehicle.status == "on_trip").count()
    shop_vehicles = db.query(Vehicle).filter(Vehicle.status == "in_shop").count()
    avail_vehicles = db.query(Vehicle).filter(Vehicle.status == "available").count()
    
    total_drivers = db.query(Driver).count()
    active_drivers = db.query(Driver).filter(Driver.status == "on_trip").count()
    avail_drivers = db.query(Driver).filter(Driver.status == "available").count()
    suspended_drivers = db.query(Driver).filter(Driver.status == "suspended").count()
    
    # 2. Avg scores
    avg_driver_safety = db.query(func.avg(Driver.safety_score)).scalar() or 100.0
    avg_vehicle_health = db.query(func.avg(Vehicle.health_score)).scalar() or 100.0
    
    # 3. Trips summary
    total_trips = db.query(Trip).count()
    completed_trips = db.query(Trip).filter(Trip.status == "completed").count()
    pending_trips = db.query(Trip).filter(Trip.status.in_(["draft", "assigned"])).count()
    active_trips = db.query(Trip).filter(Trip.status.in_(["dispatched", "in_transit"])).count()
    delayed_trips = db.query(Trip).filter(Trip.status == "delayed").count()
    
    return {
        "vehicles": {
            "total": total_vehicles,
            "active": active_vehicles,
            "in_maintenance": shop_vehicles,
            "available": avail_vehicles
        },
        "drivers": {
            "total": total_drivers,
            "active": active_drivers,
            "available": avail_drivers,
            "suspended": suspended_drivers
        },
        "avg_driver_safety_score": float(avg_driver_safety),
        "avg_vehicle_health_score": float(avg_vehicle_health),
        "trips": {
            "total": total_trips,
            "completed": completed_trips,
            "pending": pending_trips,
            "active": active_trips,
            "delayed": delayed_trips
        }
    }


@router.get("/charts/fuel-trend")
def get_fuel_trend(
    db: Session = Depends(get_db),
    current_user = Depends(any_staff)
):
    # Retrieve fuel logs grouped by date (latest 7 entries or grouped by day)
    # For hackathon visualization, group by calendar date
    results = db.query(
        func.date(FuelLog.date).label("day"),
        func.sum(FuelLog.cost).label("cost"),
        func.sum(FuelLog.quantity).label("quantity")
    ).group_by("day").order_by("day").limit(10).all()
    
    return [
        {
            "date": (r.day if isinstance(r.day, str) else r.day.strftime("%Y-%m-%d")) if r.day else "",
            "cost": float(r.cost),
            "quantity": float(r.quantity)
        }
        for r in results
    ]


@router.get("/charts/expenses-breakdown")
def get_expenses_breakdown(
    db: Session = Depends(get_db),
    current_user = Depends(any_staff)
):
    # Total expenses breakdown by category
    results = db.query(
        Expense.category,
        func.sum(Expense.amount).label("amount")
    ).group_by(Expense.category).all()
    
    return [
        {"category": r.category.capitalize(), "amount": float(r.amount)}
        for r in results
    ]


@router.get("/rankings/drivers")
def get_driver_rankings(
    db: Session = Depends(get_db),
    current_user = Depends(any_staff)
):
    # Drivers ordered by safety score descending
    drivers = db.query(Driver).order_by(Driver.safety_score.desc()).limit(5).all()
    return [
        {
            "id": d.id,
            "name": d.full_name,
            "safety_score": d.safety_score,
            "trips_completed": d.trips_completed,
            "incidents": d.incidents_count
        }
        for d in drivers
    ]


@router.get("/rankings/vehicles")
def get_vehicle_rankings(
    db: Session = Depends(get_db),
    current_user = Depends(any_staff)
):
    # Vehicles ordered by safety/health score descending
    vehicles = db.query(Vehicle).order_by(Vehicle.safety_score.desc(), Vehicle.health_score.desc()).limit(5).all()
    return [
        {
            "id": v.id,
            "registration_number": v.registration_number,
            "name": v.name,
            "safety_score": v.safety_score,
            "health_score": v.health_score,
            "odometer": v.odometer
        }
        for v in vehicles
    ]
