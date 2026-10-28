import mongoose from 'mongoose';

let cachedConnection = null;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  if (cachedConnection) {
    try {
      await cachedConnection;
      return true;
    } catch (e) {
      cachedConnection = null;
    }
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.warn('⚠️ MONGODB_URI not provided in environment variables.');
    return false;
  }

  try {
    cachedConnection = mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // 5s timeout instead of hanging 30s
    });
    const conn = await cachedConnection;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    cachedConnection = null;
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    return false;
  }
};

export const getDBStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  const stateCode = mongoose.connection.readyState;
  return {
    stateCode,
    status: states[stateCode] || 'unknown',
    isConnected: stateCode === 1,
    databaseName: mongoose.connection.name || null,
  };
};
