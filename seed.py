from datetime import datetime, timedelta
import uuid
from app.db.session import SessionLocal, engine, Base
from app.models.models import (
    User, Vehicle, VehicleDocument, Driver, DriverDocument, Trip, TripTimeline, MaintenanceRecord, FuelLog, Expense, Notification, SafetyScore, ActivityLog
)
from app.core.security import get_password_hash

def seed_db():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if database is already seeded
        if db.query(User).first():
            print("Database already seeded. Skipping.")
            return

        print("Seeding users...")
        users = [
            User(
                email="manager@transitiq.com",
                hashed_password=get_password_hash("password123"),
                full_name="Alex Mercer",
                role="Fleet Manager",
                is_active=True
            ),
            User(
                email="dispatcher@transitiq.com",
                hashed_password=get_password_hash("password123"),
                full_name="Sarah Jenkins",
                role="Dispatcher",
                is_active=True
            ),
            User(
                email="safety@transitiq.com",
                hashed_password=get_password_hash("password123"),
                full_name="Marcus Vance",
                role="Safety Officer",
                is_active=True
            ),
            User(
                email="finance@transitiq.com",
                hashed_password=get_password_hash("password123"),
                full_name="Elena Rostova",
                role="Financial Analyst",
                is_active=True
            ),
            User(
                email="driver1@transitiq.com",
                hashed_password=get_password_hash("password123"),
                full_name="John Doe",
                role="Driver",
                is_active=True
            ),
            User(
                email="driver2@transitiq.com",
                hashed_password=get_password_hash("password123"),
                full_name="Jane Smith",
                role="Driver",
                is_active=True
            ),
            User(
                email="driver3@transitiq.com",
                hashed_password=get_password_hash("password123"),
                full_name="Robert Miller",
                role="Driver",
                is_active=True
            ),
            User(
                email="driver4@transitiq.com",
                hashed_password=get_password_hash("password123"),
                full_name="David Davis",
                role="Driver",
                is_active=True
            )
        ]
        for u in users:
            db.add(u)
        db.commit()

        # Get seeded user objects
        mgr = db.query(User).filter(User.email == "manager@transitiq.com").first()
        drv_user_1 = db.query(User).filter(User.email == "driver1@transitiq.com").first()
        drv_user_2 = db.query(User).filter(User.email == "driver2@transitiq.com").first()
        drv_user_3 = db.query(User).filter(User.email == "driver3@transitiq.com").first()
        drv_user_4 = db.query(User).filter(User.email == "driver4@transitiq.com").first()

        print("Seeding drivers...")
        drivers = [
            Driver(
                id=str(uuid.uuid4()),
                full_name="John Doe",
                email="driver1@transitiq.com",
                license_number="DL92847194ABCDEF",
                license_expiry=datetime.utcnow() + timedelta(days=45),
                phone="+1 (555) 123-4567",
                experience_years=8,
                status="available",
                safety_score=94,
                trips_completed=48,
                incidents_count=0,
                user_id=drv_user_1.id
            ),
            Driver(
                id=str(uuid.uuid4()),
                full_name="Jane Smith",
                email="driver2@transitiq.com",
                license_number="DL10928475ABCDEF",
                license_expiry=datetime.utcnow() + timedelta(days=120),
                phone="+1 (555) 987-6543",
                experience_years=5,
                status="available",
                safety_score=88,
                trips_completed=32,
                incidents_count=1,
                user_id=drv_user_2.id
            ),
            Driver(
                id=str(uuid.uuid4()),
                full_name="Robert Miller",
                email="driver3@transitiq.com",
                license_number="DL83749281ABCDEF",
                license_expiry=datetime.utcnow() + timedelta(days=12),  # Warning status
                phone="+1 (555) 456-7890",
                experience_years=12,
                status="available",
                safety_score=97,
                trips_completed=114,
                incidents_count=0,
                user_id=drv_user_3.id
            ),
            Driver(
                id=str(uuid.uuid4()),
                full_name="David Davis",
                email="driver4@transitiq.com",
                license_number="DL47391028ABCDEF",
                license_expiry=datetime.utcnow() - timedelta(days=5),  # Expired license
                phone="+1 (555) 321-7654",
                experience_years=3,
                status="suspended",
                safety_score=60,
                trips_completed=15,
                incidents_count=3,
                user_id=drv_user_4.id
            )
        ]
        for d in drivers:
            db.add(d)
        db.commit()

        # Fetch driver objects
        d1 = db.query(Driver).filter(Driver.full_name == "John Doe").first()
        d2 = db.query(Driver).filter(Driver.full_name == "Jane Smith").first()
        d3 = db.query(Driver).filter(Driver.full_name == "Robert Miller").first()
        d4 = db.query(Driver).filter(Driver.full_name == "David Davis").first()

        print("Seeding vehicles...")
        vehicles = [
            Vehicle(
                id=str(uuid.uuid4()),
                registration_number="TX-987-AB",
                name="Freightliner Cascadia",
                model="Cascadia 2022",
                capacity=15.0,
                fuel_type="Diesel",
                odometer=84500.0,
                insurance_number="INS-998811",
                fitness_certificate="FIT-882200",
                rc_number="RC-773344",
                status="available",
                safety_score=92,
                health_score=95,
                maintenance_due=datetime.utcnow() + timedelta(days=25),
                current_driver_id=d1.id
            ),
            Vehicle(
                id=str(uuid.uuid4()),
                registration_number="TX-456-CD",
                name="Volvo VNL 860",
                model="VNL 860 2023",
                capacity=18.0,
                fuel_type="Diesel",
                odometer=42300.0,
                insurance_number="INS-112233",
                fitness_certificate="FIT-334455",
                rc_number="RC-556677",
                status="available",
                safety_score=96,
                health_score=98,
                maintenance_due=datetime.utcnow() + timedelta(days=60),
                current_driver_id=d2.id
            ),
            Vehicle(
                id=str(uuid.uuid4()),
                registration_number="TX-112-EF",
                name="Peterbilt 579",
                model="579 EV 2023",
                capacity=12.0,
                fuel_type="EV",
                odometer=12800.0,
                insurance_number="INS-445566",
                fitness_certificate="FIT-667788",
                rc_number="RC-889900",
                status="on_trip",
                safety_score=85,
                health_score=89,
                maintenance_due=datetime.utcnow() + timedelta(days=14),
                current_driver_id=d3.id
            ),
            Vehicle(
                id=str(uuid.uuid4()),
                registration_number="TX-554-GH",
                name="Kenworth T680",
                model="T680 2021",
                capacity=20.0,
                fuel_type="CNG",
                odometer=156900.0,
                insurance_number="INS-778899",
                fitness_certificate="FIT-990011",
                rc_number="RC-112244",
                status="in_shop",  # In shop maintenance
                safety_score=78,
                health_score=68,
                maintenance_due=datetime.utcnow() - timedelta(days=2)  # Overdue
            )
        ]
        for v in vehicles:
            db.add(v)
        db.commit()

        # Fetch vehicle objects
        v1 = db.query(Vehicle).filter(Vehicle.registration_number == "TX-987-AB").first()
        v2 = db.query(Vehicle).filter(Vehicle.registration_number == "TX-456-CD").first()
        v3 = db.query(Vehicle).filter(Vehicle.registration_number == "TX-112-EF").first()
        v4 = db.query(Vehicle).filter(Vehicle.registration_number == "TX-554-GH").first()

        print("Seeding documents...")
        docs = [
            VehicleDocument(
                vehicle_id=v1.id,
                doc_type="insurance",
                doc_name="Commercial Fleet Insurance policy",
                file_path="/uploads/docs/TX-987-AB_ins.pdf",
                expiry_date=datetime.utcnow() + timedelta(days=180)
            ),
            VehicleDocument(
                vehicle_id=v1.id,
                doc_type="fitness",
                doc_name="State Vehicle Fitness Certificate",
                file_path="/uploads/docs/TX-987-AB_fit.pdf",
                expiry_date=datetime.utcnow() + timedelta(days=90)
            ),
            DriverDocument(
                driver_id=d1.id,
                doc_type="license",
                doc_name="Commercial Driver License Class A",
                file_path="/uploads/docs/JohnDoe_CDL.pdf",
                expiry_date=d1.license_expiry
            )
        ]
        for doc in docs:
            db.add(doc)
        db.commit()

        print("Seeding trips...")
        trips = [
            Trip(
                trip_number="TRIP-20260712-001",
                source="Port of Houston, TX",
                destination="Distribution Center, Dallas TX",
                vehicle_id=v3.id,
                driver_id=d3.id,
                cargo_weight=10.5,
                estimated_distance=390.0,
                expected_fuel=117.0,
                dispatch_time=datetime.utcnow() - timedelta(hours=3),
                status="in_transit",
                eta=datetime.utcnow() + timedelta(hours=2)
            ),
            Trip(
                trip_number="TRIP-20260711-002",
                source="Warehouse 12, Chicago IL",
                destination="Retail Outlet, St. Louis MO",
                vehicle_id=v1.id,
                driver_id=d1.id,
                cargo_weight=14.0,
                estimated_distance=470.0,
                expected_fuel=141.0,
                actual_fuel=138.0,
                dispatch_time=datetime.utcnow() - timedelta(days=1, hours=8),
                completed_at=datetime.utcnow() - timedelta(days=1, hours=2),
                status="completed"
            ),
            Trip(
                trip_number="TRIP-20260712-003",
                source="Logistics Hub, Austin TX",
                destination="Port of Houston, TX",
                vehicle_id=v2.id,
                driver_id=d2.id,
                cargo_weight=16.5,
                estimated_distance=260.0,
                expected_fuel=78.0,
                dispatch_time=datetime.utcnow() + timedelta(hours=6),
                status="assigned"
            )
        ]
        for t in trips:
            db.add(t)
        db.commit()

        t1 = db.query(Trip).filter(Trip.trip_number == "TRIP-20260712-001").first()
        t2 = db.query(Trip).filter(Trip.trip_number == "TRIP-20260711-002").first()

        print("Seeding timelines...")
        timelines = [
            TripTimeline(
                trip_id=t1.id,
                status="assigned",
                description="Trip scheduled and assigned to Robert Miller with Peterbilt 579",
                timestamp=datetime.utcnow() - timedelta(hours=4)
            ),
            TripTimeline(
                trip_id=t1.id,
                status="dispatched",
                description="Vehicle departed Houston port gate 4. Cargo sealed.",
                location="Houston, TX",
                timestamp=datetime.utcnow() - timedelta(hours=3)
            ),
            TripTimeline(
                trip_id=t1.id,
                status="in_transit",
                description="Passing checking post mile 120. Battery state of charge 75%.",
                location="Huntsville, TX",
                timestamp=datetime.utcnow() - timedelta(hours=1.5)
            ),
            TripTimeline(
                trip_id=t2.id,
                status="completed",
                description="Cargo delivered, signed off by site manager. Vehicle available.",
                location="St. Louis, MO",
                timestamp=t2.completed_at
            )
        ]
        for tl in timelines:
            db.add(tl)

        print("Seeding maintenance...")
        maint = [
            MaintenanceRecord(
                vehicle_id=v4.id,
                title="Hydraulic Brake Line Replacement",
                description="Brake line leakage discovered during pre-trip inspection. Replacing hoses and refilling fluid.",
                maintenance_type="repair",
                cost=750.0,
                status="in_progress",
                scheduled_date=datetime.utcnow() - timedelta(days=1),
                started_at=datetime.utcnow() - timedelta(hours=18),
                workshop="Downtown Fleet Repair Shop"
            ),
            MaintenanceRecord(
                vehicle_id=v1.id,
                title="Engine Oil & Filter Change",
                description="Routine 15,000 miles engine service.",
                maintenance_type="routine",
                cost=250.0,
                status="completed",
                scheduled_date=datetime.utcnow() - timedelta(days=10),
                started_at=datetime.utcnow() - timedelta(days=10),
                completed_at=datetime.utcnow() - timedelta(days=10, hours=2),
                workshop="Mobile Fleet Lube Services"
            ),
            MaintenanceRecord(
                vehicle_id=v2.id,
                title="Tire Rotation and Balancing",
                description="Scheduled rotation of all 18 tires.",
                maintenance_type="routine",
                cost=380.0,
                status="scheduled",
                scheduled_date=datetime.utcnow() + timedelta(days=15),
                workshop="Volvo Truck Care Austin"
            )
        ]
        for m in maint:
            db.add(m)
        db.commit()

        print("Seeding fuel logs...")
        fuel = [
            FuelLog(
                vehicle_id=v1.id,
                driver_id=d1.id,
                trip_id=t2.id,
                quantity=138.0,
                cost=648.60,
                odometer=84030.0,
                date=datetime.utcnow() - timedelta(days=1, hours=4),
                location="Loves Travel Stop #391, Illinois"
            ),
            FuelLog(
                vehicle_id=v2.id,
                driver_id=d2.id,
                quantity=95.0,
                cost=456.00,
                odometer=42300.0,
                date=datetime.utcnow() - timedelta(days=2),
                location="Pilot Flying J, Texas"
            )
        ]
        for f in fuel:
            db.add(f)

        print("Seeding expenses...")
        expenses = [
            Expense(
                category="repair",
                amount=250.0,
                description="Engine Oil & Filter Change (Routine Maintenance)",
                date=datetime.utcnow() - timedelta(days=10),
                vehicle_id=v1.id
            ),
            Expense(
                category="toll",
                amount=45.50,
                description="Highway toll charges Illinois to Missouri",
                date=datetime.utcnow() - timedelta(days=1),
                vehicle_id=v1.id,
                trip_id=t2.id
            ),
            Expense(
                category="insurance",
                amount=1200.00,
                description="Monthly commercial vehicle insurance allocation",
                date=datetime.utcnow() - timedelta(days=5),
                vehicle_id=v2.id
            )
        ]
        for e in expenses:
            db.add(e)

        print("Seeding alerts / notifications...")
        notifications = [
            Notification(
                title="Driver License Renewal Overdue",
                message="David Davis's license has expired. Please suspend the driver from dispatches.",
                type="license_expiry",
                priority="high",
                is_read=False,
                driver_id=d4.id
            ),
            Notification(
                title="Vehicle Maintenance Window Approaching",
                message="Peterbilt 579 is due for inspection in 14 days.",
                type="maintenance_due",
                priority="medium",
                is_read=False,
                vehicle_id=v3.id
            )
        ]
        for n in notifications:
            db.add(n)

        print("Seeding activity log...")
        activities = [
            ActivityLog(
                user_id=mgr.id,
                action="user_login",
                description="Fleet Manager logged in from 192.168.1.100"
            ),
            ActivityLog(
                user_id=mgr.id,
                action="vehicle_added",
                entity_type="vehicle",
                entity_id=v1.id,
                description=f"Vehicle {v1.registration_number} added to registry"
            )
        ]
        for act in activities:
            db.add(act)

        print("Seeding safety scores...")
        scores = [
            SafetyScore(
                entity_type="driver",
                entity_id=d1.id,
                score=94,
                component_scores={"speeding": 95, "braking": 90, "compliance": 100}
            ),
            SafetyScore(
                entity_type="driver",
                entity_id=d2.id,
                score=88,
                component_scores={"speeding": 80, "braking": 90, "compliance": 95}
            ),
            SafetyScore(
                entity_type="vehicle",
                entity_id=v1.id,
                score=92,
                component_scores={"engine_health": 95, "brakes_health": 90, "fuel_efficiency": 90}
            )
        ]
        for s in scores:
            db.add(s)

        db.commit()
        print("Database seeding completed successfully!")
    except Exception as err:
        db.rollback()
        print(f"Error during seeding: {err}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
