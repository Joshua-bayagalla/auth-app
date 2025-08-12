#!/usr/bin/env python3
"""
Startup script for Vehicle Rental System FastAPI Backend
"""

import uvicorn
import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from config import settings

def main():
    """Start the FastAPI server"""
    print("🚀 Starting Vehicle Rental System Backend...")
    print(f"📍 Host: {settings.host}")
    print(f"🔌 Port: {settings.port}")
    print(f"🐛 Debug: {settings.debug}")
    print(f"🗄️  Database: {settings.database_url.split('@')[1] if '@' in settings.database_url else 'Not configured'}")
    print("=" * 50)
    
    try:
        uvicorn.run(
            "main:app",
            host=settings.host,
            port=settings.port,
            reload=settings.debug,
            log_level="info" if settings.debug else "warning"
        )
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
