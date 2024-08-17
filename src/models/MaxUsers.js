const mongoose = require('mongoose');

const maxUsersSchema = new mongoose.Schema({
    domain: { type: String, required: true, unique: true },
    maxUsers: { type: Number, required: true },
    timestamp: { type: Date, required: true }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('MaxUsers', maxUsersSchema);
