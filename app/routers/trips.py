from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.schemas import TripResponse, TripCreate, TripUpdate, TripTimelineResponse
from app.repositories.repositories import trip_repo
from app.models.models import Trip, TripTimeline
from app.services.services import TripService
from app.routers.deps import get_current_user, RoleChecker

router = APIRouter()

manager_or_dispatcher = RoleChecker(["Fleet Manager", "Dispatcher"])
any_staff_or_driver = RoleChecker(["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst", "Driver"])

@router.get("/", response_model=List[TripResponse])
def read_trips(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(any_staff_or_driver)
):
    query = db.query(Trip)
    if status:
        query = query.filter(Trip.status == status)
    return query.all()

@router.get("/{trip_id}", response_model=TripResponse)
def read_trip(
    trip_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(any_staff_or_driver)
):
    trip = trip_repo.get(db, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip

@router.post("/", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
def create_trip(
    trip_in: TripCreate,
    db: Session = Depends(get_db),
    current_user = Depends(manager_or_dispatcher)
):
    # Call service layer containing all dispatcher business validations
    return TripService.create_trip(db, trip_in.dict())

@router.put("/{trip_id}/status", response_model=TripResponse)
def update_trip_status(
    trip_id: str,
    status_update: dict,  # {"status": "in_transit", "location": "Warehouse A", "description": "Departed warehouse"}
    db: Session = Depends(get_db),
    current_user = Depends(any_staff_or_driver)
):
    new_status = status_update.get("status")
    location = status_update.get("location")
    description = status_update.get("description")
    
    if not new_status:
        raise HTTPException(status_code=400, detail="Status is required")
        
    return TripService.update_trip_status(
        db, 
        trip_id=trip_id, 
        new_status=new_status, 
        location=location, 
        description=description
    )

@router.post("/{trip_id}/timeline", response_model=TripTimelineResponse)
def add_trip_timeline(
    trip_id: str,
    timeline_in: dict,  # {"status": "in_transit", "description": "Traffic delay on Highway 101", "location": "Mile 45"}
    db: Session = Depends(get_db),
    current_user = Depends(any_staff_or_driver)
):
    trip = trip_repo.get(db, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    db_timeline = TripTimeline(
        trip_id=trip_id,
        status=timeline_in.get("status", trip.status),
        description=timeline_in.get("description", ""),
        location=timeline_in.get("location"),
    )
    db.add(db_timeline)
    db.commit()
    db.refresh(db_timeline)
    return db_timeline
