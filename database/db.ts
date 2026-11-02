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

// Serverless-ready global connection cache to prevent connection pool churn
declare global {
  // eslint-disable-next-line no-var
  var mongooseConnection: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

let cached = global.mongooseConnection;

if (!cached) {
  cached = global.mongooseConnection = { conn: null, promise: null };
}

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose;
  }

  if (cached && cached.conn) {
    return cached.conn;
  }

  if (!cached!.promise) {
    cached!.promise = mongoose.connect(connectionString, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    }).then((m) => {
      console.log('MongoDB successfully connected.');
      return m;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (error) {
    cached!.promise = null;
    console.error('MongoDB connection error:', error);
    throw error;
  }

  return cached!.conn;
};

export const disconnectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    return;
  }
  await mongoose.disconnect();
  if (cached) {
    cached.conn = null;
    cached.promise = null;
  }
  console.log('MongoDB disconnected.');
};
