const mongoose = require('mongoose');

const levelIncomeSchema = new mongoose.Schema({
    id:{
        type:String,
        default:null
    },
    amount:{
        type: Number,
        default:0
    },
    income:{
        type: Number,
        default:0
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default:null
    },
    fromUser:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default:null
    },
    miningId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MiningModel',
        default:null
    },
    percentage:{
        type: Number,
        default:0
    },
    level:{
        type:Number,
        default:0
    },
    status:{
        type:String,
        default:null,
        enum:['SHARE REWARD','AFFILIATE INCOME']
    },
    
},{timestamps:true,versionKey:false})

exports.LevelIncome = mongoose.model('LevelIncome', levelIncomeSchema);