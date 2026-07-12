from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr, Field, field_validator

# --- Token & Authentication ---
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: str
    email: str
    full_name: str

class TokenData(BaseModel):
    user_id: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    role: str
    remember_me: bool = False

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str
    is_active: Optional[bool] = True

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None

class UserResponse(UserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Document Schemas ---
class VehicleDocumentBase(BaseModel):
    doc_type: str
    doc_name: str
    expiry_date: datetime

class VehicleDocumentCreate(VehicleDocumentBase):
    file_path: str

class VehicleDocumentResponse(VehicleDocumentBase):
    id: str
    vehicle_id: str
    file_path: str
    created_at: datetime

    class Config:
        from_attributes = True

class DriverDocumentBase(BaseModel):
    doc_type: str
    doc_name: str
    expiry_date: datetime

class DriverDocumentCreate(DriverDocumentBase):
    file_path: str

class DriverDocumentResponse(DriverDocumentBase):
    id: str
    driver_id: str
    file_path: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Driver Schemas ---
class DriverBase(BaseModel):
    full_name: str
    email: Optional[str] = None
    license_number: str
    license_expiry: datetime
    phone: str
    photo_url: Optional[str] = None
    experience_years: int
    status: Optional[str] = "available"

    @field_validator("license_number")
    @classmethod
    def validate_license(cls, v: str) -> str:
        if not v.isalnum() or len(v) != 16:
            raise ValueError("License number must be exactly a 16-character alphanumeric code")
        return v

class DriverCreate(DriverBase):
    user_id: Optional[str] = None

class DriverUpdate(BaseModel):
    full_name: Optional[str] = None
    license_number: Optional[str] = None
    license_expiry: Optional[datetime] = None
    phone: Optional[str] = None
    photo_url: Optional[str] = None
    experience_years: Optional[int] = None
    status: Optional[str] = None
    safety_score: Optional[int] = None
    trips_completed: Optional[int] = None
    incidents_count: Optional[int] = None
    user_id: Optional[str] = None

class DriverResponse(DriverBase):
    id: str
    safety_score: int
    trips_completed: int
    incidents_count: int
    user_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    documents: List[DriverDocumentResponse] = []

    class Config:
        from_attributes = True

# --- Vehicle Schemas ---
class VehicleBase(BaseModel):
    registration_number: str
    name: str
    model: str
    capacity: float
    fuel_type: str
    odometer: Optional[float] = 0.0
    insurance_number: str
    fitness_certificate: str
    rc_number: str
    status: Optional[str] = "available"

class VehicleCreate(VehicleBase):
    current_driver_id: Optional[str] = None

class VehicleUpdate(BaseModel):
    registration_number: Optional[str] = None
    name: Optional[str] = None
    model: Optional[str] = None
    capacity: Optional[float] = None
    fuel_type: Optional[str] = None
    odometer: Optional[float] = None
    insurance_number: Optional[str] = None
    fitness_certificate: Optional[str] = None
    rc_number: Optional[str] = None
    status: Optional[str] = None
    safety_score: Optional[int] = None
    health_score: Optional[int] = None
    maintenance_due: Optional[datetime] = None
    current_driver_id: Optional[str] = None

class VehicleResponse(VehicleBase):
    id: str
    safety_score: int
    health_score: int
    maintenance_due: Optional[datetime] = None
    current_driver_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    documents: List[VehicleDocumentResponse] = []
    current_driver: Optional[DriverBase] = None

    class Config:
        from_attributes = True

# --- Trip Schemas ---
class TripTimelineResponse(BaseModel):
    id: str
    trip_id: str
    status: str
    description: str
    location: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class TripBase(BaseModel):
    source: str
    destination: str
    vehicle_id: str
    driver_id: str
    cargo_weight: float
    estimated_distance: float
    expected_fuel: float
    dispatch_time: datetime

class TripCreate(TripBase):
    pass

class TripUpdate(BaseModel):
    source: Optional[str] = None
    destination: Optional[str] = None
    vehicle_id: Optional[str] = None
    driver_id: Optional[str] = None
    cargo_weight: Optional[float] = None
    estimated_distance: Optional[float] = None
    expected_fuel: Optional[float] = None
    actual_fuel: Optional[float] = None
    dispatch_time: Optional[datetime] = None
    status: Optional[str] = None
    eta: Optional[datetime] = None
    completed_at: Optional[datetime] = None

class TripResponse(TripBase):
    id: str
    trip_number: str
    actual_fuel: Optional[float] = None
    status: str
    eta: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    vehicle: Optional[VehicleBase] = None
    driver: Optional[DriverBase] = None
    timeline: List[TripTimelineResponse] = []

    class Config:
        from_attributes = True

# --- Maintenance Schemas ---
class MaintenanceImageResponse(BaseModel):
    id: str
    image_url: str
    created_at: datetime

    class Config:
        from_attributes = True

class MaintenanceBase(BaseModel):
    vehicle_id: str
    title: str
    description: str
    maintenance_type: str
    cost: float
    status: Optional[str] = "scheduled"
    scheduled_date: datetime
    workshop: str
    invoice_url: Optional[str] = None

class MaintenanceCreate(MaintenanceBase):
    pass

class MaintenanceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    maintenance_type: Optional[str] = None
    cost: Optional[float] = None
    status: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    workshop: Optional[str] = None
    invoice_url: Optional[str] = None

class MaintenanceResponse(MaintenanceBase):
    id: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    images: List[MaintenanceImageResponse] = []
    vehicle: Optional[VehicleBase] = None

    class Config:
        from_attributes = True

# --- Fuel Log Schemas ---
class FuelLogBase(BaseModel):
    vehicle_id: str
    driver_id: str
    trip_id: Optional[str] = None
    quantity: float
    cost: float
    odometer: float
    date: datetime
    location: str

class FuelLogCreate(FuelLogBase):
    pass

class FuelLogResponse(FuelLogBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Expense Schemas ---
class ExpenseBase(BaseModel):
    category: str
    amount: float
    description: str
    date: datetime
    vehicle_id: Optional[str] = None
    trip_id: Optional[str] = None
    invoice_url: Optional[str] = None

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseResponse(ExpenseBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Notification Schemas ---
class NotificationResponse(BaseModel):
    id: str
    title: str
    message: str
    type: str
    priority: str
    is_read: bool
    user_id: Optional[str] = None
    vehicle_id: Optional[str] = None
    driver_id: Optional[str] = None
    trip_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Safety Score Schemas ---
class SafetyScoreResponse(BaseModel):
    id: str
    entity_type: str
    entity_id: str
    score: int
    component_scores: Dict[str, Any]
    calculation_date: datetime

    class Config:
        from_attributes = True

# --- Activity Log Schemas ---
class ActivityLogResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    action: str
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    description: str
    ip_address: Optional[str] = None
    created_at: datetime
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True

# --- AI Assistant Schemas ---
class AIQueryRequest(BaseModel):
    query: str

class AIQueryResponse(BaseModel):
    answer: str
    data: Optional[Any] = None
    sql_executed: Optional[str] = None
