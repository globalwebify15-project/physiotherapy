import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../atlas-cred.env') });
dotenv.config({ path: path.resolve(__dirname, '../../atlas-cred.env') });
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('CRITICAL CONFIG ERROR: MONGODB_URI env variable is not set. The platform is configured to connect ONLY to MongoDB Atlas. Please configure the MONGODB_URI variable in your .env files.');
}

const connectionString = MONGODB_URI;

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    await mongoose.connect(connectionString);
    console.log('MongoDB successfully connected.');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    return;
  }
  await mongoose.disconnect();
  console.log('MongoDB disconnected.');
};
