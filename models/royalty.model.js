const mongoose = require("mongoose");

const royaltySchema = new mongoose.Schema({
    title:{
        type:String,
        default:null
    },
    directUsers:{
        type:Number,
        default:0
    },
    teamUsers:{
        type:Number,
        default:0
    },
    selfPackage:{
        type:Number,
        default:0
    },
    teamPackage:{
        type:Number,
        default:0
    },
    income:{
        type:Number,
        default:0
    },
    users:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:[]
    }],
    status:{
        type:Boolean,
        default:true
    }
},{timestamps:true,versionKey:false});

exports.RoyaltyModel = mongoose.model("RoyaltyModel",royaltySchema);


const royaltyInvestmentSchema = new mongoose.Schema({
    id:{
        type:String,
        default:null
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:null
    },
    package:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Package",
        default:null
    },
    amount:{
        type:Number,
        default:0
    },
    investment:{
        type:Number,
        default:0
    },
    percentage:{
        type:Number,
        default:0
    },
    status:{
        type:String,
        default:"Royalty"
    }
},{timestamps:true,versionKey:false});


exports.RoyaltyInvestment = mongoose.model("RoyaltyInvestment",royaltyInvestmentSchema);