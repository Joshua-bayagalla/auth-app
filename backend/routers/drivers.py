from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import Driver, Document, DriverStatus, DocumentType
from schemas import DriverCreate, DriverUpdate, DriverResponse, DocumentCreate, DocumentResponse
from auth import get_current_admin_user, get_current_active_user
from file_service import file_service

router = APIRouter(prefix="/drivers", tags=["Drivers"])

@router.post("/", response_model=DriverResponse)
async def create_driver(
    driver_data: DriverCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin_user)
):
    """Create a new driver (Admin only)"""
    try:
        # Check if driver with same email already exists
        existing_driver = db.query(Driver).filter(Driver.email == driver_data.email).first()
        if existing_driver:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Driver with this email already exists"
            )
        
        # Create driver object
        driver_dict = driver_data.dict()
        new_driver = Driver(**driver_dict)
        
        db.add(new_driver)
        db.commit()
        db.refresh(new_driver)
        
        return DriverResponse.from_orm(new_driver)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating driver: {str(e)}"
        )

@router.get("/", response_model=List[DriverResponse])
async def get_drivers(
    status_filter: Optional[DriverStatus] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """Get all drivers with optional status filter"""
    try:
        query = db.query(Driver)
        
        if status_filter:
            query = query.filter(Driver.status == status_filter)
        
        drivers = query.all()
        return [DriverResponse.from_orm(driver) for driver in drivers]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching drivers: {str(e)}"
        )

@router.get("/{driver_id}", response_model=DriverResponse)
async def get_driver(
    driver_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """Get a specific driver by ID"""
    try:
        driver = db.query(Driver).filter(Driver.id == driver_id).first()
        if not driver:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Driver not found"
            )
        
        return DriverResponse.from_orm(driver)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching driver: {str(e)}"
        )

@router.put("/{driver_id}", response_model=DriverResponse)
async def update_driver(
    driver_id: int,
    driver_data: DriverUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin_user)
):
    """Update a driver (Admin only)"""
    try:
        driver = db.query(Driver).filter(Driver.id == driver_id).first()
        if not driver:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Driver not found"
            )
        
        # Update driver data
        update_data = driver_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(driver, field, value)
        
        db.commit()
        db.refresh(driver)
        
        return DriverResponse.from_orm(driver)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating driver: {str(e)}"
        )

@router.delete("/{driver_id}")
async def delete_driver(
    driver_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin_user)
):
    """Delete a driver (Admin only)"""
    try:
        driver = db.query(Driver).filter(Driver.id == driver_id).first()
        if not driver:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Driver not found"
            )
        
        # Delete associated documents
        documents = db.query(Document).filter(Document.driver_id == driver_id).all()
        for doc in documents:
            file_service.delete_file(doc.file_path)
            db.delete(doc)
        
        db.delete(driver)
        db.commit()
        
        return {"message": "Driver deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting driver: {str(e)}"
        )

# Document Management
@router.post("/{driver_id}/documents", response_model=DocumentResponse)
async def upload_document(
    driver_id: int,
    document_data: DocumentCreate,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin_user)
):
    """Upload a document for a driver (Admin only)"""
    try:
        # Check if driver exists
        driver = db.query(Driver).filter(Driver.id == driver_id).first()
        if not driver:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Driver not found"
            )
        
        # Save file
        file_info = await file_service.save_document(file)
        
        # Create document record
        new_document = Document(
            driver_id=driver_id,
            document_type=document_data.document_type,
            file_name=file_info["file_name"],
            file_path=file_info["file_path"],
            file_size=file_info["file_size"],
            expiry_date=document_data.expiry_date
        )
        
        db.add(new_document)
        db.commit()
        db.refresh(new_document)
        
        return DocumentResponse.from_orm(new_document)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading document: {str(e)}"
        )

@router.get("/{driver_id}/documents", response_model=List[DocumentResponse])
async def get_driver_documents(
    driver_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """Get all documents for a driver"""
    try:
        # Check if driver exists
        driver = db.query(Driver).filter(Driver.id == driver_id).first()
        if not driver:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Driver not found"
            )
        
        documents = db.query(Document).filter(Document.driver_id == driver_id).all()
        return [DocumentResponse.from_orm(doc) for doc in documents]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching documents: {str(e)}"
        )

@router.delete("/{driver_id}/documents/{document_id}")
async def delete_document(
    driver_id: int,
    document_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin_user)
):
    """Delete a document (Admin only)"""
    try:
        document = db.query(Document).filter(
            Document.id == document_id,
            Document.driver_id == driver_id
        ).first()
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        # Delete file from filesystem
        file_service.delete_file(document.file_path)
        
        # Delete from database
        db.delete(document)
        db.commit()
        
        return {"message": "Document deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting document: {str(e)}"
        )

# Contract and Payment Management
@router.post("/{driver_id}/contract")
async def update_contract(
    driver_id: int,
    contract_data: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin_user)
):
    """Update driver contract information (Admin only)"""
    try:
        driver = db.query(Driver).filter(Driver.id == driver_id).first()
        if not driver:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Driver not found"
            )
        
        # Update contract fields
        if "contract_start_date" in contract_data:
            driver.contract_start_date = contract_data["contract_start_date"]
        if "contract_end_date" in contract_data:
            driver.contract_end_date = contract_data["contract_end_date"]
        if "contract_period" in contract_data:
            driver.contract_period = contract_data["contract_period"]
        if "bond_amount" in contract_data:
            driver.bond_amount = contract_data["bond_amount"]
        if "weekly_rent" in contract_data:
            driver.weekly_rent = contract_data["weekly_rent"]
        if "contract_signed" in contract_data:
            driver.contract_signed = contract_data["contract_signed"]
        
        db.commit()
        db.refresh(driver)
        
        return {"message": "Contract updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating contract: {str(e)}"
        )

@router.post("/{driver_id}/payment")
async def update_payment_status(
    driver_id: int,
    payment_data: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin_user)
):
    """Update driver payment status (Admin only)"""
    try:
        driver = db.query(Driver).filter(Driver.id == driver_id).first()
        if not driver:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Driver not found"
            )
        
        # Update payment fields
        if "payment_receipt_uploaded" in payment_data:
            driver.payment_receipt_uploaded = payment_data["payment_receipt_uploaded"]
        if "payment_receipt_url" in payment_data:
            driver.payment_receipt_url = payment_data["payment_receipt_url"]
        
        db.commit()
        db.refresh(driver)
        
        return {"message": "Payment status updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating payment status: {str(e)}"
        )

@router.get("/stats/overview")
async def get_driver_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """Get driver statistics"""
    try:
        total_drivers = db.query(Driver).count()
        active_drivers = db.query(Driver).filter(Driver.status == DriverStatus.ACTIVE).count()
        pending_drivers = db.query(Driver).filter(Driver.status == DriverStatus.PENDING).count()
        suspended_drivers = db.query(Driver).filter(Driver.status == DriverStatus.SUSPENDED).count()
        
        return {
            "total_drivers": total_drivers,
            "active_drivers": active_drivers,
            "pending_drivers": pending_drivers,
            "suspended_drivers": suspended_drivers
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching driver stats: {str(e)}"
        )
