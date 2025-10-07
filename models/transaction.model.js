const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    id: {
        type: String,
        default: null
    },
    investment: {
        type: Number,
        default: 0
    },
    picture: {
        type: String,
    },
    percentage: {
        type: Number,
        default: 0
    },
    finalAmount: {
        type: Number,
    },
    remainInvestment:{
        type:Number
    },
    admincharges: {
        type: Number,
    },
    sponsorCharges: {
        type: Number,
    },
    clientAddress: {
        type: String,
        default: null
    },
    mainAddress: {
        type: String,
        default: null
    },
    toAddress: {
        type: String,
        default: null
    },
    hash: {
        type: String,
        default: null
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    rebirth: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RebirthId",
    },
    packageInvest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PackageInvestment",
    },
    package: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Package",
    },
    approvedDate:{
        type:Date,
        default:null
    },
    boostingInvest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PackageInvestment",
    },
    type: {
        type: String,
        enum: ['Deposit', 'Withdrawal', 'Transfer', 'Reward','Auto-Rebirth','Auto-Boosting'],
        default: null
    },
    chain: {
        type: String,
        enum: ['BSCSCAN',null],
        default: 'BSCSCAN'
    },
    reason:{
        type:String,
        default:null
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Completed','Confirmed', 'Cancelled'],
        default: 'Processing'
    }
}, { timestamps: true, versionKey: false });

exports.TransactionModel = mongoose.model('Transaction', transactionSchema);