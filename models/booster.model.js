const mongoose = require('mongoose');

const boosterSchema = new mongoose.Schema({
    title:{
        type:String,
        default:null
    },
    amount:{
        type:Number,
        default:0
    },
    usersLength:{
        type:Number,
        default:2
    },
    users:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:[]
    }],
    boosters:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"BoostingId",
        default:[]
    }],
    slotExits:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"BoostingId",
        default:[]
    }],
    status:{
        type:Boolean,
        default:true
    }
},{timestamps:true,versionKey:false});
exports.BoosterModel = mongoose.model("Booster",boosterSchema);

// ------------------ 
const boosterInvestSchema = new mongoose.Schema({
    id:{
        type:String,
        default:null
    },amount:{
        type:Number,
        default:0
    },
    booster:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Booster",
        default:null
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:null
    },
    boosterIds:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"BoostingId",
    },
    hash:{
        type:String,
        default:null
    },
    nextMember:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    }],
    status:{
        type:Boolean,
        default:false
    },
    type:{
        type:String,
        default:"USER",
        enum:['AUTO PURCHASE','USER']
    },
},{timestamps:true,versionKey:false});
exports.BoosterInvestModel = mongoose.model("BoosterInvestment",boosterInvestSchema);