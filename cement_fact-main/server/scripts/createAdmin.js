require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connectDB } = require('../src/config/db');
const User = require('../src/models/User');

async function seedAdmin() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, MONGODB_URI } = process.env;
  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('Please set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD in your .env file.');
    process.exit(1);
  }

  await connectDB(MONGODB_URI);

  const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (existing) {
    console.log('Admin already exists. Skipping.');
    process.exit(0);
  }

  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL.toLowerCase(),
    password: hashed,
    role: 'admin'
  });

  console.log('Admin user created.');
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('Failed to create admin:', err.message);
  process.exit(1);
});
