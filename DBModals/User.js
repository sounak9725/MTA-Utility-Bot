const mongoose = require('mongoose');
const { Schema, model } = mongoose;

// Define a schema for users
const userSchema = new Schema({
    userId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    discriminator: { type: String, required: true },
    ip: { type: String, required: true }
    // Add more fields as needed
});

// Create a model from the schema
const User = model('User', userSchema);
module.exports = User;