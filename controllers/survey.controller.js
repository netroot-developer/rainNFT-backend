const { SurveyModel } = require("../models/survey.model");
const { generateCustomId } = require("../utils/generator.uniqueid");

//------------------------- SURVEY QUESTIONS START -------------------------------
exports.createSurvey = async (req, res) => {
    try {
        const { questions } = req.body;
        if (!questions) return res.status(400).json({ success: false, message: "Question is required." });
        questions.forEach(async (survey) => {
            const id = generateCustomId({max:15})
            const newSurvey = new SurveyModel({id, question: survey });
            await newSurvey.save();
        })
        return res.status(201).json({
            success: true,
            message: "Survey created successfully.",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}

exports.updateSurvey = async (req, res) => {
    try {
        const { id } = req.params;
        const { question, answer, status } = req.body;
        const updatedSurvey = await SurveyModel.findByIdAndUpdate(id, { question, answer, status }, { new: true });
        if (!updatedSurvey) {
            return res.status(404).json({ success: false, message: 'Survey not found' });
        }
        return res.status(200).json({
            success: true,
            message: "Survey updated successfully.",
            data: updatedSurvey,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}

exports.deleteSurvey = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedSurvey = await SurveyModel.findByIdAndDelete(id);
        if (!deletedSurvey) {
            return res.status(404).json({ success: false, message: 'Survey not found' });
        }
        return res.status(200).json({
            success: true,
            message: "Survey deleted successfully.",
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}

exports.toggleSurveyStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const survey = await SurveyModel.findById(id);
        if (!survey) {
            return res.status(404).json({ success: false, message: 'Survey not found' });
        }
        survey.status = !survey.status; // Toggle status
        await survey.save();
        return res.status(200).json({
            success: true,
            message: "Survey status updated successfully.",
            data: survey,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}
exports.SurveyAdminHistory = async (req, res) => {
    try {
        const surveys = await SurveyModel.find();
        return res.status(200).json({
            success: true,
            message: "Survey history retrieved.",
            data: surveys,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}

exports.getSurveyQuestionsHistory = async (req, res) => {
    try {
        const surveys = await SurveyModel.find({ status: true});
        return res.status(200).json({
            success: true,
            message: "Survey questions retrieved successfully.",
            dataLength: surveys.length,
            data: surveys,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}