from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.schemas import AIQueryRequest, AIQueryResponse
from app.services.ai import AIService
from app.routers.deps import get_current_user, RoleChecker

router = APIRouter()

any_staff = RoleChecker(["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"])

@router.post("/query", response_model=AIQueryResponse)
async def query_ai_assistant(
    request: AIQueryRequest,
    db: Session = Depends(get_db),
    current_user = Depends(any_staff)
):
    result = await AIService.process_query(db, request.query)
    return result
