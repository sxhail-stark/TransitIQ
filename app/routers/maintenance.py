from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.schemas import MaintenanceResponse, MaintenanceCreate, MaintenanceUpdate
from app.repositories.repositories import maintenance_repo
from app.models.models import MaintenanceRecord, ActivityLog
from app.services.services import MaintenanceService
from app.routers.deps import get_current_user, RoleChecker

router = APIRouter()

manager_or_safety = RoleChecker(["Fleet Manager", "Safety Officer"])
any_staff = RoleChecker(["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"])

@router.get("/", response_model=List[MaintenanceResponse])
def read_maintenance_records(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(any_staff)
):
    query = db.query(MaintenanceRecord)
    if status:
        query = query.filter(MaintenanceRecord.status == status)
    return query.all()

@router.post("/", response_model=MaintenanceResponse, status_code=status.HTTP_201_CREATED)
def create_maintenance_record(
    record_in: MaintenanceCreate,
    db: Session = Depends(get_db),
    current_user = Depends(manager_or_safety)
):
    return MaintenanceService.create_record(db, record_in.dict())

@router.put("/{record_id}/status", response_model=MaintenanceResponse)
def update_maintenance_status(
    record_id: str,
    status_update: dict,  # {"status": "in_progress"}
    db: Session = Depends(get_db),
    current_user = Depends(manager_or_safety)
):
    new_status = status_update.get("status")
    if not new_status:
        raise HTTPException(status_code=400, detail="Status is required")
    return MaintenanceService.update_status(db, record_id, new_status)

@router.put("/{record_id}", response_model=MaintenanceResponse)
def update_maintenance_record(
    record_id: str,
    record_in: MaintenanceUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(manager_or_safety)
):
    db_obj = maintenance_repo.get(db, record_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
        
    updated = maintenance_repo.update(db, db_obj=db_obj, obj_in=record_in)
    return updated
