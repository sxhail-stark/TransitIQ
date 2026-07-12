from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.schemas import ActivityLogResponse
from app.models.models import ActivityLog
from app.routers.deps import get_current_user, RoleChecker

router = APIRouter()

any_staff = RoleChecker(["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"])

@router.get("/", response_model=List[ActivityLogResponse])
def read_activity_logs(
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(any_staff)
):
    # Fetch audit logs latest first
    return db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(limit).all()
