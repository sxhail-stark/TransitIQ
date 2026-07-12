from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.schemas import Token, LoginRequest, UserResponse, UserCreate
from app.services.services import AuthService
from app.routers.deps import get_current_user
from app.models.models import User

router = APIRouter()

@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = AuthService.authenticate_user(
        db, email=login_data.email, password=login_data.password, role=login_data.role
    )
    expires_delta = timedelta(days=7) if login_data.remember_me else timedelta(hours=12)
    access_token = create_access_token(user.id, expires_delta=expires_delta)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id,
        "email": user.email,
        "full_name": user.full_name
    }

# Standard OAuth2 form login for OpenAPI swagger compatibility
@router.post("/login/oauth2", response_model=Token)
def login_oauth2(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Standard forms don't have separate role inputs, so we look for matching user in any role
    from app.repositories.repositories import user_repo
    user = user_repo.get_by_email(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    access_token = create_access_token(user.id, expires_delta=timedelta(hours=12))
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id,
        "email": user.email,
        "full_name": user.full_name
    }

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    return AuthService.register_user(
        db,
        email=user_in.email,
        password=user_in.password,
        full_name=user_in.full_name,
        role=user_in.role
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# Helper functions locally imported to prevent circular reference
from app.core.security import create_access_token, verify_password
