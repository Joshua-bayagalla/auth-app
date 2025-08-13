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
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:5177",
        "http://localhost:5178",
        "http://localhost:5179",
        "http://localhost:5180",
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

# In-memory storage for vehicles and drivers
vehicles = []
drivers = []
vehicle_id_counter = 1
driver_id_counter = 1

# Add sample data for demonstration
def initialize_sample_data():
    global vehicles, rental_applications, vehicle_id_counter, application_id_counter
    
    # Sample vehicle data
    sample_vehicle = {
        "id": 1,
        "make": "Mercedes",
        "model": "G-Wagon",
        "year": "2022",
        "licensePlate": "ABC3242",
        "vin": "1HGBH41JXMN109186",
        "bondAmount": 2000,
        "rentPerWeek": 200,
        "currentMileage": 39,
        "odoMeter": 30000,
        "nextServiceDate": "2025-08-30",
        "vehicleType": "SUV",
        "color": "Silver",
        "fuelType": "Diesel",
        "transmission": "Automatic",
        "status": "available",
        "photoUrl": "/uploads/vehicles/sample_vehicle.jpg",
        "photoUrls": [
            "/uploads/vehicles/sample_vehicle.jpg",
            "/uploads/vehicles/sample_vehicle_2.jpg"
        ],
        "documents": [
            {
                "type": "Car Contract",
                "url": "/uploads/documents/car_contract.pdf",
                "name": "car_contract.pdf",
                "expiryDate": "2025-12-31"
            },
            {
                "type": "Red Book Inspection Report",
                "url": "/uploads/documents/red_book_report.pdf",
                "name": "red_book_report.pdf",
                "expiryDate": "2025-06-30"
            },
            {
                "type": "Car Registration",
                "url": "/uploads/documents/car_registration.pdf",
                "name": "car_registration.pdf",
                "expiryDate": "2025-09-15"
            },
            {
                "type": "Car Insurance",
                "url": "/uploads/documents/car_insurance.pdf",
                "name": "car_insurance.pdf",
                "expiryDate": "2025-03-20"
            },
            {
                "type": "CPV Registration",
                "url": "/uploads/documents/cpv_registration.pdf",
                "name": "cpv_registration.pdf",
                "expiryDate": "2025-11-10"
            }
        ],
        "requiredDocuments": [],
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
    }
    
    vehicles.append(sample_vehicle)
    vehicle_id_counter = 2
    
    # Sample rental application
    sample_rental = {
        "id": 1,
        "vehicle_id": 1,
        "vehicle_details": sample_vehicle,
        "contract_period": "1 month",
        "first_name": "Joshua",
        "last_name": "Bayagalla",
        "email": "joshbayagalla@gmail.com",
        "phone": "08096432168",
        "license_number": "12KWDWDHU12",
        "license_expiry": "2025-08-30",
        "address": "12-1-468/12 Shiva Shanker Colony, Fathullaguda",
        "emergency_contact": "Emergency Contact",
        "emergency_phone": "1212121",
        "status": "approved",
        "submitted_at": "2024-01-01T00:00:00.000Z",
        "admin_notes": "",
        "processed_at": "2024-01-01T00:00:00.000Z",
        "processed_by": "admin@example.com",
        "payment_receipt_url": "/uploads/payments/sample_payment_receipt.png",
        "payment_receipt_uploaded": True
    }
    
    rental_applications.append(sample_rental)
    application_id_counter = 2

# Initialize sample data
initialize_sample_data()

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
        "message": "Email verified successfully!",
        "verified": True
    }

@app.post("/api/resend-verification")
async def resend_verification(resend_data: dict):
    """Resend verification email endpoint"""
    email = resend_data.get("email", "")
    
    # For demo purposes, always return success
    return {
        "message": "Verification email sent successfully!",
        "email": email
    }

# File upload endpoint
@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload a file (image or document)"""
    try:
        # Determine upload directory based on file type
        if file.content_type and file.content_type.startswith('image/'):
            upload_dir = "uploads/vehicles"
        else:
            upload_dir = "uploads/documents"
        
        # Create directory if it doesn't exist
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{file.filename}"
        file_path = os.path.join(upload_dir, filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Return the URL path
        url_path = f"/{upload_dir}/{filename}"
        
        return {
            "message": "File uploaded successfully",
            "url": url_path,
            "filename": filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

# Payment receipt upload endpoint
@app.post("/api/upload-payment-receipt")
async def upload_payment_receipt(file: UploadFile = File(...)):
    """Upload payment receipt"""
    try:
        # Create payments directory if it doesn't exist
        upload_dir = "uploads/payments"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"payment_{timestamp}_{file.filename}"
        file_path = os.path.join(upload_dir, filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Return the URL path
        url_path = f"/{upload_dir}/{filename}"
        
        return {
            "message": "Payment receipt uploaded successfully",
            "url": url_path,
            "filename": filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

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
        "documents": vehicle_data.get("documents", []),
        "requiredDocuments": vehicle_data.get("requiredDocuments", []),
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
        "document_types": [
            "Car Contract",
            "Red Book Inspection Report", 
            "Car Registration",
            "Car Insurance",
            "CPV Registration",
            "Driver License",
            "Insurance Certificate",
            "Registration Certificate"
        ]
    }

# Rental applications endpoints
@app.post("/api/rentals")
async def create_rental_application(rental_data: SimpleRental):
    """Create a new rental application"""
    global application_id_counter
    
    # Find the vehicle
    vehicle = next((v for v in vehicles if v["id"] == rental_data.vehicle_id), None)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
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
        "status": "pending",
        "submitted_at": "2024-01-01T00:00:00.000Z",
        "admin_notes": "",
        "processed_at": None,
        "processed_by": None,
        "payment_receipt_url": "",
        "payment_receipt_uploaded": False
    }
    
    rental_applications.append(application)
    application_id_counter += 1
    
    return {
        "message": "Rental application submitted successfully",
        "application": application
    }

@app.get("/api/rental-applications")
async def get_rental_applications():
    """Get all rental applications for admin review"""
    print(f"DEBUG: Current rental_applications: {rental_applications}")  # Debug log
    
    # When returning rental applications, ensure vehicle_details include documents
    # This is already included if we return the full vehicle dict. If not, add:
    for app in rental_applications:
        # Ensure app has a proper status field
        if not app.get("status") or app["status"] not in ["pending", "payment_received", "approved", "rejected"]:
            print(f"DEBUG: Fixing status for app {app.get('id')}: {app.get('status')} -> pending")  # Debug log
            app["status"] = "pending"
        
        vehicle = next((v for v in vehicles if v["id"] == app.get("vehicle_id")), None)
        if vehicle:
            app["vehicle_details"] = vehicle
    
    print(f"DEBUG: Returning rental_applications: {rental_applications}")  # Debug log
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

# Document expiry management endpoints
@app.get("/api/document-expiry-alerts")
async def get_document_expiry_alerts():
    """Get all documents that are expiring soon or have expired"""
    from datetime import datetime, timedelta
    
    alerts = []
    today = datetime.now()
    
    for vehicle in vehicles:
        if vehicle.get("documents"):
            for doc_index, doc in enumerate(vehicle["documents"]):
                if doc.get("expiryDate"):
                    try:
                        expiry_date = datetime.fromisoformat(doc["expiryDate"].replace('Z', '+00:00'))
                        days_until_expiry = (expiry_date - today).days
                        
                        alert = {
                            "vehicle_id": vehicle["id"],
                            "vehicle_name": f"{vehicle['make']} {vehicle['model']} ({vehicle['licensePlate']})",
                            "document_type": doc["type"],
                            "document_name": doc.get("name", ""),
                            "document_index": doc_index,
                            "expiry_date": doc["expiryDate"],
                            "days_until_expiry": days_until_expiry,
                            "status": "expired" if days_until_expiry < 0 else "expiring_soon" if days_until_expiry <= 30 else "valid",
                            "alert_level": "critical" if days_until_expiry < 0 else "warning" if days_until_expiry <= 7 else "info" if days_until_expiry <= 30 else "normal"
                        }
                        alerts.append(alert)
                    except Exception as e:
                        print(f"Error parsing expiry date for document {doc.get('type')}: {e}")
    
    # Sort by urgency (expired first, then by days until expiry)
    alerts.sort(key=lambda x: (x["days_until_expiry"], x["document_type"]))
    return alerts

@app.put("/api/vehicles/{vehicle_id}/documents/{document_index}/expiry")
async def update_document_expiry(vehicle_id: int, document_index: int, expiry_data: dict):
    """Update document expiry date"""
    vehicle = next((v for v in vehicles if v["id"] == vehicle_id), None)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    if not vehicle.get("documents") or document_index >= len(vehicle["documents"]):
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Update the document's expiry date
    vehicle["documents"][document_index]["expiryDate"] = expiry_data.get("expiryDate")
    vehicle["updatedAt"] = datetime.now().isoformat()
    
    return {
        "message": "Document expiry date updated successfully",
        "document": vehicle["documents"][document_index]
    }

@app.get("/api/dashboard/document-stats")
async def get_document_stats():
    """Get document statistics for admin dashboard"""
    from datetime import datetime, timedelta
    
    total_documents = 0
    expired_documents = 0
    expiring_soon_documents = 0
    valid_documents = 0
    today = datetime.now()
    
    for vehicle in vehicles:
        if vehicle.get("documents"):
            for doc in vehicle["documents"]:
                total_documents += 1
                if doc.get("expiryDate"):
                    try:
                        expiry_date = datetime.fromisoformat(doc["expiryDate"].replace('Z', '+00:00'))
                        days_until_expiry = (expiry_date - today).days
                        
                        if days_until_expiry < 0:
                            expired_documents += 1
                        elif days_until_expiry <= 30:
                            expiring_soon_documents += 1
                        else:
                            valid_documents += 1
                    except:
                        valid_documents += 1
                else:
                    valid_documents += 1
    
    return {
        "total_documents": total_documents,
        "expired_documents": expired_documents,
        "expiring_soon_documents": expiring_soon_documents,
        "valid_documents": valid_documents
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
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
