from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import os
import shutil
from datetime import datetime

# Create FastAPI app
app = FastAPI(
    title="DriveNow Rentals API",
    description="A comprehensive API for managing vehicle rentals, drivers, and documents",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:5173", 
        "http://localhost:5174",
        "https://drivenow-frontend.onrender.com",  # Production frontend
        "https://*.onrender.com"  # All Render subdomains
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
os.makedirs("uploads/vehicles", exist_ok=True)
os.makedirs("uploads/documents", exist_ok=True)
os.makedirs("uploads/payments", exist_ok=True)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Simple models for testing
class SimpleLogin(BaseModel):
    email: str
    password: str

class SimpleRental(BaseModel):
    vehicle_id: int
    contract_period: str
    first_name: str
    last_name: str
    email: str
    phone: str
    license_number: str
    license_expiry: str
    address: str
    emergency_contact: str
    emergency_phone: str

# In-memory storage for rental applications (in production, this would be in a database)
rental_applications = []
application_id_counter = 1

# Simple login endpoint for testing
@app.post("/login")
async def simple_login(login_data: SimpleLogin):
    """Simple login endpoint for testing"""
    # Determine role based on email for demo purposes
    email = login_data.email.lower()
    if email.startswith('admin') or email.startswith('admin@'):
        role = 'admin'
    else:
        role = 'user'
    
    return {
        "token": "demo-token-123",
        "user_email": login_data.email,
        "role": role
    }

# Simple signup endpoint for testing
@app.post("/api/signup")
async def simple_signup(signup_data: dict):
    """Simple signup endpoint for testing"""
    email = signup_data.get("email", "")
    password = signup_data.get("password", "")
    
    # For demo purposes, accept any signup without email verification
    return {
        "message": "Account created successfully! You can now log in.",
        "user_email": email,
        "verified": True  # Mark as verified for demo
    }

# Email verification endpoints
@app.post("/api/verify-email")
async def verify_email(verification_data: dict):
    """Verify email endpoint"""
    token = verification_data.get("token", "")
    
    # For demo purposes, always return success
    return {
        "message": "Email verified successfully! You can now log in.",
        "verified": True
    }

@app.post("/api/resend-verification")
async def resend_verification(resend_data: dict):
    """Resend verification email endpoint"""
    email = resend_data.get("email", "")
    
    # For demo purposes, always return success
    return {
        "message": "Verification email sent successfully! Please check your inbox.",
        "email": email
    }

# File upload endpoint
@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload a file"""
    try:
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{file.filename}"
        
        # Determine file type and save to appropriate directory
        if file.content_type and file.content_type.startswith('image/'):
            file_path = f"uploads/vehicles/{filename}"
        else:
            file_path = f"uploads/documents/{filename}"
        
        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Return the URL path
        url_path = f"/uploads/vehicles/{filename}" if file.content_type and file.content_type.startswith('image/') else f"/uploads/documents/{filename}"
        
        return {
            "message": "File uploaded successfully",
            "filename": filename,
            "url": url_path
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading file: {str(e)}")

# Payment receipt upload endpoint
@app.post("/api/upload-payment-receipt")
async def upload_payment_receipt(file: UploadFile = File(...)):
    """Upload a payment receipt"""
    try:
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"payment_{timestamp}_{file.filename}"
        
        # Save to payments directory
        file_path = f"uploads/payments/{filename}"
        
        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Return the URL path
        url_path = f"/uploads/payments/{filename}"
        
        return {
            "message": "Payment receipt uploaded successfully",
            "filename": filename,
            "url": url_path
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading payment receipt: {str(e)}")

# In-memory storage for vehicles and drivers
vehicles = []
vehicle_id_counter = 1

drivers = []
driver_id_counter = 1

# Vehicles endpoints
@app.get("/api/vehicles")
async def get_vehicles():
    """Get all vehicles"""
    return vehicles

@app.post("/api/vehicles")
async def create_vehicle(vehicle_data: dict):
    """Create a new vehicle"""
    global vehicle_id_counter
    
    vehicle = {
        "id": vehicle_id_counter,
        "make": vehicle_data.get("make", ""),
        "model": vehicle_data.get("model", ""),
        "year": vehicle_data.get("year", ""),
        "licensePlate": vehicle_data.get("licensePlate", ""),
        "vin": vehicle_data.get("vin", ""),
        "bondAmount": vehicle_data.get("bondAmount", 0),
        "rentPerWeek": vehicle_data.get("rentPerWeek", 0),
        "currentMileage": vehicle_data.get("currentMileage", 0),
        "odoMeter": vehicle_data.get("odoMeter", 0),
        "nextServiceDate": vehicle_data.get("nextServiceDate", ""),
        "vehicleType": vehicle_data.get("vehicleType", "sedan"),
        "color": vehicle_data.get("color", ""),
        "fuelType": vehicle_data.get("fuelType", "petrol"),
        "transmission": vehicle_data.get("transmission", "automatic"),
        "status": vehicle_data.get("status", "available"),
        "photoUrl": vehicle_data.get("photoUrl", ""),
        "photoUrls": vehicle_data.get("photoUrls", []),
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
    }
    
    vehicles.append(vehicle)
    vehicle_id_counter += 1
    
    return {
        "message": "Vehicle created successfully",
        "vehicle": vehicle
    }

@app.put("/api/vehicles/{vehicle_id}")
async def update_vehicle(vehicle_id: int, vehicle_data: dict):
    """Update a vehicle"""
    vehicle = next((v for v in vehicles if v["id"] == vehicle_id), None)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    # Update vehicle fields
    for key, value in vehicle_data.items():
        if key in vehicle:
            vehicle[key] = value
    
    vehicle["updatedAt"] = "2024-01-01T00:00:00.000Z"
    
    return {
        "message": "Vehicle updated successfully",
        "vehicle": vehicle
    }

@app.delete("/api/vehicles/{vehicle_id}")
async def delete_vehicle(vehicle_id: int):
    """Delete a vehicle"""
    global vehicles
    vehicles = [v for v in vehicles if v["id"] != vehicle_id]
    
    return {
        "message": "Vehicle deleted successfully"
    }

# Drivers endpoints
@app.get("/api/drivers")
async def get_drivers():
    """Get all drivers"""
    return drivers

@app.post("/api/drivers")
async def create_driver(driver_data: dict):
    """Create a new driver"""
    global driver_id_counter
    
    driver = {
        "id": driver_id_counter,
        "firstName": driver_data.get("firstName", ""),
        "lastName": driver_data.get("lastName", ""),
        "email": driver_data.get("email", ""),
        "phone": driver_data.get("phone", ""),
        "licenseNumber": driver_data.get("licenseNumber", ""),
        "licenseExpiry": driver_data.get("licenseExpiry", ""),
        "address": driver_data.get("address", ""),
        "emergencyContact": driver_data.get("emergencyContact", ""),
        "emergencyPhone": driver_data.get("emergencyPhone", ""),
        "selectedVehicleId": driver_data.get("selectedVehicleId", ""),
        "contractStartDate": driver_data.get("contractStartDate", ""),
        "contractEndDate": driver_data.get("contractEndDate", ""),
        "contractPeriod": driver_data.get("contractPeriod", ""),
        "bondAmount": driver_data.get("bondAmount", 0),
        "weeklyRent": driver_data.get("weeklyRent", 0),
        "contractSigned": driver_data.get("contractSigned", False),
        "paymentReceiptUploaded": driver_data.get("paymentReceiptUploaded", False),
        "paymentReceiptUrl": driver_data.get("paymentReceiptUrl", ""),
        "status": driver_data.get("status", "pending"),
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
    }
    
    drivers.append(driver)
    driver_id_counter += 1
    
    return {
        "message": "Driver created successfully",
        "driver": driver
    }

@app.put("/api/drivers/{driver_id}")
async def update_driver(driver_id: int, driver_data: dict):
    """Update a driver"""
    driver = next((d for d in drivers if d["id"] == driver_id), None)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    # Update driver fields
    for key, value in driver_data.items():
        if key in driver:
            driver[key] = value
    
    driver["updatedAt"] = "2024-01-01T00:00:00.000Z"
    
    return {
        "message": "Driver updated successfully",
        "driver": driver
    }

@app.delete("/api/drivers/{driver_id}")
async def delete_driver(driver_id: int):
    """Delete a driver"""
    global drivers
    drivers = [d for d in drivers if d["id"] != driver_id]
    
    return {
        "message": "Driver deleted successfully"
    }

# Document types endpoint
@app.get("/api/document-types")
async def get_document_types():
    """Get available document types"""
    return {
        "license": "Driver's License",
        "insurance": "Insurance Certificate",
        "registration": "Vehicle Registration",
        "contract": "Rental Contract",
        "payment_receipt": "Payment Receipt",
        "other": "Other Document"
    }

# Driver documents endpoint
@app.get("/api/drivers/{driver_id}/documents")
async def get_driver_documents(driver_id: int):
    """Get documents for a specific driver"""
    # For demo purposes, return empty array
    return []

@app.post("/api/drivers/{driver_id}/documents")
async def upload_driver_document(driver_id: int, document_data: dict):
    """Upload a document for a driver"""
    # For demo purposes, return success
    return {
        "message": "Document uploaded successfully",
        "document_id": 1,
        "driver_id": driver_id
    }

# Rental endpoint for testing
@app.post("/api/rentals")
async def create_rental(rental_data: SimpleRental):
    """Create rental application"""
    global application_id_counter
    
    # Get vehicle details
    vehicle = next((v for v in vehicles if v["id"] == rental_data.vehicle_id), None)
    
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    # Create rental application
    application = {
        "id": application_id_counter,
        "vehicle_id": rental_data.vehicle_id,
        "vehicle_details": vehicle,
        "contract_period": rental_data.contract_period,
        "first_name": rental_data.first_name,
        "last_name": rental_data.last_name,
        "email": rental_data.email,
        "phone": rental_data.phone,
        "license_number": rental_data.license_number,
        "license_expiry": rental_data.license_expiry,
        "address": rental_data.address,
        "emergency_contact": rental_data.emergency_contact,
        "emergency_phone": rental_data.emergency_phone,
        "status": "pending",  # pending, approved, rejected
        "submitted_at": "2024-01-01T00:00:00.000Z",
        "admin_notes": "",
        "processed_at": None,
        "processed_by": None
    }
    
    rental_applications.append(application)
    application_id_counter += 1
    
    return {
        "message": "Rental application submitted successfully",
        "rental_id": application["id"],
        "status": "pending"
    }

# Get all rental applications (admin only)
@app.get("/api/rental-applications")
async def get_rental_applications():
    """Get all rental applications for admin review"""
    return rental_applications

# Get specific rental application
@app.get("/api/rental-applications/{application_id}")
async def get_rental_application(application_id: int):
    """Get specific rental application details"""
    application = next((app for app in rental_applications if app["id"] == application_id), None)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return application

# Approve or reject rental application (admin only)
@app.put("/api/rental-applications/{application_id}")
async def update_rental_application(application_id: int, status: str, admin_notes: str = ""):
    """Approve or reject rental application"""
    application = next((app for app in rental_applications if app["id"] == application_id), None)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if status not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Status must be 'approved' or 'rejected'")
    
    # Update application
    application["status"] = status
    application["admin_notes"] = admin_notes
    application["processed_at"] = "2024-01-01T00:00:00.000Z"
    application["processed_by"] = "admin@example.com"
    
    # Update vehicle status if approved
    if status == "approved":
        vehicle = next((v for v in vehicles if v["id"] == application["vehicle_id"]), None)
        if vehicle:
            vehicle["status"] = "rented"
    elif status == "rejected":
        vehicle = next((v for v in vehicles if v["id"] == application["vehicle_id"]), None)
        if vehicle:
            vehicle["status"] = "available"
    
    return {
        "message": f"Application {status} successfully",
        "application_id": application_id,
        "status": status
    }

# Update rental application with payment receipt
@app.put("/api/rentals/{application_id}/payment-receipt")
async def update_rental_payment_receipt(application_id: int, payment_data: dict):
    """Update rental application with payment receipt"""
    application = next((app for app in rental_applications if app["id"] == application_id), None)
    if not application:
        raise HTTPException(status_code=404, detail="Rental application not found")
    
    # Update payment receipt information
    application["payment_receipt_url"] = payment_data.get("payment_receipt_url", "")
    application["payment_receipt_uploaded"] = True
    application["status"] = "payment_received"  # Change status to payment received
    
    # Update vehicle status to "pending_approval"
    vehicle = next((v for v in vehicles if v["id"] == application["vehicle_id"]), None)
    if vehicle:
        vehicle["status"] = "pending_approval"
    
    return {
        "message": "Payment receipt updated successfully",
        "application": application
    }

# Health check endpoint
@app.get("/")
async def root():
    return {
        "message": "DriveNow Rentals API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
