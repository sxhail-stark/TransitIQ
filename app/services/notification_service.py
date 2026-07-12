from datetime import datetime
from sqlalchemy.orm import Session
from app.models.models import Notification

class NotificationService:
    @staticmethod
    def create_notification(
        db: Session,
        title: str,
        message: str,
        type_: str,
        priority: str = "medium",
        user_id: str = None,
        vehicle_id: str = None,
        driver_id: str = None,
        trip_id: str = None,
    ) -> Notification:
        notif = Notification(
            title=title,
            message=message,
            type=type_,
            priority=priority,
            is_read=False,
            user_id=user_id,
            vehicle_id=vehicle_id,
            driver_id=driver_id,
            trip_id=trip_id,
            created_at=datetime.utcnow()
        )
        db.add(notif)
        db.commit()
        db.refresh(notif)
        return notif

    @classmethod
    def check_and_trigger_alerts(cls, db: Session):
        """
        Background/cron task function to run periodic safety and operations checks.
        It flags items like expiring licenses or upcoming maintenance.
        """
        from app.models.models import Driver, Vehicle
        # 1. Check Driver Licenses
        drivers = db.query(Driver).filter(Driver.status != "suspended").all()
        for driver in drivers:
            days_left = (driver.license_expiry - datetime.utcnow()).days
            if 0 < days_left <= 30:
                # Trigger warning notification
                title = "Driver License Expiring Soon"
                msg = f"Driver {driver.full_name}'s license ({driver.license_number}) expires in {days_left} days."
                # Check if notification already exists
                existing = db.query(Notification).filter(
                    Notification.driver_id == driver.id,
                    Notification.type == "license_expiry",
                    Notification.is_read == False
                ).first()
                if not existing:
                    cls.create_notification(
                        db=db,
                        title=title,
                        message=msg,
                        type_="license_expiry",
                        priority="high",
                        driver_id=driver.id
                    )
            elif days_left <= 0:
                # Expired! Auto suspend or alert.
                title = "Driver License Expired"
                msg = f"Driver {driver.full_name}'s license ({driver.license_number}) has expired. Action required!"
                existing = db.query(Notification).filter(
                    Notification.driver_id == driver.id,
                    Notification.type == "license_expiry",
                    Notification.is_read == False
                ).first()
                if not existing:
                    cls.create_notification(
                        db=db,
                        title=title,
                        message=msg,
                        type_="license_expiry",
                        priority="high",
                        driver_id=driver.id
                    )

        # 2. Check Vehicles Maintenance
        vehicles = db.query(Vehicle).filter(Vehicle.status != "retired").all()
        for vehicle in vehicles:
            if vehicle.maintenance_due and vehicle.status != "in_shop":
                days_left = (vehicle.maintenance_due - datetime.utcnow()).days
                if 0 < days_left <= 7:
                    title = "Maintenance Overdue Soon"
                    msg = f"Vehicle {vehicle.registration_number} is scheduled for maintenance in {days_left} days."
                    existing = db.query(Notification).filter(
                        Notification.vehicle_id == vehicle.id,
                        Notification.type == "maintenance_due",
                        Notification.is_read == False
                    ).first()
                    if not existing:
                        cls.create_notification(
                            db=db,
                            title=title,
                            message=msg,
                            type_="maintenance_due",
                            priority="medium",
                            vehicle_id=vehicle.id
                        )
                elif days_left <= 0:
                    title = "Maintenance Overdue"
                    msg = f"Vehicle {vehicle.registration_number} has missed its scheduled maintenance window."
                    existing = db.query(Notification).filter(
                        Notification.vehicle_id == vehicle.id,
                        Notification.type == "maintenance_due",
                        Notification.is_read == False
                    ).first()
                    if not existing:
                        cls.create_notification(
                            db=db,
                            title=title,
                            message=msg,
                            type_="maintenance_due",
                            priority="high",
                            vehicle_id=vehicle.id
                        )
