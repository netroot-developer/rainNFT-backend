const mongoose = require("mongoose")
const RebirthIDSchema = new mongoose.Schema({
    id: { type: String, default: null },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    package: { type: mongoose.Schema.Types.ObjectId, ref: "Package" },
    investment: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
    income: { type: Number, default: 0 },
    type:{type:String,enum:['USER','Rebirth','Auto-Rebirth','Auto-Purchase']},
    active: { type: Boolean, default: true },
    history: [{ type: mongoose.Schema.Types.ObjectId, ref: "Commission" }],
},{timestamps:true,versionKey:false});

exports.RebirthIdModel = mongoose.model("RebirthId",RebirthIDSchema);