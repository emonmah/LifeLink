require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");

async function seedAdmin() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);

    const exists = await Admin.findOne({ email: "admin@lifelink.com" });
    if (exists) {
      console.log("Admin already exists");
      process.exit(0);
    }

    console.log("Creating admin...");

    const admin = await Admin.create({
      name: "System Admin",
      email: "admin@lifelink.com",
      phone: "01949771731",
      password: "Admin@1234",
      role: "admin"
    });

    console.log("Admin created successfully:", admin);
    process.exit(0);
  } catch (err) {
    console.error("Error seeding admin:", err.message);
    process.exit(1);
  }
}