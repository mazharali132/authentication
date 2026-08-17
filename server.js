import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Import Controllers directly
import { registerUser, loginUser } from './controllers/authController.js';
import { getAllUsers, getSingleUser, updateUser, deleteUser } from './controllers/userController.js';
import { getAllProducts, getSingleProduct, createProduct, updateProduct, deleteProduct } from './controllers/productController.js';

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

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

// Basic homepage route
app.get('/', (req, res) => {
    res.send('Authentication CRUD Backend is running!');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
