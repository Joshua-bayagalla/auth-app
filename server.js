import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads', 'documents');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure multer for vehicle photos
const vehiclePhotoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads', 'vehicles');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'vehicle-photo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow only PDF, DOC, DOCX, JPG, PNG files
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, JPG, PNG files are allowed!'));
    }
  }
});

const uploadVehiclePhoto = multer({
  storage: vehiclePhotoStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for photos
  },
  fileFilter: function (req, file, cb) {
    // Allow only image files for vehicle photos
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, WEBP image files are allowed for vehicle photos!'));
    }
  }
});

// Multer configuration for payment receipt uploads
const uploadPaymentReceipt = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/payments/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'payment-receipt-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed for payment receipts'));
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Serve uploaded documents and vehicle photos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Download document endpoint
app.get('/api/documents/:driverId/:docId/download', (req, res) => {
  try {
    const driverId = parseInt(req.params.driverId);
    const docId = parseInt(req.params.docId);
    
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    
    const document = driver.documents?.find(doc => doc.id === docId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Check if driver has paid (for access control)
    if (!driver.paymentReceiptUploaded) {
      return res.status(403).json({ error: 'Payment required to access documents' });
    }
    
    const filePath = path.join(__dirname, document.filePath);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.download(filePath, document.fileName);
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// File-based storage (simple JSON files)
const USERS_FILE = path.join(__dirname, 'users.json');
const TOKENS_FILE = path.join(__dirname, 'tokens.json');
const VEHICLES_FILE = path.join(__dirname, 'vehicles.json');

// Load data from files
function loadData() {
  try {
    const usersData = fs.existsSync(USERS_FILE) ? JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')) : {};
    const tokensData = fs.existsSync(TOKENS_FILE) ? JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8')) : {};
    const vehiclesData = fs.existsSync(VEHICLES_FILE) ? JSON.parse(fs.readFileSync(VEHICLES_FILE, 'utf8')) : [];
    
    // Convert back to Maps
    const users = new Map(Object.entries(usersData));
    const verificationTokens = new Map(Object.entries(tokensData));
    const vehicles = vehiclesData; // Assuming vehicles are stored directly in the file
    
    return { users, verificationTokens, vehicles };
  } catch (error) {
    console.error('Error loading data:', error);
    return { users: new Map(), verificationTokens: new Map(), vehicles: [] };
  }
}

// Save data to files
function saveData(users, verificationTokens, vehicles, driversData = []) {
  try {
    // Convert Maps to objects for JSON serialization
    const usersData = Object.fromEntries(users);
    const tokensData = Object.fromEntries(verificationTokens);
    
    fs.writeFileSync(USERS_FILE, JSON.stringify(usersData, null, 2));
    fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokensData, null, 2));
    fs.writeFileSync(VEHICLES_FILE, JSON.stringify(vehicles, null, 2));
    fs.writeFileSync('drivers.json', JSON.stringify(driversData, null, 2));
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

// Initialize storage
let { users, verificationTokens, vehicles } = loadData();

// Add drivers array to storage
let drivers = [];

// Load drivers from file if exists
try {
  if (fs.existsSync('drivers.json')) {
    const driversData = fs.readFileSync('drivers.json', 'utf8');
    drivers = JSON.parse(driversData);
  }
} catch (error) {
  console.error('Error loading drivers:', error);
  drivers = [];
}

// Document types configuration
const DOCUMENT_TYPES = {
  car_contract: 'Car Contract',
  red_book_inspection: 'Red Book Inspection Report',
  car_registration: 'Car Registration',
  car_insurance: 'Car Insurance',
  cpv_registration: 'CPV Registration'
};

// Email configuration with Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Generate verification token
function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Send verification email using Gmail SMTP
async function sendVerificationEmail(email, token) {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify?token=${token}&email=${email}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'your-email@gmail.com',
    to: email,
    subject: 'Verify Your Email Address',
    html: `
      <h1>Email Verification</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account, please ignore this email.</p>
    `
  };

  try {
    console.log('Attempting to send email with Gmail SMTP...');
    console.log('From:', process.env.EMAIL_USER || 'your-email@gmail.com');
    console.log('To:', email);
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully to:', email);
    console.log('Email sent:', result.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  const { email, password, role = 'user' } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  if (users.has(email)) {
    return res.status(400).json({ error: 'User already exists' });
  }
  
  // Generate verification token
  const token = generateVerificationToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  // Store user and verification token
  users.set(email, { email, password, verified: false, role });
  verificationTokens.set(token, { email, expiresAt });
  
  // Save data to files
  saveData(users, verificationTokens, vehicles);

  // Send verification email
  const emailSent = await sendVerificationEmail(email, token);
  
  if (emailSent) {
    res.json({ message: 'User registered successfully. Please check your email to verify your account.' });
  } else {
    res.status(500).json({ error: 'Failed to send verification email' });
  }
});

// Verify email endpoint
app.post('/api/verify-email', async (req, res) => {
  const { token, email } = req.body;
  
  console.log('Verification attempt:', { token: token?.substring(0, 10) + '...', email });
  console.log('Stored tokens:', Array.from(verificationTokens.keys()).map(t => t.substring(0, 10) + '...'));
  console.log('Stored users:', Array.from(users.keys()));
  
  if (!token || !email) {
    return res.status(400).json({ error: 'Token and email are required' });
  }
  
  const tokenData = verificationTokens.get(token);
  
  if (!tokenData) {
    console.log('Token not found in storage');
    return res.status(400).json({ error: 'Invalid verification token' });
  }
  
  if (tokenData.email !== email) {
    console.log('Token email mismatch:', { tokenEmail: tokenData.email, providedEmail: email });
    return res.status(400).json({ error: 'Token does not match email' });
  }
  
  if (new Date() > tokenData.expiresAt) {
    console.log('Token expired');
    verificationTokens.delete(token);
    saveData(users, verificationTokens, vehicles); // Save after deleting expired token
    return res.status(400).json({ error: 'Verification token has expired' });
  }
  
  // Mark user as verified
  const user = users.get(email);
  if (user) {
    user.verified = true;
    verificationTokens.delete(token);
    saveData(users, verificationTokens, vehicles); // Save after verifying user
    console.log('User verified successfully:', email);
    res.json({ message: 'Email verified successfully' });
  } else {
    console.log('User not found:', email);
    res.status(404).json({ error: 'User not found' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  const user = users.get(email);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  if (user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  if (!user.verified) {
    return res.status(401).json({ error: 'Please verify your email before logging in', needsVerification: true });
  }
  
  res.json({ message: 'Login successful', user: { email: user.email, verified: user.verified, role: user.role } });
});

// Resend verification email
app.post('/api/resend-verification', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  const user = users.get(email);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  if (user.verified) {
    return res.status(400).json({ error: 'User is already verified' });
  }
  
  // Generate new verification token
  const token = generateVerificationToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  verificationTokens.set(token, { email, expiresAt });
  saveData(users, verificationTokens, vehicles); // Save after generating new token
  
  // Send verification email
  const emailSent = await sendVerificationEmail(email, token);
  
  if (emailSent) {
    res.json({ message: 'Verification email sent successfully' });
  } else {
    res.status(500).json({ error: 'Failed to send verification email' });
  }
});

// Create admin user endpoint (for testing)
app.post('/api/create-admin', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  if (users.has(email)) {
    return res.status(400).json({ error: 'User already exists' });
  }
  
  // Create admin user directly (no email verification for admin)
  users.set(email, { email, password, verified: true, role: 'admin' });
  saveData(users, verificationTokens, vehicles);
  
  res.json({ message: 'Admin user created successfully', user: { email, role: 'admin', verified: true } });
});

// Vehicle management endpoints
app.post('/api/vehicles', uploadVehiclePhoto.single('vehiclePhoto'), async (req, res) => {
  try {
    const {
      make, model, year, licensePlate, vin, bondAmount, rentPerWeek,
      currentMileage, odoMeter, nextServiceDate, vehicleType, color,
      fuelType, transmission, status, ownerName
    } = req.body;

    // Validate required fields
    if (!make || !model || !year || !licensePlate || !vin) {
      return res.status(400).json({ error: 'Make, model, year, license plate, and VIN are required' });
    }

    // Check for duplicate license plate or VIN
    const existingVehicle = vehicles.find(v => 
      v.licensePlate === licensePlate || v.vin === vin
    );
    if (existingVehicle) {
      return res.status(400).json({ error: 'Vehicle with this license plate or VIN already exists' });
    }

    const newVehicle = {
      id: Date.now(),
      make,
      model,
      year,
      licensePlate,
      vin,
      bondAmount: bondAmount ? parseInt(bondAmount) : 0,
      rentPerWeek: rentPerWeek ? parseInt(rentPerWeek) : 0,
      currentMileage: currentMileage ? parseInt(currentMileage) : 0,
      odoMeter: odoMeter ? parseInt(odoMeter) : 0,
      nextServiceDate,
      vehicleType: vehicleType || 'sedan',
      color,
      fuelType: fuelType || 'petrol',
      transmission: transmission || 'automatic',
      status: status || 'available',
      ownerName: ownerName || '',
      photoUrl: req.file ? `/uploads/vehicles/${req.file.filename}` : null,
      photoPath: req.file ? req.file.path : null,
      photoName: req.file ? req.file.originalname : null,
      photoSize: req.file ? req.file.size : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    vehicles.push(newVehicle);
    saveData(users, verificationTokens, vehicles, drivers);
    
    console.log('Vehicle added:', newVehicle);
    res.json({ message: 'Vehicle added successfully', vehicle: newVehicle });
  } catch (error) {
    console.error('Error adding vehicle:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/vehicles/:id', uploadVehiclePhoto.single('vehiclePhoto'), async (req, res) => {
  try {
    const vehicleId = parseInt(req.params.id);
    const vehicleIndex = vehicles.findIndex(v => v.id === vehicleId);
    
    if (vehicleIndex === -1) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const {
      make, model, year, licensePlate, vin, bondAmount, rentPerWeek,
      currentMileage, odoMeter, nextServiceDate, vehicleType, color,
      fuelType, transmission, status, ownerName
    } = req.body;

    // Validate required fields
    if (!make || !model || !year || !licensePlate || !vin) {
      return res.status(400).json({ error: 'Make, model, year, license plate, and VIN are required' });
    }

    // Check for duplicate license plate or VIN (excluding current vehicle)
    const existingVehicle = vehicles.find(v => 
      v.id !== vehicleId && (v.licensePlate === licensePlate || v.vin === vin)
    );
    if (existingVehicle) {
      return res.status(400).json({ error: 'Vehicle with this license plate or VIN already exists' });
    }

    // Update vehicle data
    const updatedVehicle = {
      ...vehicles[vehicleIndex],
      make,
      model,
      year,
      licensePlate,
      vin,
      bondAmount: bondAmount ? parseInt(bondAmount) : 0,
      rentPerWeek: rentPerWeek ? parseInt(rentPerWeek) : 0,
      currentMileage: currentMileage ? parseInt(currentMileage) : 0,
      odoMeter: odoMeter ? parseInt(odoMeter) : 0,
      nextServiceDate,
      vehicleType: vehicleType || 'sedan',
      color,
      fuelType: fuelType || 'petrol',
      transmission: transmission || 'automatic',
      status: status || 'available',
      ownerName: ownerName || '',
      updatedAt: new Date().toISOString()
    };

    // Handle photo update
    if (req.file) {
      // Delete old photo if exists
      if (vehicles[vehicleIndex].photoPath && fs.existsSync(vehicles[vehicleIndex].photoPath)) {
        fs.unlinkSync(vehicles[vehicleIndex].photoPath);
      }
      
      // Update with new photo
      updatedVehicle.photoUrl = `/uploads/vehicles/${req.file.filename}`;
      updatedVehicle.photoPath = req.file.path;
      updatedVehicle.photoName = req.file.originalname;
      updatedVehicle.photoSize = req.file.size;
    }

    vehicles[vehicleIndex] = updatedVehicle;
    saveData(users, verificationTokens, vehicles, drivers);
    
    console.log('Vehicle updated:', updatedVehicle);
    res.json({ message: 'Vehicle updated successfully', vehicle: updatedVehicle });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/vehicles', (req, res) => {
  try {
    res.json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/vehicles/:id', (req, res) => {
  try {
    const vehicle = vehicles.find(v => v.id === parseInt(req.params.id));
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/vehicles/:id', (req, res) => {
  try {
    const vehicleIndex = vehicles.findIndex(v => v.id === parseInt(req.params.id));
    if (vehicleIndex === -1) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const deletedVehicle = vehicles.splice(vehicleIndex, 1)[0];
    saveData(users, verificationTokens, vehicles);

    res.json({ message: 'Vehicle deleted successfully', vehicle: deletedVehicle });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Driver management endpoints
app.post('/api/drivers', (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      licenseNumber,
      licenseExpiry,
      address,
      emergencyContact,
      emergencyPhone,
      selectedVehicleId,
      contractStartDate,
      contractEndDate,
      contractPeriod,
      bondAmount,
      weeklyRent,
      contractSigned,
      paymentReceiptUploaded,
      paymentReceiptUrl,
      status
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !licenseNumber) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if driver with same email or license number already exists
    const existingDriver = drivers.find(d => 
      d.email === email || d.licenseNumber === licenseNumber
    );
    
    if (existingDriver) {
      return res.status(400).json({ error: 'Driver with this email or license number already exists' });
    }

    // Check if selected vehicle exists and is available
    if (selectedVehicleId) {
      const selectedVehicle = vehicles.find(v => v.id === parseInt(selectedVehicleId));
      if (!selectedVehicle) {
        return res.status(400).json({ error: 'Selected vehicle not found' });
      }
      if (selectedVehicle.status !== 'available') {
        return res.status(400).json({ error: 'Selected vehicle is not available' });
      }
    }

    // Create new driver
    const newDriver = {
      id: Date.now(),
      firstName,
      lastName,
      email,
      phone,
      licenseNumber,
      licenseExpiry,
      address,
      emergencyContact,
      emergencyPhone,
      selectedVehicleId: selectedVehicleId ? parseInt(selectedVehicleId) : null,
      contractStartDate,
      contractEndDate,
      contractPeriod,
      bondAmount: bondAmount ? parseInt(bondAmount) : 0,
      weeklyRent: weeklyRent ? parseInt(weeklyRent) : 0,
      contractSigned: contractSigned || false,
      paymentReceiptUploaded: paymentReceiptUploaded || false,
      paymentReceiptUrl: paymentReceiptUrl || null,
      status: status || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    drivers.push(newDriver);
    
    // Update vehicle status if assigned
    if (selectedVehicleId) {
      const vehicleIndex = vehicles.findIndex(v => v.id === parseInt(selectedVehicleId));
      if (vehicleIndex !== -1) {
        vehicles[vehicleIndex].status = 'assigned';
        vehicles[vehicleIndex].assignedDriverId = newDriver.id;
      }
    }
    
    saveData(users, verificationTokens, vehicles, drivers);

    console.log('Driver added:', newDriver);
    res.status(201).json({ message: 'Driver added successfully', driver: newDriver });
  } catch (error) {
    console.error('Error adding driver:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/drivers', (req, res) => {
  try {
    // Include vehicle details for each driver
    const driversWithVehicles = drivers.map(driver => {
      const vehicle = driver.selectedVehicleId ? 
        vehicles.find(v => v.id === driver.selectedVehicleId) : null;
      return {
        ...driver,
        vehicle
      };
    });
    res.json(driversWithVehicles);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/drivers/:id', (req, res) => {
  try {
    const driver = drivers.find(d => d.id === parseInt(req.params.id));
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    
    // Include vehicle details
    const vehicle = driver.selectedVehicleId ? 
      vehicles.find(v => v.id === driver.selectedVehicleId) : null;
    
    res.json({ ...driver, vehicle });
  } catch (error) {
    console.error('Error fetching driver:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/drivers/:id', (req, res) => {
  try {
    const driverIndex = drivers.findIndex(d => d.id === parseInt(req.params.id));
    if (driverIndex === -1) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    const oldVehicleId = drivers[driverIndex].selectedVehicleId;
    const newVehicleId = req.body.selectedVehicleId ? parseInt(req.body.selectedVehicleId) : null;

    // Handle vehicle reassignment
    if (oldVehicleId !== newVehicleId) {
      // Free up old vehicle
      if (oldVehicleId) {
        const oldVehicleIndex = vehicles.findIndex(v => v.id === oldVehicleId);
        if (oldVehicleIndex !== -1) {
          vehicles[oldVehicleIndex].status = 'available';
          vehicles[oldVehicleIndex].assignedDriverId = null;
        }
      }
      
      // Assign new vehicle
      if (newVehicleId) {
        const newVehicleIndex = vehicles.findIndex(v => v.id === newVehicleId);
        if (newVehicleIndex !== -1) {
          vehicles[newVehicleIndex].status = 'assigned';
          vehicles[newVehicleIndex].assignedDriverId = parseInt(req.params.id);
        }
      }
    }

    const updatedDriver = {
      ...drivers[driverIndex],
      ...req.body,
      id: parseInt(req.params.id), // Ensure ID doesn't change
      selectedVehicleId: newVehicleId,
      updatedAt: new Date().toISOString()
    };

    drivers[driverIndex] = updatedDriver;
    saveData(users, verificationTokens, vehicles, drivers);

    res.json({ message: 'Driver updated successfully', driver: updatedDriver });
  } catch (error) {
    console.error('Error updating driver:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/drivers/:id', (req, res) => {
  try {
    const driverIndex = drivers.findIndex(d => d.id === parseInt(req.params.id));
    if (driverIndex === -1) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    const deletedDriver = drivers.splice(driverIndex, 1)[0];
    
    // Free up assigned vehicle
    if (deletedDriver.selectedVehicleId) {
      const vehicleIndex = vehicles.findIndex(v => v.id === deletedDriver.selectedVehicleId);
      if (vehicleIndex !== -1) {
        vehicles[vehicleIndex].status = 'available';
        vehicles[vehicleIndex].assignedDriverId = null;
      }
    }
    
    saveData(users, verificationTokens, vehicles, drivers);

    res.json({ message: 'Driver deleted successfully', driver: deletedDriver });
  } catch (error) {
    console.error('Error deleting driver:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update contract status
app.post('/api/drivers/:id/contract', (req, res) => {
  try {
    const driverIndex = drivers.findIndex(d => d.id === parseInt(req.params.id));
    if (driverIndex === -1) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    const { contractSigned, contractStartDate, contractEndDate, contractPeriod } = req.body;
    
    drivers[driverIndex] = {
      ...drivers[driverIndex],
      contractSigned: contractSigned || false,
      contractStartDate,
      contractEndDate,
      contractPeriod,
      updatedAt: new Date().toISOString()
    };

    saveData(users, verificationTokens, vehicles, drivers);
    res.json({ message: 'Contract updated successfully', driver: drivers[driverIndex] });
  } catch (error) {
    console.error('Error updating contract:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update payment receipt
app.post('/api/drivers/:id/payment', (req, res) => {
  try {
    const driverIndex = drivers.findIndex(d => d.id === parseInt(req.params.id));
    if (driverIndex === -1) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    const { paymentReceiptUploaded, paymentReceiptUrl } = req.body;
    
    drivers[driverIndex] = {
      ...drivers[driverIndex],
      paymentReceiptUploaded: paymentReceiptUploaded || false,
      paymentReceiptUrl: paymentReceiptUrl || null,
      updatedAt: new Date().toISOString()
    };

    saveData(users, verificationTokens, vehicles, drivers);
    res.json({ message: 'Payment receipt updated successfully', driver: drivers[driverIndex] });
  } catch (error) {
    console.error('Error updating payment receipt:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Document management endpoints
app.post('/api/drivers/:id/documents', upload.single('documentFile'), async (req, res) => {
  try {
    const driverIndex = drivers.findIndex(d => d.id === parseInt(req.params.id));
    if (driverIndex === -1) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    const { documentType, expiryDate, uploadedBy } = req.body;

    if (!documentType || !req.file) {
      return res.status(400).json({ error: 'Document type and file are required' });
    }

    // Initialize documents array if it doesn't exist
    if (!drivers[driverIndex].documents) {
      drivers[driverIndex].documents = [];
    }

    const newDocument = {
      id: Date.now(),
      documentType,
      fileName: req.file.originalname,
      fileUrl: `/uploads/documents/${req.file.filename}`,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      expiryDate,
      uploadedBy: uploadedBy || 'admin',
      uploadedAt: new Date().toISOString(),
      status: 'active'
    };

    drivers[driverIndex].documents.push(newDocument);
    drivers[driverIndex].updatedAt = new Date().toISOString();

    saveData(users, verificationTokens, vehicles, drivers);
    res.json({ message: 'Document uploaded successfully', document: newDocument });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/drivers/:id/documents', (req, res) => {
  try {
    const driver = drivers.find(d => d.id === parseInt(req.params.id));
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    const documents = driver.documents || [];
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/drivers/:id/documents/:docId', (req, res) => {
  try {
    const driverIndex = drivers.findIndex(d => d.id === parseInt(req.params.id));
    if (driverIndex === -1) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    const { expiryDate, status } = req.body;
    const docId = parseInt(req.params.docId);

    const documentIndex = drivers[driverIndex].documents?.findIndex(doc => doc.id === docId);
    if (documentIndex === -1) {
      return res.status(404).json({ error: 'Document not found' });
    }

    drivers[driverIndex].documents[documentIndex] = {
      ...drivers[driverIndex].documents[documentIndex],
      expiryDate: expiryDate || drivers[driverIndex].documents[documentIndex].expiryDate,
      status: status || drivers[driverIndex].documents[documentIndex].status,
      updatedAt: new Date().toISOString()
    };

    drivers[driverIndex].updatedAt = new Date().toISOString();
    saveData(users, verificationTokens, vehicles, drivers);

    res.json({ message: 'Document updated successfully', document: drivers[driverIndex].documents[documentIndex] });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/drivers/:id/documents/:docId', (req, res) => {
  try {
    const driverIndex = drivers.findIndex(d => d.id === parseInt(req.params.id));
    if (driverIndex === -1) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    const docId = parseInt(req.params.docId);
    const documentIndex = drivers[driverIndex].documents?.findIndex(doc => doc.id === docId);
    
    if (documentIndex === -1) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const deletedDocument = drivers[driverIndex].documents.splice(documentIndex, 1)[0];
    drivers[driverIndex].updatedAt = new Date().toISOString();
    
    saveData(users, verificationTokens, vehicles, drivers);
    res.json({ message: 'Document deleted successfully', document: deletedDocument });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get document types
app.get('/api/document-types', (req, res) => {
  try {
    res.json(DOCUMENT_TYPES);
  } catch (error) {
    console.error('Error fetching document types:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Rental application endpoint
app.post('/api/rentals', uploadPaymentReceipt.single('paymentReceipt'), async (req, res) => {
  try {
    const {
      vehicleId,
      contractPeriod,
      firstName,
      lastName,
      email,
      phone,
      licenseNumber,
      licenseExpiry,
      address,
      emergencyContact,
      emergencyPhone,
      contractSigned,
      bondAmount,
      weeklyRent
    } = req.body;

    // Validate required fields
    if (!vehicleId || !contractPeriod || !firstName || !lastName || !email || !phone || 
        !licenseNumber || !licenseExpiry || !address || !emergencyContact || !emergencyPhone) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!contractSigned) {
      return res.status(400).json({ error: 'Contract must be signed' });
    }

    // Find the vehicle
    const vehicle = vehicles.find(v => v.id === parseInt(vehicleId));
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    if (vehicle.status !== 'available') {
      return res.status(400).json({ error: 'Vehicle is not available for rent' });
    }

    // Check if payment receipt was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'Payment receipt is required' });
    }

    // Create new driver entry
    const newDriver = {
      id: Date.now(),
      firstName,
      lastName,
      email,
      phone,
      licenseNumber,
      licenseExpiry,
      address,
      emergencyContact,
      emergencyPhone,
      selectedVehicleId: parseInt(vehicleId),
      contractStartDate: new Date().toISOString().split('T')[0],
      contractEndDate: null, // Will be calculated based on contract period
      contractPeriod,
      bondAmount: parseInt(bondAmount),
      weeklyRent: parseInt(weeklyRent),
      contractSigned: true,
      paymentReceiptUploaded: true,
      paymentReceiptUrl: `/uploads/payments/${req.file.filename}`,
      status: 'pending_approval',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      documents: []
    };

    // Calculate contract end date based on period
    const startDate = new Date();
    let endDate = new Date();
    
    switch (contractPeriod) {
      case '1 month':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case '3 months':
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case '6 months':
        endDate.setMonth(endDate.getMonth() + 6);
        break;
      case '12 months':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      default:
        endDate.setMonth(endDate.getMonth() + 1);
    }
    
    newDriver.contractEndDate = endDate.toISOString().split('T')[0];

    // Add to drivers array
    drivers.push(newDriver);

    // Update vehicle status to rented
    vehicle.status = 'rented';
    vehicle.updatedAt = new Date().toISOString();

    // Save data
    saveData(users, verificationTokens, vehicles, drivers);

    console.log('Rental application submitted:', {
      id: newDriver.id,
      vehicle: `${vehicle.make} ${vehicle.model}`,
      customer: `${firstName} ${lastName}`,
      contractPeriod,
      bondAmount,
      weeklyRent
    });

    res.status(201).json({
      message: 'Rental application submitted successfully',
      rentalId: newDriver.id
    });

  } catch (error) {
    console.error('Error submitting rental application:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`Backend: http://localhost:${PORT}`);
});
