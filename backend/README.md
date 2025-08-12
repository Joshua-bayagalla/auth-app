# 🚗 Vehicle Rental System - FastAPI Backend

A modern, scalable backend API for managing vehicle rentals, drivers, and documents built with FastAPI and PostgreSQL.

## 🏗️ Architecture

- **Framework**: FastAPI (Python 3.8+)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT tokens with email verification
- **File Storage**: Local file system with organized uploads
- **Email Service**: SMTP integration for notifications
- **Documentation**: Auto-generated OpenAPI/Swagger docs

## 📋 Features

### 🔐 Authentication & Authorization
- User registration with email verification
- JWT-based authentication
- Role-based access control (User/Admin)
- Password hashing with bcrypt
- Email verification system

### 🚗 Vehicle Management
- CRUD operations for vehicles
- Vehicle photo uploads
- Status tracking (Available, Rented, Maintenance)
- Detailed vehicle information (VIN, license plate, etc.)
- Vehicle statistics and reporting

### 👤 Driver Management
- Comprehensive driver profiles
- Document upload and management
- Contract management
- Payment status tracking
- Driver statistics

### 📄 Document Management
- Multiple document types support
- Secure file uploads
- Document expiry tracking
- File download with access control
- Document organization by driver

### 📊 Dashboard & Analytics
- Real-time statistics
- Vehicle fleet overview
- Driver activity tracking
- Rental analytics
- Performance metrics

## 🚀 Quick Start

### Prerequisites

1. **Python 3.8+**
2. **PostgreSQL 12+**
3. **pip** (Python package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd auth-app/backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb vehicle_rental_db
   
   # Or using psql
   psql -U postgres
   CREATE DATABASE vehicle_rental_db;
   ```

5. **Configure environment**
   ```bash
   # Copy and edit the configuration
   cp config.py config_local.py
   # Edit config_local.py with your settings
   ```

6. **Run database migrations**
   ```bash
   # Initialize Alembic (first time only)
   alembic init alembic
   
   # Create initial migration
   alembic revision --autogenerate -m "Initial migration"
   
   # Apply migrations
   alembic upgrade head
   ```

7. **Start the server**
   ```bash
   python start.py
   ```

The API will be available at:
- **API**: http://localhost:8000
- **Documentation**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/verify-email` | Verify email address |
| POST | `/api/auth/resend-verification` | Resend verification email |
| POST | `/api/auth/create-admin` | Create admin user |

### Vehicle Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vehicles` | Get all vehicles |
| POST | `/api/vehicles` | Create new vehicle |
| GET | `/api/vehicles/{id}` | Get vehicle by ID |
| PUT | `/api/vehicles/{id}` | Update vehicle |
| DELETE | `/api/vehicles/{id}` | Delete vehicle |
| GET | `/api/vehicles/stats/overview` | Get vehicle statistics |

### Driver Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/drivers` | Get all drivers |
| POST | `/api/drivers` | Create new driver |
| GET | `/api/drivers/{id}` | Get driver by ID |
| PUT | `/api/drivers/{id}` | Update driver |
| DELETE | `/api/drivers/{id}` | Delete driver |
| POST | `/api/drivers/{id}/documents` | Upload driver document |
| GET | `/api/drivers/{id}/documents` | Get driver documents |
| DELETE | `/api/drivers/{id}/documents/{doc_id}` | Delete document |
| POST | `/api/drivers/{id}/contract` | Update contract |
| POST | `/api/drivers/{id}/payment` | Update payment status |
| GET | `/api/drivers/stats/overview` | Get driver statistics |

### Rental Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rentals` | Get all rentals |
| POST | `/api/rentals` | Create new rental |
| GET | `/api/rentals/{id}` | Get rental by ID |
| GET | `/api/rentals/driver/{driver_id}` | Get driver rentals |
| GET | `/api/rentals/vehicle/{vehicle_id}` | Get vehicle rentals |
| DELETE | `/api/rentals/{id}` | Delete rental |
| GET | `/api/rentals/stats/overview` | Get rental statistics |

### Utility Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get comprehensive dashboard stats |
| GET | `/api/document-types` | Get available document types |
| GET | `/api/documents/{driver_id}/{doc_id}/download` | Download document |
| GET | `/health` | Health check |

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/vehicle_rental_db

# Security
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=your-email@gmail.com

# File Upload Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
ALLOWED_EXTENSIONS=pdf,doc,docx,jpg,jpeg,png

# Application Configuration
DEBUG=True
HOST=0.0.0.0
PORT=8000
```

### Database Configuration

The application uses PostgreSQL with the following default configuration:
- **Host**: localhost
- **Port**: 5432
- **Database**: vehicle_rental_db
- **User**: postgres
- **Password**: password

## 📁 Project Structure

```
backend/
├── alembic/                 # Database migrations
├── routers/                 # API route handlers
│   ├── auth.py             # Authentication routes
│   ├── vehicles.py         # Vehicle management routes
│   ├── drivers.py          # Driver management routes
│   └── rentals.py          # Rental management routes
├── uploads/                 # File uploads directory
│   ├── vehicles/           # Vehicle photos
│   ├── documents/          # Driver documents
│   └── payments/           # Payment receipts
├── auth.py                  # Authentication utilities
├── config.py               # Configuration settings
├── database.py             # Database connection
├── email_service.py        # Email service
├── file_service.py         # File management
├── main.py                 # FastAPI application
├── models.py               # SQLAlchemy models
├── schemas.py              # Pydantic schemas
├── start.py                # Startup script
├── requirements.txt        # Python dependencies
└── README.md              # This file
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Email Verification**: Required for account activation
- **Role-based Access**: Different permissions for users and admins
- **File Upload Security**: File type and size validation
- **CORS Protection**: Configured for specific origins
- **Input Validation**: Pydantic models for request validation

## 📊 Database Schema

### Core Tables

1. **users** - User accounts and authentication
2. **vehicles** - Vehicle inventory and details
3. **drivers** - Driver profiles and information
4. **documents** - Driver document storage
5. **rentals** - Rental agreements and history

### Key Relationships

- Users can have multiple roles (user/admin)
- Drivers can be associated with vehicles
- Documents belong to specific drivers
- Rentals link drivers and vehicles
- All entities have audit trails (created_at, updated_at)

## 🧪 Testing

### Running Tests

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest

# Run with coverage
pytest --cov=.
```

### Test Structure

```
tests/
├── test_auth.py           # Authentication tests
├── test_vehicles.py       # Vehicle management tests
├── test_drivers.py        # Driver management tests
├── test_rentals.py        # Rental management tests
└── conftest.py           # Test configuration
```

## 🚀 Deployment

### Production Setup

1. **Environment Configuration**
   ```bash
   # Set production environment variables
   export DEBUG=False
   export SECRET_KEY=your-production-secret-key
   export DATABASE_URL=your-production-database-url
   ```

2. **Database Migration**
   ```bash
   alembic upgrade head
   ```

3. **Static Files**
   ```bash
   # Ensure upload directory exists
   mkdir -p uploads/{vehicles,documents,payments}
   ```

4. **Process Management**
   ```bash
   # Using Gunicorn
   pip install gunicorn
   gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

### Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/docs`
- Review the logs for error details

## 🔄 Changelog

### Version 1.0.0
- Initial release
- Complete CRUD operations for all entities
- Authentication and authorization
- File upload and management
- Email verification system
- Dashboard statistics
- Comprehensive API documentation
