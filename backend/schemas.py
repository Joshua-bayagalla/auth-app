from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from datetime import datetime
from models import UserRole, VehicleStatus, DriverStatus, DocumentType

# User Schemas
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    
    @validator('password')
    def password_strength(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    role: UserRole
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Vehicle Schemas
class VehicleBase(BaseModel):
    make: str
    model: str
    year: str
    license_plate: str
    vin: str
    bond_amount: float
    rent_per_week: float
    current_mileage: int
    odo_meter: int
    next_service_date: datetime
    vehicle_type: str
    color: str
    fuel_type: str
    transmission: str
    owner_name: Optional[str] = None

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(BaseModel):
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[str] = None
    license_plate: Optional[str] = None
    vin: Optional[str] = None
    bond_amount: Optional[float] = None
    rent_per_week: Optional[float] = None
    current_mileage: Optional[int] = None
    odo_meter: Optional[int] = None
    next_service_date: Optional[datetime] = None
    vehicle_type: Optional[str] = None
    color: Optional[str] = None
    fuel_type: Optional[str] = None
    transmission: Optional[str] = None
    status: Optional[VehicleStatus] = None
    owner_name: Optional[str] = None

class VehicleResponse(VehicleBase):
    id: int
    status: VehicleStatus
    photo_url: Optional[str] = None
    photo_name: Optional[str] = None
    photo_size: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Driver Schemas
class DriverBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    license_number: str
    license_expiry: datetime
    address: str
    emergency_contact: str
    emergency_phone: str

class DriverCreate(DriverBase):
    selected_vehicle_id: Optional[int] = None
    contract_period: Optional[str] = None
    bond_amount: Optional[float] = None
    weekly_rent: Optional[float] = None

class DriverUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    license_number: Optional[str] = None
    license_expiry: Optional[datetime] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None
    selected_vehicle_id: Optional[int] = None
    contract_start_date: Optional[datetime] = None
    contract_end_date: Optional[datetime] = None
    contract_period: Optional[str] = None
    bond_amount: Optional[float] = None
    weekly_rent: Optional[float] = None
    contract_signed: Optional[bool] = None
    payment_receipt_uploaded: Optional[bool] = None
    status: Optional[DriverStatus] = None

class DriverResponse(DriverBase):
    id: int
    selected_vehicle_id: Optional[int] = None
    contract_start_date: Optional[datetime] = None
    contract_end_date: Optional[datetime] = None
    contract_period: Optional[str] = None
    bond_amount: Optional[float] = None
    weekly_rent: Optional[float] = None
    contract_signed: bool
    payment_receipt_uploaded: bool
    payment_receipt_url: Optional[str] = None
    status: DriverStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    selected_vehicle: Optional[VehicleResponse] = None
    
    class Config:
        from_attributes = True

# Document Schemas
class DocumentBase(BaseModel):
    document_type: DocumentType
    expiry_date: Optional[datetime] = None

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(BaseModel):
    document_type: Optional[DocumentType] = None
    expiry_date: Optional[datetime] = None

class DocumentResponse(DocumentBase):
    id: int
    driver_id: int
    file_name: str
    file_path: str
    file_size: int
    upload_date: datetime
    
    class Config:
        from_attributes = True

# Rental Schemas
class RentalCreate(BaseModel):
    driver_id: int
    vehicle_id: int
    contract_period: str

class RentalResponse(BaseModel):
    id: int
    driver_id: int
    vehicle_id: int
    contract_period: str
    payment_receipt_url: Optional[str] = None
    created_at: datetime
    driver: DriverResponse
    vehicle: VehicleResponse
    
    class Config:
        from_attributes = True

# Statistics Schemas
class DashboardStats(BaseModel):
    total_drivers: int
    active_drivers: int
    total_vehicles: int
    available_vehicles: int
    rented_vehicles: int
    maintenance_vehicles: int
    payment_alerts: int
    active_trips: int

# Email Verification
class EmailVerification(BaseModel):
    token: str

class ResendVerification(BaseModel):
    email: EmailStr

