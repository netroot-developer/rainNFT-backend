const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    id: { type: String, default: null },
    picture: { type: String, default: null, trim: true },
    username: { type: String, default: null, trim: true },
    email: { type: String, default: null, trim: true,lowercase: true },
    mobile: { type: String, default: null, trim: true },
    password: { type: String, default: null, trim: true },
    account: { type: String, default: null, trim: true },
    referralLink: { type: String, default: null, trim: true },
    sponsor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    partners: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: []
    }],
    investment: {
        type: Number,
        default: 0
    },
    investmentWithCommission: {
        type: Number,
        default: 0
    },
    royaltyInvestment: {
        type: Number,
        default: 0
    },
    boosterInvestment: {
        type: Number,
        default: 0
    },
    package: {
        investment: { type: Number, default: 0 },
        packages: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Package',
            default: []
        }],
        history: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PackageInvestment',
            default: []
        }]
    },
    otpDetails: {
        otp: { type: String, default: null },
        otpExpiry: { type: Date, default: null },
    },
    active: {
        isVerified: {
            type: Boolean,
            default: false
        },
        isActive: {
            type: Boolean,
            default: false
        },
        isFA: {
            type: String,
            default: null
        },
        isBlocked: {
            type: Boolean,
            default: false
        },
        activeDate: {
            type: Date,
            default: null
        }
    },
    income: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "IncomeDetails",
        default: null
    },
    boosterInfo: {
        cycle: { type: Number, default: 0 },
        usedForNext: { type: Number, default: 0 },
        required: { type: Number, default: 0 },
        eligible: { type: Boolean, default: true }
    },
    lastCalculation: {
        level: {
            type: Date,
            default: null
        },
        team: {
            type: Date,
            default: null
        },
    },
    token: {
        token: { type: String, default: null, trim: true },
        tokenBlock: { type: Array, default: [] },
    },
    levelCount:{
        type:Number,
        default:0
    },
    role: {
        type: String,
        default: 'USER',
        enum: ['USER', 'ADMIN', 'SUPER-ADMIN', 'MASTER', 'STAFF']
    },
}, { timestamps: true, versionKey: false })


userSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.password;
        delete ret.token;
        delete ret.otpDetails;
        return ret;
    }
});

userSchema.set('toObject', {
    transform: (doc, ret) => {
        delete ret.password;
        delete ret.token;
        delete ret.otpDetails;
        return ret;
    }
});

exports.UserModel = mongoose.model('User', userSchema);