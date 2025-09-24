const mongoose = require("mongoose");
const controllerSchema = new mongoose.Schema({
    roi: {
        min: {
            type: Number,
            default: 0.5,
            min: [0, "{PATH} must be greater than or equal to 0"]
        },
        max: {
            type: Number,
            default: 0.5,
            min: [0, "{PATH} must be greater than or equal to 0"]
        },
    },
    levels: {
        type: [Number],
        default: [8, 4, 3, 2, 1.5, 1]
    },
    maxIncome: {
        type: Number,
        default: 5,
        min: [0, "{PATH} must be greater than or equal to 0"]
    },
    adminChargePercentage: {
        type: Number,
        default: 5,
        min: [0, "{PATH} must be greater than or equal to 0"]
    },
    directPercentage: {
        type: Number,
        default: 0,
        min: [0, "{PATH} must be greater than or equal to 0"]
    },
    walletDetails:{
        address:{
            type:String,
            default:null
        },
        key:{
            type:String,
            default:null
        }
    }
}, { timestamps: true, versionKey: false })

exports.ControllerModel = mongoose.model("Controller", controllerSchema);