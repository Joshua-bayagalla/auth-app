from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import Vehicle, VehicleStatus
from schemas import VehicleCreate, VehicleUpdate, VehicleResponse
from auth import get_current_admin_user, get_current_active_user
from file_service import file_service

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])

@router.post("/", response_model=VehicleResponse)
async def create_vehicle(
    vehicle_data: VehicleCreate,
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin_user)
):
    """Create a new vehicle (Admin only)"""
    try:
        # Check if vehicle with same license plate or VIN already exists
        existing_vehicle = db.query(Vehicle).filter(
            (Vehicle.license_plate == vehicle_data.license_plate) |
            (Vehicle.vin == vehicle_data.vin)
        ).first()
        
        if existing_vehicle:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Vehicle with this license plate or VIN already exists"
            )
        
        # Create vehicle object
        vehicle_dict = vehicle_data.dict()
        new_vehicle = Vehicle(**vehicle_dict)
        
        # Handle photo upload if provided
        if photo:
            photo_info = await file_service.save_vehicle_photo(photo)
            new_vehicle.photo_url = photo_info["file_url"]
            new_vehicle.photo_path = photo_info["file_path"]
            new_vehicle.photo_name = photo_info["file_name"]
            new_vehicle.photo_size = photo_info["file_size"]
        
        db.add(new_vehicle)
        db.commit()
        db.refresh(new_vehicle)
        
        return VehicleResponse.from_orm(new_vehicle)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating vehicle: {str(e)}"
        )

@router.get("/", response_model=List[VehicleResponse])
async def get_vehicles(
    status_filter: Optional[VehicleStatus] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """Get all vehicles with optional status filter"""
    try:
        query = db.query(Vehicle)
        
        if status_filter:
            query = query.filter(Vehicle.status == status_filter)
        
        vehicles = query.all()
        return [VehicleResponse.from_orm(vehicle) for vehicle in vehicles]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching vehicles: {str(e)}"
        )

@router.get("/{vehicle_id}", response_model=VehicleResponse)
async def get_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """Get a specific vehicle by ID"""
    try:
        vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
        if not vehicle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vehicle not found"
            )
        
        return VehicleResponse.from_orm(vehicle)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching vehicle: {str(e)}"
        )

@router.put("/{vehicle_id}", response_model=VehicleResponse)
async def update_vehicle(
    vehicle_id: int,
    vehicle_data: VehicleUpdate,
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin_user)
):
    """Update a vehicle (Admin only)"""
    try:
        vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
        if not vehicle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vehicle not found"
            )
        
        # Update vehicle data
        update_data = vehicle_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(vehicle, field, value)
        
        # Handle photo upload if provided
        if photo:
            # Delete old photo if exists
            if vehicle.photo_path:
                file_service.delete_file(vehicle.photo_path)
            
            # Save new photo
            photo_info = await file_service.save_vehicle_photo(photo)
            vehicle.photo_url = photo_info["file_url"]
            vehicle.photo_path = photo_info["file_path"]
            vehicle.photo_name = photo_info["file_name"]
            vehicle.photo_size = photo_info["file_size"]
        
        db.commit()
        db.refresh(vehicle)
        
        return VehicleResponse.from_orm(vehicle)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating vehicle: {str(e)}"
        )

@router.delete("/{vehicle_id}")
async def delete_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin_user)
):
    """Delete a vehicle (Admin only)"""
    try:
        vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
        if not vehicle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vehicle not found"
            )
        
        # Delete photo file if exists
        if vehicle.photo_path:
            file_service.delete_file(vehicle.photo_path)
        
        db.delete(vehicle)
        db.commit()
        
        return {"message": "Vehicle deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting vehicle: {str(e)}"
        )

@router.get("/stats/overview")
async def get_vehicle_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """Get vehicle statistics"""
    try:
        total_vehicles = db.query(Vehicle).count()
        available_vehicles = db.query(Vehicle).filter(Vehicle.status == VehicleStatus.AVAILABLE).count()
        rented_vehicles = db.query(Vehicle).filter(Vehicle.status == VehicleStatus.RENTED).count()
        maintenance_vehicles = db.query(Vehicle).filter(Vehicle.status == VehicleStatus.MAINTENANCE).count()
        
        return {
            "total_vehicles": total_vehicles,
            "available_vehicles": available_vehicles,
            "rented_vehicles": rented_vehicles,
            "maintenance_vehicles": maintenance_vehicles
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching vehicle stats: {str(e)}"
        )

