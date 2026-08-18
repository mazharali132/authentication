import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Import Controllers directly
import { registerUser, loginUser } from './controllers/authController.js';
import { getAllUsers, getSingleUser, updateUser, deleteUser } from './controllers/userController.js';
import { getAllProducts, getSingleProduct, createProduct, updateProduct, deleteProduct } from './controllers/productController.js';

import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Custom Manual CORS Middleware to guarantee headers on all request types
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Instantly return 200 for preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'frontend')));


// --- ROUTES (No Express Router) ---

// Auth Routes
app.post('/api/auth/register', registerUser);
app.post('/api/auth/login', loginUser);

// User CRUD Routes
app.get('/api/users', getAllUsers);
app.get('/api/users/:id', getSingleUser);
app.put('/api/users/:id', updateUser);
app.delete('/api/users/:id', deleteUser);

// Product CRUD Routes
app.post('/api/products', createProduct);
app.get('/api/products', getAllProducts);
app.get('/api/products/:id', getSingleProduct);
app.put('/api/products/:id', updateProduct);
app.delete('/api/products/:id', deleteProduct);

// Basic homepage route serving the frontend dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
