import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
import { MongoClient } from 'mongodb';

// MongoDB Collections (replaces in-memory storage)
const getUsersCollection = () => db ? db.collection('users') : null;
const getVehiclesCollection = () => db ? db.collection('vehicles') : null;
const getDriversCollection = () => db ? db.collection('drivers') : null;
const getTokensCollection = () => db ? db.collection('tokens') : null;

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
let db;

// Connect to MongoDB
async function connectToMongoDB() {
  if (!MONGODB_URI) {
    console.log('MongoDB URI not found, using in-memory storage as fallback');
    return;
  }
  
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db('carrental');
    console.log('Connected to MongoDB successfully!');

    // Ensure collections exist without failing if they already do
    const requiredCollections = ['users', 'vehicles', 'drivers', 'tokens'];
    const existing = new Set((await db.listCollections().toArray()).map(c => c.name));
    for (const name of requiredCollections) {
      if (!existing.has(name)) {
        try {
          await db.createCollection(name);
          console.log(`Created collection: ${name}`);
        } catch (e) {
          console.warn(`Could not create collection ${name}:`, e?.message || e);
        }
      }
    }
    console.log('MongoDB collections ready!');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log('Falling back to in-memory storage');
    db = null;
  }
}

// Initialize MongoDB connection
connectToMongoDB();

const app = express();
const PORT = process.env.PORT || 3001;

// Configure multer for file uploads (memory storage for deployment)
const storage = multer.memoryStorage();

// Configure multer for vehicle photos (memory storage for deployment)
const vehiclePhotoStorage = multer.memoryStorage();

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

// Multer configuration for rental application uploads (memory storage for deployment)
const uploadRentalApplication = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit per file
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'paymentReceipt') {
      // Payment receipts can be images or PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed for payment receipts'));
      }
    } else if (file.fieldname === 'licenseCard') {
      // License card can be an image or PDF
      if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Only image and PDF files are allowed for license card'));
      }
    } else if (file.fieldname === 'carPhotos') {
      // Car photos must be images only
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for car photos'));
      }
    } else {
      cb(null, true);
    }
  }
});

// Keep the old uploadPaymentReceipt for backward compatibility
const uploadPaymentReceipt = uploadRentalApplication;

// Middleware
// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173', 
      'http://localhost:5178', 
      'http://localhost:3000',
      'https://auth-app-xw7c.onrender.com'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept', 'Content-Length'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

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

// Load data from MongoDB or fallback to in-memory
async function loadData() {
  try {
    const usersCollection = getUsersCollection();
    const tokensCollection = getTokensCollection();
    const vehiclesCollection = getVehiclesCollection();
    
    if (!usersCollection || !tokensCollection || !vehiclesCollection) {
      console.log('MongoDB not available, using in-memory storage');
      return { users: new Map(), verificationTokens: new Map(), vehicles: [] };
    }
    
    // Load users
    const usersData = await usersCollection.find({}).toArray();
    const users = new Map();
    usersData.forEach(user => {
      if (user && user.email) {
        users.set(user.email, user);
      }
    });
    
    // Load tokens
    const tokensData = await tokensCollection.find({}).toArray();
    const verificationTokens = new Map();
    tokensData.forEach(token => {
      if (token && token.token) {
        verificationTokens.set(token.token, token);
      }
    });
    
    // Load vehicles
    const vehicles = await vehiclesCollection.find({}).toArray();
    
    return { users, verificationTokens, vehicles };
  } catch (error) {
    console.error('Error loading data from MongoDB:', error);
    return { users: new Map(), verificationTokens: new Map(), vehicles: [] };
  }
}

// Save data to MongoDB or fallback to in-memory
async function saveData(users, verificationTokens, vehicles, driversData = []) {
  try {
    const usersCollection = getUsersCollection();
    const tokensCollection = getTokensCollection();
    const vehiclesCollection = getVehiclesCollection();
    const driversCollection = getDriversCollection();
    
    if (!usersCollection || !tokensCollection || !vehiclesCollection || !driversCollection) {
      console.log('MongoDB not available, skipping save operation');
      return;
    }
    
    // Save users
    const usersArray = Array.from(users.values()).filter(user => user && user.email);
    for (const user of usersArray) {
      await usersCollection.updateOne(
        { email: user.email },
        { $set: user },
        { upsert: true }
      );
    }
    
    // Save tokens
    const tokensArray = Array.from(verificationTokens.entries()).filter(([key, value]) => key && value);
    for (const [token, data] of tokensArray) {
      await tokensCollection.updateOne(
        { token: token },
        { $set: { token, ...data } },
        { upsert: true }
      );
    }
    
    // Save vehicles
    if (vehicles && vehicles.length > 0) {
      for (const vehicle of vehicles) {
        await vehiclesCollection.updateOne(
          { id: vehicle.id },
          { $set: vehicle },
          { upsert: true }
        );
      }
    }
    
    // Save drivers
    if (driversData && driversData.length > 0) {
      for (const driver of driversData) {
        await driversCollection.updateOne(
          { id: driver.id },
          { $set: driver },
          { upsert: true }
        );
      }
    }
    
    console.log('Data saved to MongoDB successfully');
  } catch (error) {
    console.error('Error saving data to MongoDB:', error);
  }
}

// Initialize storage
let users = new Map();
let verificationTokens = new Map();
let vehicles = [];
let drivers = [];

// Initialize data from MongoDB
async function initializeData() {
  try {
    const data = await loadData();
    users = data.users;
    verificationTokens = data.verificationTokens;
    vehicles = data.vehicles;
    
    // Load drivers from MongoDB
    const driversCollection = getDriversCollection();
    if (driversCollection) {
      drivers = await driversCollection.find({}).toArray();
    } else {
      drivers = [];
    }
    
    // Add dummy cars if no vehicles exist
    if (vehicles.length === 0) {
      const dummyCars = [
        {
          id: 1,
          make: "BMW",
          model: "X5 M",
          year: "2024",
          licensePlate: "BMW2024",
          vin: "WBA5A7C50FD123456",
          bondAmount: 3000,
          rentPerWeek: 350,
          currentMileage: 5000,
          odoMeter: 5000,
          nextServiceDate: "2025-12-31",
          vehicleType: "suv",
          color: "Alpine White",
          fuelType: "petrol",
          transmission: "automatic",
          status: "available",
          ownerName: "SK Car Rental",
          photoUrls: [
            "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop"
          ],
          documents: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 2,
          make: "Audi",
          model: "RS Q8",
          year: "2024",
          licensePlate: "AUDI2024",
          vin: "WAUZZZ4K8BN123456",
          bondAmount: 4000,
          rentPerWeek: 450,
          currentMileage: 3000,
          odoMeter: 3000,
          nextServiceDate: "2025-12-31",
          vehicleType: "suv",
          color: "Daytona Gray",
          fuelType: "petrol",
          transmission: "automatic",
          status: "available",
          ownerName: "SK Car Rental",
          photoUrls: [
            "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop"
          ],
          documents: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      vehicles = dummyCars;
      
      // Save dummy cars to MongoDB
      const vehiclesCollection = getVehiclesCollection();
      if (vehiclesCollection) {
        for (const car of dummyCars) {
          await vehiclesCollection.updateOne(
            { id: car.id },
            { $set: car },
            { upsert: true }
          );
        }
        console.log('Dummy cars saved to MongoDB');
      }
    }
    
    console.log('Data initialized successfully');
} catch (error) {
    console.error('Error initializing data:', error);
    // Initialize with empty data as fallback
    users = new Map();
    verificationTokens = new Map();
    vehicles = [];
  drivers = [];
  }
}

// Ensure admin user exists
async function ensureAdminUser() {
  try {
    const adminEmail = 'admin@example.com';
    const adminPassword = 'admin123';
    
    // Check if admin user exists
    if (!users.has(adminEmail)) {
      console.log('Creating admin user...');
      
      // Create admin user
      users.set(adminEmail, { 
        email: adminEmail, 
        password: adminPassword, 
        verified: true, 
        role: 'admin' 
      });
      
      // Save to MongoDB
      const usersCollection = getUsersCollection();
      if (usersCollection) {
        await usersCollection.updateOne(
          { email: adminEmail },
          { $set: { email: adminEmail, password: adminPassword, verified: true, role: 'admin' } },
          { upsert: true }
        );
        console.log('Admin user saved to MongoDB');
      }
      
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error ensuring admin user:', error);
  }
}

// Initialize data and ensure admin user
async function initializeApp() {
  await initializeData();
  await ensureAdminUser();
}

initializeApp();

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
  
  const normalizedEmail = (email || '').trim().toLowerCase();
  const normalizedPassword = (password || '').trim();

  if (!normalizedEmail || !normalizedPassword) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  if (users.has(normalizedEmail)) {
    return res.status(400).json({ error: 'User already exists' });
  }
  
  // Store user as verified for now to enable smooth testing
  users.set(normalizedEmail, { email: normalizedEmail, password: normalizedPassword, verified: true, role });
  
  // Persist
  await saveData(users, verificationTokens, vehicles);
  
  res.json({ message: 'User registered successfully. You can now login.' });
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
  
  const normalizedEmail = (email || '').trim().toLowerCase();
  const normalizedPassword = (password || '').trim();

  if (!normalizedEmail || !normalizedPassword) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  const user = users.get(normalizedEmail);
  
  if (!user || user.password !== normalizedPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  if (!user.verified) {
    return res.status(401).json({ error: 'Please verify your email before logging in', needsVerification: true });
  }
  
  res.json({ message: 'Login successful', user: { email: user.email, verified: user.verified, role: user.role } });
});

// Temporary password reset endpoint (for development/testing)
app.post('/api/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and newPassword are required' });
    }

    const user = users.get(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.password = newPassword;
    users.set(email, user);
    await saveData(users, verificationTokens, vehicles);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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
  await saveData(users, verificationTokens, vehicles);
  
  res.json({ message: 'Admin user created successfully', user: { email, role: 'admin', verified: true } });
});

// Vehicle management endpoints
// Handle OPTIONS for vehicles endpoint
app.options('/api/vehicles', cors(corsOptions));

// Global CORS handler for all API routes
app.use('/api/*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://auth-app-xw7c.onrender.com');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Origin, Accept, Content-Length');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

app.post('/api/vehicles', (req, res, next) => {
  // Set CORS headers explicitly for all requests
  res.header('Access-Control-Allow-Origin', 'https://auth-app-xw7c.onrender.com');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Origin, Accept, Content-Length');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
}, (req, res, next) => {
  // Custom multer configuration for vehicle creation (memory storage for deployment)
  const vehicleUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: function (req, file, cb) {
      if (file.fieldname === 'vehiclePhoto') {
        // Allow only image files for vehicle photos
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
          return cb(null, true);
        } else {
          cb(new Error('Only JPG, PNG, WEBP image files are allowed for vehicle photos!'));
        }
      } else if (file.fieldname === 'documents') {
        // Allow PDF, DOC, DOCX, JPG, PNG for documents
        const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
          return cb(null, true);
        } else {
          cb(new Error('Only PDF, DOC, DOCX, JPG, PNG files are allowed for documents!'));
        }
      } else {
        cb(null, true);
      }
    }
  }).fields([
    { name: 'vehiclePhoto', maxCount: 1 },
    { name: 'documents', maxCount: 10 }
  ]);

  vehicleUpload(req, res, (err) => {
    if (err) {
      console.error('File upload error:', err);
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req, res) => {
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

    // Process uploaded documents
    const documents = [];
    if (req.files && req.files.documents) {
      req.files.documents.forEach((file, index) => {
        const documentType = req.body[`documentType_${index}`] || 'other';
        const expiryDate = req.body[`expiryDate_${index}`] || null;
        
        documents.push({
          id: Date.now() + index,
          documentType,
          fileName: file.originalname,
          fileUrl: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
          filePath: 'memory',
          fileSize: file.size,
          mimeType: file.mimetype,
          expiryDate,
          uploadedBy: 'admin',
          uploadedAt: new Date().toISOString(),
          status: 'active'
        });
      });
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
      photoUrl: req.files && req.files.vehiclePhoto ? `data:${req.files.vehiclePhoto[0].mimetype};base64,${req.files.vehiclePhoto[0].buffer.toString('base64')}` : null,
      photoPath: req.files && req.files.vehiclePhoto ? 'memory' : null,
      photoName: req.files && req.files.vehiclePhoto ? req.files.vehiclePhoto[0].originalname : null,
      photoSize: req.files && req.files.vehiclePhoto ? req.files.vehiclePhoto[0].size : null,
      documents,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save vehicle to MongoDB or local array
    const vehiclesCollection = getVehiclesCollection();
    if (vehiclesCollection) {
      try {
        await vehiclesCollection.insertOne(newVehicle);
      } catch (error) {
        console.error('Error saving vehicle to MongoDB:', error);
      }
    }
    
    // Update local array
    vehicles.push(newVehicle);
    
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

app.get('/api/vehicles', async (req, res) => {
  try {
    const vehiclesCollection = getVehiclesCollection();
    if (!vehiclesCollection) {
      // Fallback to in-memory storage
    res.json(vehicles);
      return;
    }
    const vehiclesFromDB = await vehiclesCollection.find({}).toArray();
    res.json(vehiclesFromDB);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    // Fallback to in-memory storage
    res.json(vehicles);
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

// Get rental applications endpoint
app.get('/api/rental-applications', async (req, res) => {
  try {
    // Return all drivers (rental applications) with vehicle details
    const applicationsWithVehicles = drivers.map(driver => {
      const vehicle = vehicles.find(v => v.id === driver.selectedVehicleId);
      return {
        ...driver,
        vehicle_details: vehicle || null
      };
    });
    
    res.json(applicationsWithVehicles);
  } catch (error) {
    console.error('Error fetching rental applications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update document expiry date endpoint
app.put('/api/vehicles/:vehicleId/documents/:docIndex/expiry', async (req, res) => {
  try {
    const vehicleId = parseInt(req.params.vehicleId);
    const docIndex = parseInt(req.params.docIndex);
    const { expiryDate } = req.body;
    
    const vehicleIndex = vehicles.findIndex(v => v.id === vehicleId);
    if (vehicleIndex === -1) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    if (!vehicles[vehicleIndex].documents || !vehicles[vehicleIndex].documents[docIndex]) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    vehicles[vehicleIndex].documents[docIndex].expiryDate = expiryDate;
    vehicles[vehicleIndex].updatedAt = new Date().toISOString();
    
    // Save data
    saveData(users, verificationTokens, vehicles, drivers);
    
    res.json({ 
      message: 'Document expiry date updated successfully',
      document: vehicles[vehicleIndex].documents[docIndex]
    });
    
  } catch (error) {
    console.error('Error updating document expiry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get document expiry alerts endpoint
app.get('/api/document-expiry-alerts', async (req, res) => {
  try {
    const alerts = [];
    
    // Check all vehicles for document expiry
    vehicles.forEach(vehicle => {
      if (vehicle.documents) {
        vehicle.documents.forEach((doc, index) => {
          if (doc.expiryDate) {
            const today = new Date();
            const expiryDate = new Date(doc.expiryDate);
            const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
            
            let alertLevel = 'normal';
            if (daysUntilExpiry < 0) {
              alertLevel = 'critical';
            } else if (daysUntilExpiry <= 30) {
              alertLevel = 'warning';
            } else if (daysUntilExpiry <= 90) {
              alertLevel = 'info';
            }
            
            alerts.push({
              vehicle_id: vehicle.id,
              vehicle_name: `${vehicle.make} ${vehicle.model}`,
              document_type: doc.documentType,
              document_index: index,
              expiry_date: doc.expiryDate,
              days_until_expiry: daysUntilExpiry,
              alert_level: alertLevel
            });
          }
        });
      }
    });
    
    // Check all rental applications for document expiry
    drivers.forEach(driver => {
      if (driver.documents) {
        // Find the vehicle details for this driver
        const vehicle = vehicles.find(v => v.id === driver.selectedVehicleId);
        const vehicleName = vehicle ? `${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle';
        
        driver.documents.forEach((doc, index) => {
          if (doc.expiryDate) {
            const today = new Date();
            const expiryDate = new Date(doc.expiryDate);
            const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
            
            let alertLevel = 'normal';
            if (daysUntilExpiry < 0) {
              alertLevel = 'critical';
            } else if (daysUntilExpiry <= 30) {
              alertLevel = 'warning';
            } else if (daysUntilExpiry <= 90) {
              alertLevel = 'info';
            }
            
            alerts.push({
              vehicle_id: driver.selectedVehicleId,
              vehicle_name: `${driver.firstName} ${driver.lastName} - ${vehicleName}`,
              document_type: doc.documentType,
              document_index: index,
              expiry_date: doc.expiryDate,
              days_until_expiry: daysUntilExpiry,
              alert_level: alertLevel
            });
          }
        });
      }
    });
    
    // Filter to show only alerts that need attention (critical, warning, info)
    const relevantAlerts = alerts.filter(alert => alert.alert_level !== 'normal');
    
    res.json(relevantAlerts);
  } catch (error) {
    console.error('Error fetching document expiry alerts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload documents for rental application endpoint
app.post('/api/rental-applications/:id/documents', upload.single('document'), async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);
    const { documentType, expiryDate } = req.body;
    
    const applicationIndex = drivers.findIndex(driver => driver.id === applicationId);
    if (applicationIndex === -1) {
      return res.status(404).json({ error: 'Rental application not found' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'Document file is required' });
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
      uploadedBy: 'admin',
      uploadedAt: new Date().toISOString(),
      status: 'active'
    };
    
    // Add document to application
    drivers[applicationIndex].documents.push(newDocument);
    drivers[applicationIndex].updatedAt = new Date().toISOString();
    
    // Save data
    saveData(users, verificationTokens, vehicles, drivers);
    
    console.log(`Document uploaded for rental application ${applicationId}: ${documentType}`);
    
    res.json({ 
      message: 'Document uploaded successfully',
      document: newDocument
    });
    
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve/Reject rental application endpoint
app.put('/api/rental-applications/:id', async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);
    const { action } = req.body; // 'approved' or 'rejected'
    
    const applicationIndex = drivers.findIndex(driver => driver.id === applicationId);
    if (applicationIndex === -1) {
      return res.status(404).json({ error: 'Rental application not found' });
    }
    
    const application = drivers[applicationIndex];
    const vehicle = vehicles.find(v => v.id === application.selectedVehicleId);
    
    if (action === 'approved') {
      // Update application status
      drivers[applicationIndex].status = 'active';
      drivers[applicationIndex].updatedAt = new Date().toISOString();
      
      // Update vehicle status to rented
      if (vehicle) {
        vehicle.status = 'rented';
        vehicle.updatedAt = new Date().toISOString();
      }
      
      console.log(`Rental application ${applicationId} approved for ${application.firstName} ${application.lastName}`);
      
    } else if (action === 'rejected') {
      // Update application status
      drivers[applicationIndex].status = 'rejected';
      drivers[applicationIndex].updatedAt = new Date().toISOString();
      
      // Update vehicle status back to available
      if (vehicle) {
        vehicle.status = 'available';
        vehicle.updatedAt = new Date().toISOString();
      }
      
      console.log(`Rental application ${applicationId} rejected for ${application.firstName} ${application.lastName}`);
    }
    
    // Save data
    saveData(users, verificationTokens, vehicles, drivers);
    
    res.json({ 
      message: `Rental application ${action} successfully`,
      application: drivers[applicationIndex]
    });
    
  } catch (error) {
    console.error('Error processing rental application:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test rental application endpoint (for testing without file uploads)
app.post('/api/test-rentals', async (req, res) => {
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
      weeklyRent,
      paymentAmount
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

    // Create new driver entry for testing
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
      contractEndDate: null,
      contractPeriod,
      bondAmount: parseInt(bondAmount),
      weeklyRent: parseInt(weeklyRent),
      contractSigned: true,
      paymentReceiptUploaded: true,
      paymentReceiptUrl: '/uploads/payments/test-receipt.png',
      paymentAmount: parseFloat(paymentAmount) || 0,
      carPhotosUploaded: true,
      carPhotosUrls: ['/uploads/car-photos/test-car.jpg'],
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

    // Don't update vehicle status yet - wait for admin approval
    // Vehicle status will be updated when admin approves/rejects the application

    // Save data
    saveData(users, verificationTokens, vehicles, drivers);

    console.log('Test rental application submitted:', {
      id: newDriver.id,
      vehicle: `${vehicle.make} ${vehicle.model}`,
      customer: `${firstName} ${lastName}`,
      contractPeriod,
      bondAmount,
      weeklyRent
    });

    res.status(201).json({
      message: 'Test rental application submitted successfully',
      rentalId: newDriver.id
    });

  } catch (error) {
    console.error('Error submitting test rental application:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Rental application endpoint
app.post('/api/rentals', uploadRentalApplication.fields([
  { name: 'paymentReceipt', maxCount: 1 },
  { name: 'carPhotos', maxCount: 10 },
  { name: 'licenseCard', maxCount: 1 }
]), (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `File upload error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
}, async (req, res) => {
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
      weeklyRent,
      paymentAmount
    } = req.body;

    // Validate required fields
    if (!vehicleId || !contractPeriod || !firstName || !lastName || !email || !phone || 
        !licenseExpiry || !address || !emergencyContact || !emergencyPhone) {
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

    // Check if car photos were uploaded
    if (!req.files || !req.files.carPhotos || req.files.carPhotos.length === 0) {
      return res.status(400).json({ error: 'Car photos are required' });
    }

    // Check if license card was uploaded
    if (!req.files || !req.files.licenseCard || req.files.licenseCard.length === 0) {
      return res.status(400).json({ error: 'License card is required' });
    }

    // Check if payment receipt was uploaded
    if (!req.files || !req.files.paymentReceipt || req.files.paymentReceipt.length === 0) {
      return res.status(400).json({ error: 'Payment receipt is required' });
    }

    // Create new driver entry
    const newDriver = {
      id: Date.now(),
      firstName,
      lastName,
      email,
      phone,
      // licenseNumber is replaced by licenseCard upload
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
      paymentReceiptUrl: `/uploads/payments/${req.files.paymentReceipt[0].filename}`,
      licenseCardUrl: `data:${req.files.licenseCard[0].mimetype};base64,${req.files.licenseCard[0].buffer.toString('base64')}`,
      paymentAmount: parseFloat(paymentAmount) || 0,
      carPhotosUploaded: true,
      carPhotosUrls: req.files.carPhotos.map(file => `/uploads/car-photos/${file.filename}`),
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

    // Don't update vehicle status yet - wait for admin approval
    // Vehicle status will be updated when admin approves/rejects the application

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

// Payment tracking endpoints
app.get('/api/payments', (req, res) => {
  try {
    // Extract payment data from rental applications
    const payments = [];
    
    drivers.forEach(driver => {
      if (driver.paymentReceiptUploaded && driver.paymentReceiptUrl) {
        // Create single payment record for total amount (bond + rent)
        const totalAmount = (driver.bondAmount || 0) + (driver.weeklyRent || 0);
        const actualPaidAmount = driver.paymentAmount || totalAmount;
        
        payments.push({
          id: driver.id,
          customerName: `${driver.firstName} ${driver.lastName}`,
          customerEmail: driver.email,
          customerPhone: driver.phone,
          customerLicenseNumber: driver.licenseNumber,
          customerAddress: driver.address,
          emergencyContact: driver.emergencyContact,
          emergencyPhone: driver.emergencyPhone,
          contractPeriod: driver.contractPeriod,
          vehicleId: driver.selectedVehicleId,
          vehicleMake: vehicles.find(v => v.id === driver.selectedVehicleId)?.make || 'Unknown',
          vehicleModel: vehicles.find(v => v.id === driver.selectedVehicleId)?.model || 'Unknown',
          vehicleLicensePlate: vehicles.find(v => v.id === driver.selectedVehicleId)?.licensePlate || 'Unknown',
          paymentType: 'rental_payment',
          amount: actualPaidAmount,
          bondAmount: driver.bondAmount || 0,
          weeklyRent: driver.weeklyRent || 0,
          paymentDate: driver.createdAt,
          receiptUrl: driver.paymentReceiptUrl,
          status: driver.status,
          createdAt: driver.createdAt,
          updatedAt: driver.updatedAt
        });
      }
    });

    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/payments', (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      vehicleId,
      paymentType,
      amount,
      paymentDate,
      receiptUrl
    } = req.body;

    const vehicle = vehicles.find(v => v.id === parseInt(vehicleId));
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const newPayment = {
      id: Date.now(),
      customerName,
      customerEmail,
      vehicleId: parseInt(vehicleId),
      vehicleMake: vehicle.make,
      vehicleModel: vehicle.model,
      vehicleLicensePlate: vehicle.licensePlate,
      paymentType,
      amount: parseFloat(amount),
      paymentDate: paymentDate || new Date().toISOString(),
      receiptUrl,
      status: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add to payments array (you might want to create a separate payments.json file)
    // For now, we'll store it in memory and it will be lost on server restart
    // In a real application, you'd want to persist this to a database or file

    res.status(201).json({
      message: 'Payment recorded successfully',
      payment: newPayment
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Seed multiple vehicles for testing
app.post('/api/seed-vehicles', async (req, res) => {
  try {
    const now = Date.now();
    const samples = [
      {
        id: now + 1,
        make: 'Toyota', model: 'Corolla', year: '2022', licensePlate: 'TOY22', vin: 'JTDBR32E220123456',
        bondAmount: 1000, rentPerWeek: 180, currentMileage: 25000, odoMeter: 25000, nextServiceDate: '2026-01-10',
        vehicleType: 'sedan', color: 'White', fuelType: 'petrol', transmission: 'automatic', status: 'available', ownerName: 'SK Car Rental',
        photoUrls: ['https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&h=600&fit=crop'], documents: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      },
      {
        id: now + 2,
        make: 'Hyundai', model: 'i30', year: '2023', licensePlate: 'HY23I30', vin: 'KMHDH41EXPU123456',
        bondAmount: 1200, rentPerWeek: 190, currentMileage: 12000, odoMeter: 12000, nextServiceDate: '2026-03-01',
        vehicleType: 'hatchback', color: 'Blue', fuelType: 'petrol', transmission: 'automatic', status: 'available', ownerName: 'SK Car Rental',
        photoUrls: ['https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=800&h=600&fit=crop'], documents: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      },
      {
        id: now + 3,
        make: 'Tesla', model: 'Model 3', year: '2024', licensePlate: 'TESL3', vin: '5YJ3E1EA7KF123456',
        bondAmount: 2000, rentPerWeek: 320, currentMileage: 8000, odoMeter: 8000, nextServiceDate: '2026-06-01',
        vehicleType: 'sedan', color: 'Red', fuelType: 'electric', transmission: 'automatic', status: 'available', ownerName: 'SK Car Rental',
        photoUrls: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop'], documents: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      },
      {
        id: now + 4,
        make: 'Kia', model: 'Sportage', year: '2021', licensePlate: 'KIA21SP', vin: 'KNDPB3AC0M7123456',
        bondAmount: 1100, rentPerWeek: 210, currentMileage: 30000, odoMeter: 30000, nextServiceDate: '2026-04-01',
        vehicleType: 'suv', color: 'Gray', fuelType: 'petrol', transmission: 'automatic', status: 'available', ownerName: 'SK Car Rental',
        photoUrls: ['https://images.unsplash.com/photo-1593424486241-2465e5b3cf21?w=800&h=600&fit=crop'], documents: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      },
      {
        id: now + 5,
        make: 'Mazda', model: 'CX-5', year: '2022', licensePlate: 'MZD22CX5', vin: 'JM3KFADL1N0123456',
        bondAmount: 1300, rentPerWeek: 230, currentMileage: 18000, odoMeter: 18000, nextServiceDate: '2026-02-15',
        vehicleType: 'suv', color: 'Black', fuelType: 'petrol', transmission: 'automatic', status: 'available', ownerName: 'SK Car Rental',
        photoUrls: ['https://images.unsplash.com/photo-1627454824996-9a674d5bfb76?w=800&h=600&fit=crop'], documents: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      },
      {
        id: now + 6,
        make: 'Ford', model: 'Ranger', year: '2023', licensePlate: 'FORD23RG', vin: 'MPBUMFF80PX123456',
        bondAmount: 1500, rentPerWeek: 280, currentMileage: 9000, odoMeter: 9000, nextServiceDate: '2026-07-20',
        vehicleType: 'ute', color: 'Orange', fuelType: 'diesel', transmission: 'automatic', status: 'available', ownerName: 'SK Car Rental',
        photoUrls: ['https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=800&h=600&fit=crop'], documents: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      },
      {
        id: now + 7,
        make: 'BMW', model: '3 Series', year: '2020', licensePlate: 'BMW20S3', vin: 'WBA8E9G55GNU12345',
        bondAmount: 1800, rentPerWeek: 300, currentMileage: 42000, odoMeter: 42000, nextServiceDate: '2026-09-01',
        vehicleType: 'sedan', color: 'Silver', fuelType: 'petrol', transmission: 'automatic', status: 'available', ownerName: 'SK Car Rental',
        photoUrls: ['https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800&h=600&fit=crop'], documents: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      }
    ];

    const existingPlates = new Set(vehicles.map(v => v.licensePlate));
    const existingVins = new Set(vehicles.map(v => v.vin));

    const toInsert = samples.filter(v => !existingPlates.has(v.licensePlate) && !existingVins.has(v.vin));

    if (toInsert.length === 0) {
      return res.json({ message: 'No new vehicles to seed', added: 0, total: vehicles.length });
    }

    const vehiclesCollection = getVehiclesCollection();
    if (vehiclesCollection) {
      for (const car of toInsert) {
        await vehiclesCollection.updateOne({ id: car.id }, { $set: car }, { upsert: true });
      }
    }

    vehicles.push(...toInsert);
    res.json({ message: 'Vehicles seeded', added: toInsert.length, total: vehicles.length });
  } catch (e) {
    console.error('Seeding error:', e);
    res.status(500).json({ error: 'Failed to seed vehicles' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const adminExists = users.has('admin@example.com');
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    adminUserExists: adminExists,
    totalUsers: users.size,
    totalVehicles: vehicles.length,
    mongodbConnected: db !== null
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Serve React app for all other GET routes - ensure production build index is returned
app.get('*', (req, res) => {
  const distIndex = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(distIndex)) {
    res.sendFile(distIndex);
    return;
  }
  // Fallback (dev or missing build)
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`Backend: http://localhost:${PORT}`);
});
