from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.schemas import VehicleResponse, VehicleCreate, VehicleUpdate, VehicleDocumentResponse, VehicleDocumentCreate
from app.repositories.repositories import vehicle_repo
from app.models.models import Vehicle, VehicleDocument, ActivityLog
from app.routers.deps import get_current_user, RoleChecker

router = APIRouter()

# Role checkers
manager_only = RoleChecker(["Fleet Manager"])
manager_or_dispatcher = RoleChecker(["Fleet Manager", "Dispatcher"])
any_staff = RoleChecker(["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"])

@router.get("/", response_model=List[VehicleResponse])
def read_vehicles(
    status: Optional[str] = None,
    fuel_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(any_staff)
):
    query = db.query(Vehicle)
    if status:
        query = query.filter(Vehicle.status == status)
    if fuel_type:
        query = query.filter(Vehicle.fuel_type == fuel_type)
    return query.all()

@router.get("/{vehicle_id}", response_model=VehicleResponse)
def read_vehicle(
    vehicle_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(any_staff)
):
    vehicle = vehicle_repo.get(db, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle

@router.post("/", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
def create_vehicle(
    vehicle_in: VehicleCreate,
    db: Session = Depends(get_db),
    current_user = Depends(manager_only)
):
    existing = vehicle_repo.get_by_registration(db, vehicle_in.registration_number)
    if existing:
        raise HTTPException(status_code=400, detail="Vehicle with this registration number already exists")
    
    db_obj = vehicle_repo.create(db, obj_in=vehicle_in.dict(exclude_unset=True))
    
    # Log Activity
    activity = ActivityLog(
        user_id=current_user.id,
        action="vehicle_added",
        entity_type="vehicle",
        entity_id=db_obj.id,
        description=f"Vehicle {db_obj.registration_number} ({db_obj.name}) added to registry"
    )
    db.add(activity)
    db.commit()
    
    return db_obj

@router.put("/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(
    vehicle_id: str,
    vehicle_in: VehicleUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(manager_only)
):
    db_obj = vehicle_repo.get(db, vehicle_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    if vehicle_in.registration_number and vehicle_in.registration_number != db_obj.registration_number:
        existing = vehicle_repo.get_by_registration(db, vehicle_in.registration_number)
        if existing:
            raise HTTPException(status_code=400, detail="Vehicle with this registration number already exists")
            
    updated_obj = vehicle_repo.update(db, db_obj=db_obj, obj_in=vehicle_in)
    
    # Log Activity
    activity = ActivityLog(
        user_id=current_user.id,
        action="vehicle_updated",
        entity_type="vehicle",
        entity_id=updated_obj.id,
        description=f"Vehicle {updated_obj.registration_number} registry details updated"
    )
    db.add(activity)
    db.commit()
    
    return updated_obj

@router.delete("/{vehicle_id}", response_model=VehicleResponse)
def delete_vehicle(
    vehicle_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(manager_only)
):
    db_obj = vehicle_repo.get(db, vehicle_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    # If vehicle on trip, cannot delete/retire directly
    if db_obj.status == "on_trip":
        raise HTTPException(status_code=400, detail="Cannot delete a vehicle currently on an active trip")
        
    removed = vehicle_repo.remove(db, id=vehicle_id)
    
    # Log Activity
    activity = ActivityLog(
        user_id=current_user.id,
        action="vehicle_deleted",
        entity_type="vehicle",
        entity_id=vehicle_id,
        description=f"Vehicle {db_obj.registration_number} deleted from registry"
    )
    db.add(activity)
    db.commit()
    
    return removed

@router.post("/{vehicle_id}/documents", response_model=VehicleDocumentResponse)
def add_vehicle_document(
    vehicle_id: str,
    doc_in: VehicleDocumentCreate,
    db: Session = Depends(get_db),
    current_user = Depends(manager_only)
):
    vehicle = vehicle_repo.get(db, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
        
    db_doc = VehicleDocument(
        vehicle_id=vehicle_id,
        doc_type=doc_in.doc_type,
        doc_name=doc_in.doc_name,
        file_path=doc_in.file_path,
        expiry_date=doc_in.expiry_date
    )
    db.add(db_doc)
    
    activity = ActivityLog(
        user_id=current_user.id,
        action="vehicle_document_added",
        entity_type="vehicle",
        entity_id=vehicle_id,
        description=f"Document '{doc_in.doc_name}' uploaded for vehicle {vehicle.registration_number}"
    )
    db.add(activity)
    db.commit()
    db.refresh(db_doc)
    return db_doc
