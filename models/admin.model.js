const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    id:{ type:String, default:null},
    picture:{ type:String, default:null},
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String,default:null },
    password: { type: String, required: true },
    token: { type: String, default: null },
    tokenBlock: { type: Array, default: [] },
    otp: { type: String, default: null },
    expireOtp: { type: Date, default: null },
    role:{type:String,default:'SUPER-ADMIN',enum:['ADMIN','SUPER-ADMIN','MANAGER','STAFF']},
}, { timestamps: true, versionKey: false });

// // // Exclude the password field by default when converting documents to JSON or objects
adminSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.token;
        delete ret.otp;
        delete ret.expireOtp;
        delete ret.tokenBlock;
        delete ret.password;
        return ret;
    }
});

exports.AdminModel = mongoose.model('Admin', adminSchema);
