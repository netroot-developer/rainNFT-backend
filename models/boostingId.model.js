const mongoose = require("mongoose")
const BoostingIDSchema = new mongoose.Schema({
    id: { type: String, default: null },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    boosting: { type: mongoose.Schema.Types.ObjectId, ref: "Booster" },
    boosterInvest: { type: mongoose.Schema.Types.ObjectId, ref: "BoosterInvestment" },
    investment: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
    income: { type: Number, default: 0 },
    totalIncome: { type: Number,default: 0 },
    type: { type: String, enum: ['USER', 'Boosting', 'Auto-Boosting', 'Auto-Purchase'] },
    active: { type: Boolean, default: false },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "BoostingId",
        default: []
    }],
    status:{
        type:Boolean,
        default:false
    },
    history: [{ type: mongoose.Schema.Types.ObjectId, ref: "Commission" }],
}, { timestamps: true, versionKey: false });

exports.BoostingIdModel = mongoose.model("BoostingId", BoostingIDSchema);