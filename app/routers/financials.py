from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
import csv
import io
from app.db.session import get_db
from app.schemas.schemas import FuelLogResponse, FuelLogCreate, ExpenseResponse, ExpenseCreate
from app.models.models import FuelLog, Expense, Vehicle, ActivityLog
from app.routers.deps import get_current_user, RoleChecker
from app.services.services import SafetyScoreService

router = APIRouter()

manager_or_finance = RoleChecker(["Fleet Manager", "Financial Analyst"])
any_staff = RoleChecker(["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"])

@router.get("/fuel", response_model=List[FuelLogResponse])
def read_fuel_logs(
    vehicle_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(any_staff)
):
    query = db.query(FuelLog)
    if vehicle_id:
        query = query.filter(FuelLog.vehicle_id == vehicle_id)
    return query.all()

@router.post("/fuel", response_model=FuelLogResponse, status_code=status.HTTP_201_CREATED)
def create_fuel_log(
    log_in: FuelLogCreate,
    db: Session = Depends(get_db),
    current_user = Depends(manager_or_finance)
):
    # Verify vehicle exists
    vehicle = db.query(Vehicle).filter(Vehicle.id == log_in.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
        
    db_obj = FuelLog(
        vehicle_id=log_in.vehicle_id,
        driver_id=log_in.driver_id,
        trip_id=log_in.trip_id,
        quantity=log_in.quantity,
        cost=log_in.cost,
        odometer=log_in.odometer,
        date=log_in.date,
        location=log_in.location,
        created_at=datetime.utcnow()
    )
    db.add(db_obj)
    
    # Side effects: update vehicle odometer if newer odometer reading is higher
    if log_in.odometer > vehicle.odometer:
        vehicle.odometer = log_in.odometer
        db.add(vehicle)
        
    # Log expense
    expense = Expense(
        category="others",  # fuel is tracked separately but counted in total cost
        amount=log_in.cost,
        description=f"Fuel refill: {log_in.quantity}L at {log_in.location}",
        date=log_in.date,
        vehicle_id=log_in.vehicle_id,
        trip_id=log_in.trip_id
    )
    db.add(expense)
    
    # Recalculate dynamic safety score for vehicle (changes efficiency rating)
    SafetyScoreService.calculate_vehicle_score(db, vehicle.id)
    
    # Log Activity
    activity = ActivityLog(
        user_id=current_user.id,
        action="fuel_logged",
        entity_type="vehicle",
        entity_id=vehicle.id,
        description=f"Logged {log_in.quantity}L fuel refill for vehicle {vehicle.registration_number}"
    )
    db.add(activity)
    
    db.commit()
    db.refresh(db_obj)
    return db_obj


@router.get("/expenses", response_model=List[ExpenseResponse])
def read_expenses(
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(any_staff)
):
    query = db.query(Expense)
    if category:
        query = query.filter(Expense.category == category)
    return query.all()

@router.post("/expenses", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(
    expense_in: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user = Depends(manager_or_finance)
):
    db_obj = Expense(
        category=expense_in.category,
        amount=expense_in.amount,
        description=expense_in.description,
        date=expense_in.date,
        vehicle_id=expense_in.vehicle_id,
        trip_id=expense_in.trip_id,
        invoice_url=expense_in.invoice_url,
        created_at=datetime.utcnow()
    )
    db.add(db_obj)
    
    # Log Activity
    vehicle_tag = ""
    if expense_in.vehicle_id:
        vehicle = db.query(Vehicle).filter(Vehicle.id == expense_in.vehicle_id).first()
        if vehicle:
            vehicle_tag = f" for vehicle {vehicle.registration_number}"
            
    activity = ActivityLog(
        user_id=current_user.id,
        action="expense_created",
        description=f"Created expense of ${expense_in.amount:.2f} ({expense_in.category}){vehicle_tag}"
    )
    db.add(activity)
    db.commit()
    db.refresh(db_obj)
    return db_obj


@router.get("/summary")
def get_financial_summary(
    db: Session = Depends(get_db),
    current_user = Depends(any_staff)
):
    # Total fuel cost
    total_fuel = db.query(func.sum(FuelLog.cost)).scalar() or 0.0
    total_fuel_qty = db.query(func.sum(FuelLog.quantity)).scalar() or 0.0
    
    # Total expenses (excluding duplicate fuel logs logged as expenses)
    total_exp = db.query(func.sum(Expense.amount)).filter(Expense.description.like("Fuel refill%") == False).scalar() or 0.0
    total_ops_cost = total_fuel + total_exp
    
    # Total odometer distance from all vehicles
    total_km = db.query(func.sum(Vehicle.odometer)).scalar() or 0.0
    cost_per_km = total_ops_cost / total_km if total_km > 0 else 0.0
    
    # Avg fuel efficiency (KM / L)
    # Using trips completed with fuel logging
    # Simple mock baseline if data is limited:
    avg_efficiency = total_km / total_fuel_qty if total_fuel_qty > 0 else 8.5 # 8.5 km/liter
    
    # Monthly Fuel Cost (Current month)
    first_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    monthly_fuel = db.query(func.sum(FuelLog.cost)).filter(FuelLog.date >= first_of_month).scalar() or 0.0
    monthly_rev = 150000.00  # Hackathon mock revenue base
    
    return {
        "total_operational_cost": total_ops_cost,
        "cost_per_km": cost_per_km,
        "average_mileage_km_l": avg_efficiency,
        "monthly_fuel_cost": monthly_fuel,
        "monthly_revenue": monthly_rev
    }


@router.get("/export/csv")
def export_expenses_csv(
    db: Session = Depends(get_db),
    current_user = Depends(manager_or_finance)
):
    expenses = db.query(Expense).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow(["ID", "Category", "Amount ($)", "Description", "Date", "Vehicle ID", "Trip ID", "Created At"])
    
    # Write rows
    for exp in expenses:
        writer.writerow([
            exp.id, 
            exp.category, 
            exp.amount, 
            exp.description, 
            exp.date.strftime("%Y-%m-%d"), 
            exp.vehicle_id or "N/A", 
            exp.trip_id or "N/A", 
            exp.created_at.strftime("%Y-%m-%d %H:%M:%S")
        ])
        
    output.seek(0)
    
    headers = {
        'Content-Disposition': 'attachment; filename="expenses_report.csv"',
        'Content-Type': 'text/csv'
    }
    
    return StreamingResponse(io.BytesIO(output.getvalue().encode()), headers=headers)
