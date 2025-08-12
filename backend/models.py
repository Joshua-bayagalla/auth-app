from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"

class VehicleStatus(str, enum.Enum):
    AVAILABLE = "available"
    RENTED = "rented"
    MAINTENANCE = "maintenance"
    OUT_OF_SERVICE = "out_of_service"

class DriverStatus(str, enum.Enum):
    PENDING = "pending"
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"

class DocumentType(str, enum.Enum):
    LICENSE = "license"
    INSURANCE = "insurance"
    REGISTRATION = "registration"
    CONTRACT = "contract"
    PAYMENT_RECEIPT = "payment_receipt"
    OTHER = "other"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.USER)
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Vehicle(Base):
    __tablename__ = "vehicles"
    
    id = Column(Integer, primary_key=True, index=True)
    make = Column(String, nullable=False)
    model = Column(String, nullable=False)
    year = Column(String, nullable=False)
    license_plate = Column(String, unique=True, nullable=False)
    vin = Column(String, unique=True, nullable=False)
    bond_amount = Column(Float, nullable=False)
    rent_per_week = Column(Float, nullable=False)
    current_mileage = Column(Integer, nullable=False)
    odo_meter = Column(Integer, nullable=False)
    next_service_date = Column(DateTime, nullable=False)
    vehicle_type = Column(String, nullable=False)
    color = Column(String, nullable=False)
    fuel_type = Column(String, nullable=False)
    transmission = Column(String, nullable=False)
    status = Column(Enum(VehicleStatus), default=VehicleStatus.AVAILABLE)
    owner_name = Column(String, nullable=True)
    photo_url = Column(String, nullable=True)
    photo_path = Column(String, nullable=True)
    photo_name = Column(String, nullable=True)
    photo_size = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    drivers = relationship("Driver", back_populates="selected_vehicle")

class Driver(Base):
    __tablename__ = "drivers"
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    license_number = Column(String, nullable=False)
    license_expiry = Column(DateTime, nullable=False)
    address = Column(Text, nullable=False)
    emergency_contact = Column(String, nullable=False)
    emergency_phone = Column(String, nullable=False)
    selected_vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=True)
    contract_start_date = Column(DateTime, nullable=True)
    contract_end_date = Column(DateTime, nullable=True)
    contract_period = Column(String, nullable=True)
    bond_amount = Column(Float, nullable=True)
    weekly_rent = Column(Float, nullable=True)
    contract_signed = Column(Boolean, default=False)
    payment_receipt_uploaded = Column(Boolean, default=False)
    payment_receipt_url = Column(String, nullable=True)
    status = Column(Enum(DriverStatus), default=DriverStatus.PENDING)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    selected_vehicle = relationship("Vehicle", back_populates="drivers")
    documents = relationship("Document", back_populates="driver")

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=False)
    document_type = Column(Enum(DocumentType), nullable=False)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    upload_date = Column(DateTime(timezone=True), server_default=func.now())
    expiry_date = Column(DateTime, nullable=True)
    
    # Relationships
    driver = relationship("Driver", back_populates="documents")

class Rental(Base):
    __tablename__ = "rentals"
    
    id = Column(Integer, primary_key=True, index=True)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    contract_period = Column(String, nullable=False)
    payment_receipt_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    driver = relationship("Driver")
    vehicle = relationship("Vehicle")
