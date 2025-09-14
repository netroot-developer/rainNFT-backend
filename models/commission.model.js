const mongoose = require("mongoose");
const IncomeSchema = new mongoose.Schema({
    id: { type: String, default: null },
    type: { type: String, enum: ["Direct", "Level","Non-Working",'Reward','Trading'], required: true },
    income: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    level: { type: Number, default: 0 },
    usersLength: { type: Number, default: 0 },
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "RebirthId" }],
    reward: { type: mongoose.Schema.Types.ObjectId, ref: "Royalty" },
    package: { type: mongoose.Schema.Types.ObjectId, ref: "Package" },
    rebirth: { type: mongoose.Schema.Types.ObjectId, ref: "RebirthId" },
    status: { type: String, enum: ["pending", "earned"], default: "earned" },
    fromLevel: { type: String },
    toLevel: { type: String },
}, { timestamps: true, versionKey: false });

exports.CommissionModel = mongoose.model('Commission', IncomeSchema)