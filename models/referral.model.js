const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
    id:{
        type:String,
        default:null
    },
    investment:{
        type:Number,
        default:0
    },
    income:{
        type:Number,
        default:0
    },
    percentage:{
        type:Number,
        default:0
    },
    package:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Package",
        default:null
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:null
    },
    fromUser:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:null
    },
    status:{
        type:String,
        default:"Referral Income"
    }
},{timestamps:true,versionKey:false});

exports.ReferralModel = mongoose.model("ReferralIncome",referralSchema)