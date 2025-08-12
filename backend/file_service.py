import os
import aiofiles
import uuid
from datetime import datetime
from typing import Optional
from fastapi import UploadFile, HTTPException
from config import settings
import magic

class FileService:
    def __init__(self):
        self.upload_dir = settings.upload_dir
        self.max_file_size = settings.max_file_size
        self.allowed_extensions = settings.allowed_extensions.split(',')
        
        # Create upload directories if they don't exist
        self._create_upload_directories()

    def _create_upload_directories(self):
        """Create necessary upload directories"""
        directories = [
            os.path.join(self.upload_dir, "vehicles"),
            os.path.join(self.upload_dir, "documents"),
            os.path.join(self.upload_dir, "payments")
        ]
        
        for directory in directories:
            os.makedirs(directory, exist_ok=True)

    async def save_vehicle_photo(self, file: UploadFile) -> dict:
        """Save vehicle photo and return file info"""
        return await self._save_file(file, "vehicles", ["jpg", "jpeg", "png", "webp"])

    async def save_document(self, file: UploadFile) -> dict:
        """Save document and return file info"""
        return await self._save_file(file, "documents", ["pdf", "doc", "docx", "jpg", "jpeg", "png"])

    async def save_payment_receipt(self, file: UploadFile) -> dict:
        """Save payment receipt and return file info"""
        return await self._save_file(file, "payments", ["pdf", "jpg", "jpeg", "png"])

    async def _save_file(self, file: UploadFile, subdirectory: str, allowed_types: list) -> dict:
        """Generic file save method"""
        try:
            # Validate file size
            if file.size and file.size > self.max_file_size:
                raise HTTPException(status_code=400, detail="File too large")

            # Validate file type
            file_extension = file.filename.split('.')[-1].lower() if file.filename else ''
            if file_extension not in allowed_types:
                raise HTTPException(status_code=400, detail=f"File type not allowed. Allowed types: {', '.join(allowed_types)}")

            # Generate unique filename
            unique_id = str(uuid.uuid4())
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{subdirectory}_{timestamp}_{unique_id}.{file_extension}"
            
            # Create file path
            file_path = os.path.join(self.upload_dir, subdirectory, filename)
            
            # Save file
            async with aiofiles.open(file_path, 'wb') as f:
                content = await file.read()
                await f.write(content)
            
            # Get file size
            file_size = len(content)
            
            # Create URL path
            url_path = f"/uploads/{subdirectory}/{filename}"
            
            return {
                "file_name": file.filename,
                "file_path": file_path,
                "file_url": url_path,
                "file_size": file_size,
                "content_type": file.content_type
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")

    def delete_file(self, file_path: str) -> bool:
        """Delete file from filesystem"""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
            return False
        except Exception as e:
            print(f"Error deleting file {file_path}: {e}")
            return False

    def get_file_info(self, file_path: str) -> Optional[dict]:
        """Get file information"""
        try:
            if not os.path.exists(file_path):
                return None
            
            stat = os.stat(file_path)
            return {
                "file_path": file_path,
                "file_size": stat.st_size,
                "created_at": datetime.fromtimestamp(stat.st_ctime),
                "modified_at": datetime.fromtimestamp(stat.st_mtime)
            }
        except Exception as e:
            print(f"Error getting file info: {e}")
            return None

# Create file service instance
file_service = FileService()
