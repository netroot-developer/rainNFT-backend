const mongoose = require("mongoose");
const surveySchema = new mongoose.Schema({
    id:{
        type:String,
        default:null
    },
    question: {
        type: String,
        required: [true, "Question is required."]
    },
    clients: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: []
    }],
    status: {
        type: Boolean,
        default: true
    }
}, { timestamps: true, versionKey: false });

exports.SurveyModel = mongoose.model('Survey', surveySchema);