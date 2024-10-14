const mongoose = require('mongoose');

const userVerificationSchema = new mongoose.Schema({
    discord_user_id: { type: String, required: true, unique: true },
    discord_username: { type: String, required: true },
    roblox_user_id: { type: String, required: true },
    roblox_username: { type: String, required: true },
    verification_code: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
});

const UserVerification = mongoose.model('UserVerification', userVerificationSchema);

module.exports = UserVerification;
