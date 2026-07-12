from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.schemas import NotificationResponse
from app.models.models import Notification
from app.routers.deps import get_current_user, RoleChecker

router = APIRouter()

any_staff = RoleChecker(["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"])

@router.get("/", response_model=List[NotificationResponse])
def read_notifications(
    is_read: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user = Depends(any_staff)
):
    query = db.query(Notification)
    if is_read is not None:
        query = query.filter(Notification.is_read == is_read)
    # Return latest first
    return query.order_by(Notification.created_at.desc()).all()

@router.put("/{notif_id}/read", response_model=NotificationResponse)
def mark_notification_read(
    notif_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(any_staff)
):
    notif = db.query(Notification).filter(Notification.id == notif_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notif.is_read = True
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif

@router.put("/read-all")
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user = Depends(any_staff)
):
    db.query(Notification).update({Notification.is_read: True})
    db.commit()
    return {"message": "All notifications marked as read"}
