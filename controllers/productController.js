import Product from '../models/Product.js';

// Get all products
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching products', error: error.message });
    }
};

// Get single product by ID
export const getSingleProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching product', error: error.message });
    }
};

// Create a new product
export const createProduct = async (req, res) => {
    try {
        const { name, description, price, stock } = req.body;

        // Check if all fields are provided
        if (!name || !description || price === undefined || stock === undefined) {
            return res.status(400).json({ message: 'Please provide all fields (name, description, price, stock)' });
        }

        const product = await Product.create({ name, description, price, stock });

        res.status(201).json({
            message: 'Product created successfully',
            product: {
                _id: product._id,
                name: product.name,
                description: product.description,
                price: product.price,
                stock: product.stock
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error creating product', error: error.message });
    }
};

// Update product by ID
export const updateProduct = async (req, res) => {
    try {
        const { name, description, price, stock } = req.body;

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Update fields if they are provided in the request body
        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price !== undefined ? price : product.price;
        product.stock = stock !== undefined ? stock : product.stock;

        const updatedProduct = await product.save();

        res.status(200).json({
            message: 'Product updated successfully',
            product: {
                _id: updatedProduct._id,
                name: updatedProduct.name,
                description: updatedProduct.description,
                price: updatedProduct.price,
                stock: updatedProduct.stock
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error updating product', error: error.message });
    }
};

// Delete product by ID
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await Product.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error deleting product', error: error.message });
    }
};
