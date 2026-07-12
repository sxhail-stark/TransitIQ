from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.schemas import DriverResponse, DriverCreate, DriverUpdate, DriverDocumentResponse, DriverDocumentCreate
from app.repositories.repositories import driver_repo
from app.models.models import Driver, DriverDocument, ActivityLog
from app.routers.deps import get_current_user, RoleChecker
from app.services.services import SafetyScoreService

router = APIRouter()

manager_or_safety = RoleChecker(["Fleet Manager", "Safety Officer"])
manager_only = RoleChecker(["Fleet Manager"])
any_staff = RoleChecker(["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"])

@router.get("/", response_model=List[DriverResponse])
def read_drivers(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(any_staff)
):
    query = db.query(Driver)
    if status:
        query = query.filter(Driver.status == status)
    return query.all()

@router.get("/{driver_id}", response_model=DriverResponse)
def read_driver(
    driver_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(any_staff)
):
    driver = driver_repo.get(db, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return driver

@router.post("/", response_model=DriverResponse, status_code=status.HTTP_201_CREATED)
def create_driver(
    driver_in: DriverCreate,
    db: Session = Depends(get_db),
    current_user = Depends(manager_or_safety)
):
    existing = driver_repo.get_by_license(db, driver_in.license_number)
    if existing:
        raise HTTPException(status_code=400, detail="Driver with this license number already exists")
        
    if not driver_in.email:
        raise HTTPException(status_code=400, detail="Driver email is required to register a login account")
        
    from app.models.models import User
    existing_user = db.query(User).filter(User.email == driver_in.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="A user with this email address already exists")
        
    # 1. Create the associated login User
    new_user = User(
        email=driver_in.email,
        full_name=driver_in.full_name,
        hashed_password=get_password_hash("password123"),
        role="Driver",
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # 2. Create the Driver linked to user_id
    driver_data = driver_in.dict(exclude_unset=True)
    driver_data["user_id"] = new_user.id
    
    db_obj = driver_repo.create(db, obj_in=driver_data)
    
    # Calculate initial safety score
    SafetyScoreService.calculate_driver_score(db, db_obj.id)
    
    # Log Activity
    activity = ActivityLog(
        user_id=current_user.id,
        action="driver_added",
        entity_type="driver",
        entity_id=db_obj.id,
        description=f"Driver {db_obj.full_name} (Email: {db_obj.email}) added to fleet"
    )
    db.add(activity)
    db.commit()
    
    return db_obj

@router.put("/{driver_id}", response_model=DriverResponse)
def update_driver(
    driver_id: str,
    driver_in: DriverUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(manager_or_safety)
):
    db_obj = driver_repo.get(db, driver_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Driver not found")
        
    if driver_in.license_number and driver_in.license_number != db_obj.license_number:
        existing = driver_repo.get_by_license(db, driver_in.license_number)
        if existing:
            raise HTTPException(status_code=400, detail="Driver with this license number already exists")
            
    updated_obj = driver_repo.update(db, db_obj=db_obj, obj_in=driver_in)
    
    # Recalculate dynamic safety score if attributes changed
    SafetyScoreService.calculate_driver_score(db, driver_id)
    
    # Log Activity
    activity = ActivityLog(
        user_id=current_user.id,
        action="driver_updated",
        entity_type="driver",
        entity_id=updated_obj.id,
        description=f"Driver {updated_obj.full_name} details updated"
    )
    db.add(activity)
    db.commit()
    
    return updated_obj

@router.delete("/{driver_id}", response_model=DriverResponse)
def delete_driver(
    driver_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(manager_only)
):
    db_obj = driver_repo.get(db, driver_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Driver not found")
        
    if db_obj.status == "on_trip":
        raise HTTPException(status_code=400, detail="Cannot delete a driver currently on an active trip")
        
    removed = driver_repo.remove(db, id=driver_id)
    
    # Log Activity
    activity = ActivityLog(
        user_id=current_user.id,
        action="driver_deleted",
        entity_type="driver",
        entity_id=driver_id,
        description=f"Driver {db_obj.full_name} removed from fleet"
    )
    db.add(activity)
    db.commit()
    
    return removed

@router.post("/{driver_id}/documents", response_model=DriverDocumentResponse)
def add_driver_document(
    driver_id: str,
    doc_in: DriverDocumentCreate,
    db: Session = Depends(get_db),
    current_user = Depends(manager_or_safety)
):
    driver = driver_repo.get(db, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
        
    db_doc = DriverDocument(
        driver_id=driver_id,
        doc_type=doc_in.doc_type,
        doc_name=doc_in.doc_name,
        file_path=doc_in.file_path,
        expiry_date=doc_in.expiry_date
    )
    db.add(db_doc)
    
    activity = ActivityLog(
        user_id=current_user.id,
        action="driver_document_added",
        entity_type="driver",
        entity_id=driver_id,
        description=f"Document '{doc_in.doc_name}' uploaded for driver {driver.full_name}"
    )
    db.add(activity)
    db.commit()
    db.refresh(db_doc)
    return db_doc
