from typing import Optional, List
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.models import (
    User, Vehicle, Driver, Trip, MaintenanceRecord, FuelLog, Expense, Notification, TripTimeline
)

class UserRepository(BaseRepository[User]):
    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        return db.query(self.model).filter(self.model.email == email).first()

class VehicleRepository(BaseRepository[Vehicle]):
    def get_by_registration(self, db: Session, reg_num: str) -> Optional[Vehicle]:
        return db.query(self.model).filter(self.model.registration_number == reg_num).first()

class DriverRepository(BaseRepository[Driver]):
    def get_by_license(self, db: Session, license_num: str) -> Optional[Driver]:
        return db.query(self.model).filter(self.model.license_number == license_num).first()

class TripRepository(BaseRepository[Trip]):
    def get_by_number(self, db: Session, trip_num: str) -> Optional[Trip]:
        return db.query(self.model).filter(self.model.trip_number == trip_num).first()

    def get_active_trips(self, db: Session) -> List[Trip]:
        return db.query(self.model).filter(self.model.status.in_(["assigned", "dispatched", "in_transit", "delayed"])).all()

class MaintenanceRepository(BaseRepository[MaintenanceRecord]):
    def get_by_vehicle(self, db: Session, vehicle_id: str) -> List[MaintenanceRecord]:
        return db.query(self.model).filter(self.model.vehicle_id == vehicle_id).all()

class FuelLogRepository(BaseRepository[FuelLog]):
    def get_by_vehicle(self, db: Session, vehicle_id: str) -> List[FuelLog]:
        return db.query(self.model).filter(self.model.vehicle_id == vehicle_id).all()

class ExpenseRepository(BaseRepository[Expense]):
    def get_by_vehicle(self, db: Session, vehicle_id: str) -> List[Expense]:
        return db.query(self.model).filter(self.model.vehicle_id == vehicle_id).all()

user_repo = UserRepository(User)
vehicle_repo = VehicleRepository(Vehicle)
driver_repo = DriverRepository(Driver)
trip_repo = TripRepository(Trip)
maintenance_repo = MaintenanceRepository(MaintenanceRecord)
fuel_log_repo = FuelLogRepository(FuelLog)
expense_repo = ExpenseRepository(Expense)
