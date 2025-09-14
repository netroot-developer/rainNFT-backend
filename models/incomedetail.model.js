const mongoose = require("mongoose");

const incomeDetailSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    totalIncome: {
        type: Number,
        default: 0
    },
    currentIncome: {
        type: Number,
        default: 0
    },
    withdrawal: {
        type: Number,
        default: 0
    },
    directIncome: {
        type: Number,
        default: 0
    },
    levelIncome: {
        type: Number,
        default: 0
    },
    nonWorkingIncome: {
        type: Number,
        default: 0
    },
    rewardIncome: {
        type: Number,
        default: 0
    },
    tradingIncome: {
        type: Number,
        default: 0
    },
}, { timestamps: true, versionKey: false });

exports.IncomeDetailModel = mongoose.model("IncomeDetails", incomeDetailSchema)