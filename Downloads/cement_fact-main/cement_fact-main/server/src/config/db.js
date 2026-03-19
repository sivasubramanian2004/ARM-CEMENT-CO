const mongoose = require('mongoose');

async function connectDB(uri) {
  if (!uri) {
    throw new Error('Missing MongoDB connection string');
  }

  mongoose.set('strictQuery', true);

  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000 // 10s timeout for initial server selection
  };

  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await mongoose.connect(uri, options);
      console.log('MongoDB connected');
      return;
    } catch (err) {
      console.error(`MongoDB connect attempt ${attempt} failed:`, err.message || err);
      if (attempt < maxAttempts) {
        // wait before retrying
        await new Promise((res) => setTimeout(res, 3000));
      } else {
        // rethrow after final attempt
        throw err;
      }
    }
  }
}

module.exports = { connectDB };
