#!/usr/bin/env python3
"""
Setup script for Vehicle Rental System FastAPI Backend
"""

import os
import sys
import subprocess
from pathlib import Path

def run_command(command, description):
    """Run a shell command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e.stderr}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        sys.exit(1)
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")

def create_directories():
    """Create necessary directories"""
    directories = [
        "uploads",
        "uploads/vehicles",
        "uploads/documents", 
        "uploads/payments"
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"✅ Created directory: {directory}")

def install_dependencies():
    """Install Python dependencies"""
    if not run_command("pip install -r requirements.txt", "Installing dependencies"):
        print("❌ Failed to install dependencies")
        sys.exit(1)

def setup_database():
    """Setup database connection"""
    print("🗄️  Database Setup")
    print("Please ensure PostgreSQL is running and create a database named 'vehicle_rental_db'")
    print("You can do this by running:")
    print("  createdb vehicle_rental_db")
    print("  OR")
    print("  psql -U postgres -c 'CREATE DATABASE vehicle_rental_db;'")
    
    input("Press Enter when the database is ready...")

def run_migrations():
    """Run database migrations"""
    if not run_command("alembic upgrade head", "Running database migrations"):
        print("❌ Failed to run migrations")
        sys.exit(1)

def create_admin_user():
    """Create initial admin user"""
    print("👤 Admin User Setup")
    print("Creating initial admin user...")
    
    admin_email = input("Enter admin email: ")
    admin_password = input("Enter admin password: ")
    
    # Create a simple script to create admin user
    admin_script = f"""
import sys
sys.path.append('.')
from database import SessionLocal
from models import User, UserRole
from auth import get_password_hash

db = SessionLocal()
try:
    admin_user = User(
        email='{admin_email}',
        hashed_password=get_password_hash('{admin_password}'),
        role=UserRole.ADMIN,
        is_verified=True
    )
    db.add(admin_user)
    db.commit()
    print("✅ Admin user created successfully")
except Exception as e:
    print(f"❌ Error creating admin user: {{e}}")
    db.rollback()
finally:
    db.close()
"""
    
    with open("create_admin.py", "w") as f:
        f.write(admin_script)
    
    if run_command("python create_admin.py", "Creating admin user"):
        os.remove("create_admin.py")
        print("✅ Admin user setup completed")
    else:
        print("❌ Failed to create admin user")

def main():
    """Main setup function"""
    print("🚀 Vehicle Rental System - FastAPI Backend Setup")
    print("=" * 50)
    
    # Check Python version
    check_python_version()
    
    # Create directories
    create_directories()
    
    # Install dependencies
    install_dependencies()
    
    # Setup database
    setup_database()
    
    # Run migrations
    run_migrations()
    
    # Create admin user
    create_admin_user()
    
    print("\n🎉 Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Configure your email settings in config.py")
    print("2. Update database connection if needed")
    print("3. Start the server: python start.py")
    print("4. Access the API at: http://localhost:8000")
    print("5. View documentation at: http://localhost:8000/docs")
    
    print("\n🔧 Configuration files:")
    print("- config.py: Main configuration")
    print("- .env: Environment variables (create if needed)")
    
    print("\n📚 Documentation:")
    print("- README.md: Complete setup and usage guide")
    print("- /docs: Auto-generated API documentation")

if __name__ == "__main__":
    main()

