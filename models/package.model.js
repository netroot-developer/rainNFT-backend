const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema({
    id: {type: String,default: null},
    picture: { type: String, default: null},
    title: { type: String,required: [true, "Package name is required."]},
    amount: { type: Number, default: 0 },
    referralPercentage: { type: Number, default: 0 },
    tradingPercentage: { type: Number, default: 0 },
    tags: { type: Array, default: [] },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
    slots: {
        level1: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RebirthId', default: [] }],
        completedUser: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RebirthId', default: [] }],
    },
    rebirthIdArray: {
        type: Array,
        default: [1]
    },
    teams: {
        type: Array,
        default: [2]
    },
    turnoverArray: {
        type: Array,
        default: [0.4]
    },
    distributionArray: {
        type: Array,
        default: [0.2]
    },
    status: {
        type: Boolean,
        default: true
    }
}, { timestamps: true, versionKey: false });

// // // Exclude the password field by default when converting documents to JSON or objects
packageSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.slots;
        delete ret.users;
        delete ret.teams;
        return ret;
    }
});
packageSchema.set('toObject', {
    transform: (doc, ret) => {
        // delete ret.users;
        return ret;
    }
});

exports.PackageModel = mongoose.model('Package', packageSchema);


const packageInvestmentSchema = new mongoose.Schema({
    packageName: {
        type: String,
        default: null
    },
    investment: {
        type: Number,
        default: 0
    },
    income: {
        type: Number,
        default: 0
    },
    package: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Package",
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
        default: null
    },
    tx: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
        default: null
    },
    active: {
        type: Boolean,
        default: true
    },
    upgrade: {
        type: Boolean,
        default: false
    },
    purchaseBy: {
        type: String,
        default: "USER",
        enum: ['ADMIN', 'USER','REBIRTH']
    },
    type: {
        type: String,
        default: "WALLET PURCHASE",
        enum: ['WALLET PURCHASE','AUTO PURCHASE']
    },
    status: {
        type: String,
        default: "Package Investment"
    }
}, { timestamps: true, versionKey: false });

exports.PackageInvestment = mongoose.model("PackageInvestment", packageInvestmentSchema);