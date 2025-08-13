from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from database import get_db
from models import User, UserRole
from schemas import UserCreate, UserLogin, Token, UserResponse, EmailVerification, ResendVerification
from auth import get_password_hash, verify_password, create_access_token, generate_verification_token
from email_service import email_service
from datetime import timedelta

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=dict)
async def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        hashed_password = get_password_hash(user_data.password)
        verification_token = generate_verification_token()
        
        new_user = User(
            email=user_data.email,
            hashed_password=hashed_password,
            role=UserRole.USER,
            verification_token=verification_token
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Send verification email
        email_sent = email_service.send_verification_email(user_data.email, verification_token)
        
        return {
            "message": "User created successfully. Please check your email to verify your account.",
            "email_sent": email_sent
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating user: {str(e)}"
        )

@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Login user and return JWT token"""
    try:
        # Find user by email
        user = db.query(User).filter(User.email == user_credentials.email).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Verify password
        if not verify_password(user_credentials.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Check if email is verified
        if not user.is_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please verify your email before logging in"
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=30)
        access_token = create_access_token(
            data={"sub": str(user.id)}, expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserResponse.from_orm(user)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error during login: {str(e)}"
        )

@router.post("/verify-email", response_model=dict)
async def verify_email(verification_data: EmailVerification, db: Session = Depends(get_db)):
    """Verify user email with token"""
    try:
        # Find user by verification token
        user = db.query(User).filter(User.verification_token == verification_data.token).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification token"
            )
        
        # Update user verification status
        user.is_verified = True
        user.verification_token = None
        db.commit()
        
        return {"message": "Email verified successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error verifying email: {str(e)}"
        )

@router.post("/resend-verification", response_model=dict)
async def resend_verification(resend_data: ResendVerification, db: Session = Depends(get_db)):
    """Resend verification email"""
    try:
        # Find user by email
        user = db.query(User).filter(User.email == resend_data.email).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        if user.is_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already verified"
            )
        
        # Generate new verification token
        new_token = generate_verification_token()
        user.verification_token = new_token
        db.commit()
        
        # Send verification email
        email_sent = email_service.send_verification_email(user.email, new_token)
        
        return {
            "message": "Verification email sent successfully",
            "email_sent": email_sent
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error resending verification: {str(e)}"
        )

@router.post("/create-admin", response_model=dict)
async def create_admin(user_data: UserCreate, db: Session = Depends(get_db)):
    """Create admin user (for initial setup)"""
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create admin user
        hashed_password = get_password_hash(user_data.password)
        
        new_admin = User(
            email=user_data.email,
            hashed_password=hashed_password,
            role=UserRole.ADMIN,
            is_verified=True  # Admin users are auto-verified
        )
        
        db.add(new_admin)
        db.commit()
        db.refresh(new_admin)
        
        return {"message": "Admin user created successfully"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating admin user: {str(e)}"
        )

