const { RoyaltyModel } = require("../models/royalty.model");

// 🔹 Create Royalty
exports.createRoyalty = async (req, res) => {
    try {
        console.log(req.body)
        const { title, directUsers, teamUsers, selfPackage, teamPackage,income, status } = req.body;
        if (!title || !directUsers || !teamUsers || !selfPackage || !teamPackage) return res.status(500).json({ success: false, message: "All fields are required." })
        const royaltyFind = await RoyaltyModel.findOne({ title });
        if (royaltyFind) return res.status(500).json({ success: false, message: "Already this royalty Created." });
        const royalty = new RoyaltyModel({ title, directUsers, teamUsers, selfPackage, teamPackage,income, status });
        await royalty.save();
        return res.status(201).json({ success: true, message: "Royalty created successfully", data: royalty });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 🔹 Update Royalty
exports.updateRoyalty = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, directUsers, teamUsers, selfPackage, teamPackage,income, status } = req.body;
        if (!title || !directUsers || !teamUsers || !selfPackage || !teamPackage || !income) return res.status(500).json({ success: false, message: "All fields are required." })
        const royalty = await RoyaltyModel.findByIdAndUpdate(id, { title, directUsers, teamUsers, selfPackage, teamPackage,income, status }, { new: true });
        if (!royalty) return res.status(404).json({ success: false, message: "Royalty not found" });
        return res.status(200).json({ success: true, message: "Royalty updated successfully", data: royalty });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 🔹 Toggle Status (active/inactive)
exports.toggleRoyaltyStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const royalty = await RoyaltyModel.findById(id);
        if (!royalty) return res.status(404).json({ success: false, message: "Royalty not found" });
        royalty.status = !royalty.status;
        await royalty.save();
        return res.status(200).json({ success: true, message: "Status updated successfully", data: royalty });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 🔹 Get All Royalty
exports.getAllRoyalties = async (req, res) => {
    try {
        const royalties = await RoyaltyModel.find();
        return res.status(200).json({ success: true, data: royalties });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 🔹 Get All Royalty
exports.getAllActiveRoyalties = async (req, res) => {
    try {
        const royalties = await RoyaltyModel.find({ status: true });
        return res.status(200).json({ success: true, data: royalties });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 🔹 Delete Royalty
exports.deleteRoyalty = async (req, res) => {
    try {
        const { id } = req.params;
        const royalty = await RoyaltyModel.findByIdAndDelete(id);
        if (!royalty) return res.status(404).json({ success: false, message: "Royalty not found" });
        return res.status(200).json({ success: true, message: "Royalty deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 🔹 Get By ID
exports.getRoyaltyById = async (req, res) => {
    try {
        const { id } = req.params;
        const royalty = await RoyaltyModel.findById(id);
        if (!royalty) return res.status(404).json({ success: false, message: "Royalty not found" });
        return res.status(200).json({ success: true, data: royalty });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};