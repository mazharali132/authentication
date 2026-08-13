import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

// Force Google DNS to bypass router DNS that blocks MongoDB SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
    try {
        console.log('Connecting to MongoDB...');
        console.log('MONGO_URI loaded:', !!process.env.MONGO_URI);

        await mongoose.connect(process.env.MONGO_URI);

        console.log('MongoDB Connected successfully!');
    } catch (error) {
        console.error('MongoDB Connection Error');
        console.error('Code:', error.code);
        console.error('Message:', error.message);
        process.exit(1);
    }
};

export default connectDB;
