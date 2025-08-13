from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import Rental, Driver, Vehicle
from schemas import RentalCreate, RentalResponse
from auth import get_current_active_user, get_current_admin_user
from file_service import file_service

router = APIRouter(prefix="/rentals", tags=["Rentals"])

@router.post("/", response_model=RentalResponse)
async def create_rental(
    rental_data: RentalCreate,
    payment_receipt: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """Create a new rental application"""
    try:
        # Check if driver exists
        driver = db.query(Driver).filter(Driver.id == rental_data.driver_id).first()
        if not driver:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Driver not found"
            )
        
        # Check if vehicle exists and is available
        vehicle = db.query(Vehicle).filter(Vehicle.id == rental_data.vehicle_id).first()
        if not vehicle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vehicle not found"
            )
        
        if vehicle.status != "available":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Vehicle is not available for rental"
            )
        
        # Handle payment receipt upload if provided
        payment_receipt_url = None
        if payment_receipt:
            file_info = await file_service.save_payment_receipt(payment_receipt)
            payment_receipt_url = file_info["file_url"]
            
            # Update driver payment status
            driver.payment_receipt_uploaded = True
            driver.payment_receipt_url = payment_receipt_url
        
        # Create rental record
        new_rental = Rental(
            driver_id=rental_data.driver_id,
            vehicle_id=rental_data.vehicle_id,
            contract_period=rental_data.contract_period,
            payment_receipt_url=payment_receipt_url
        )
        
        # Update vehicle status to rented
        vehicle.status = "rented"
        
        # Update driver selected vehicle
        driver.selected_vehicle_id = rental_data.vehicle_id
        
        db.add(new_rental)
        db.commit()
        db.refresh(new_rental)
        
        return RentalResponse.from_orm(new_rental)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating rental: {str(e)}"
        )

@router.get("/", response_model=List[RentalResponse])
async def get_rentals(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin_user)
):
    """Get all rentals (Admin only)"""
    try:
        rentals = db.query(Rental).all()
        return [RentalResponse.from_orm(rental) for rental in rentals]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching rentals: {str(e)}"
        )

@router.get("/{rental_id}", response_model=RentalResponse)
async def get_rental(
    rental_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """Get a specific rental by ID"""
    try:
        rental = db.query(Rental).filter(Rental.id == rental_id).first()
        if not rental:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Rental not found"
            )
        
        return RentalResponse.from_orm(rental)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching rental: {str(e)}"
        )

@router.get("/driver/{driver_id}", response_model=List[RentalResponse])
async def get_driver_rentals(
    driver_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """Get all rentals for a specific driver"""
    try:
        # Check if driver exists
        driver = db.query(Driver).filter(Driver.id == driver_id).first()
        if not driver:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Driver not found"
            )
        
        rentals = db.query(Rental).filter(Rental.driver_id == driver_id).all()
        return [RentalResponse.from_orm(rental) for rental in rentals]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching driver rentals: {str(e)}"
        )

@router.get("/vehicle/{vehicle_id}", response_model=List[RentalResponse])
async def get_vehicle_rentals(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """Get all rentals for a specific vehicle"""
    try:
        # Check if vehicle exists
        vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
        if not vehicle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vehicle not found"
            )
        
        rentals = db.query(Rental).filter(Rental.vehicle_id == vehicle_id).all()
        return [RentalResponse.from_orm(rental) for rental in rentals]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching vehicle rentals: {str(e)}"
        )

@router.delete("/{rental_id}")
async def delete_rental(
    rental_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin_user)
):
    """Delete a rental (Admin only)"""
    try:
        rental = db.query(Rental).filter(Rental.id == rental_id).first()
        if not rental:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Rental not found"
            )
        
        # Update vehicle status back to available
        vehicle = db.query(Vehicle).filter(Vehicle.id == rental.vehicle_id).first()
        if vehicle:
            vehicle.status = "available"
        
        # Update driver selected vehicle
        driver = db.query(Driver).filter(Driver.id == rental.driver_id).first()
        if driver and driver.selected_vehicle_id == rental.vehicle_id:
            driver.selected_vehicle_id = None
        
        # Delete payment receipt file if exists
        if rental.payment_receipt_url:
            file_path = rental.payment_receipt_url.replace("/uploads/", "uploads/")
            file_service.delete_file(file_path)
        
        db.delete(rental)
        db.commit()
        
        return {"message": "Rental deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting rental: {str(e)}"
        )

@router.get("/stats/overview")
async def get_rental_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """Get rental statistics"""
    try:
        total_rentals = db.query(Rental).count()
        active_rentals = db.query(Rental).join(Vehicle).filter(Vehicle.status == "rented").count()
        
        return {
            "total_rentals": total_rentals,
            "active_rentals": active_rentals
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching rental stats: {str(e)}"
        )

