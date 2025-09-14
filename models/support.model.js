const mongoose = require("mongoose");

const supportSchema = new mongoose.Schema({
    id:{
        type:String,
        trim:true,
        default:null
    },
    subject: {
        type: String,
        trim:true,
        required: [true, "Subject is required."]
    },
    message: {
        type: String,
        trim:true,
        required: [true, "Message is required."]
    },
    natureOfComplain: {
        type: String,
        default:null,
        trim:true
    },
    status: {
        type: String,
        enum: ["Pending", "Accepted", "Rejected"],
        default: "Pending"
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Client ID is required."]
    },
    response: {
        type: String,
        default: null
    },
    responseDate: {
        type: Date,
        default: null
    }
}, { timestamps: true, versionKey: false });

exports.SupportModel = mongoose.model('Support', supportSchema);
