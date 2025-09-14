const { BoosterModel } = require("../models/booster.model");
const { UserModel } = require("../models/user.model");

// Create Booster
exports.createBooster = async (req, res) => {
    try {
        const { title, amount, usersLength, users } = req.body;
        if (!title || !amount) return res.status(400).json({success:false, message: "Title and Amount are required." });
        const newBooster = new BoosterModel({
            title, amount, usersLength: usersLength || 2,
            users: users || [] // default status
        });
        const savedBooster = await newBooster.save();
        res.status(201).json({success:true,data:savedBooster});
    } catch (error) {
        console.log(error);
        res.status(500).json({success:false, message: error.message });
    }
};

// Update Booster
exports.updateBooster = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, amount, usersLength, users } = req.body;
        const updatedBooster = await BoosterModel.findByIdAndUpdate( id,{ title, amount, usersLength, users },{ new: true });
        if (!updatedBooster) return res.status(404).json({success:false, message: "Booster not found." });
        res.status(200).json({success:true,data:updatedBooster});
    } catch (error) {
        res.status(500).json({success:false, message: error.message });
    }
};
// Delete Booster
exports.deleteBooster = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedBooster = await BoosterModel.findByIdAndDelete(id);
        if (!deletedBooster) return res.status(404).json({success:false, message: "Booster not found." });
        res.status(200).json({success:true, message: "Booster deleted successfully." });
    } catch (error) {
        res.status(500).json({success:false, message: error.message });
    }
};

// Change Status
exports.changeBoosterStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const booster = await BoosterModel.findById(id);
        if (!booster) return res.status(404).json({success:false, message: "Booster not found." });
        booster.status = booster.status === "active" ? "inactive" : "active";
        await booster.save();
        res.status(200).json({success:true, message: `Status changed to ${booster.status}`, booster });
    } catch (error) {
        res.status(500).json({success:false, message: error.message });
    }
};

// Get Booster by ID
exports.getBoosterById = async (req, res) => {
    try {
        const { id } = req.params;
        const booster = await BoosterModel.findById(id);
        if (!booster) return res.status(404).json({success:false, message: "Booster not found." });
        res.status(200).json({success:true,data:booster,message:"Get by id boosters"});
    } catch (error) {
        res.status(500).json({success:false, message: error.message });
    }
};

// Get All Boosters
exports.getAllBoosters = async (req, res) => {
    try {
        const boosters = await BoosterModel.find().sort({ createdAt: -1 });
        res.status(200).json({success:true,data:boosters,message:"Get Active boosters"});
    } catch (error) {
        res.status(500).json({success:false, message: error.message });
    }
};

// Get All Boosters
exports.getActiveBoosters = async (req, res) => {
    try {
        const boosters = await BoosterModel.find({status:true}).sort({ createdAt: -1 });
        res.status(200).json({success:true,data:boosters,message:"Get Active boosters"});
    } catch (error) {
        res.status(500).json({success:false, message: error.message });
    }
};

exports.getAdminActivationBoosting = async (req, res) => {
    try {
        const {userId} = req?.params;
        if(!userId) return res.status(500).json({success:false,message:"ID is required."});
        const user = await UserModel.findOne({id:userId},{username:1,email:1,referralLink:1});
        if(!user) return res.status(500).json({success:false,message:"Invalid User ID."});
        const boostingList = await BoosterModel.find({ status: true }, {users:0, slotExits: 0,boosters:0 });
        res.status(200).json({
            success: true,
            message: "Packages fetched successfully.",
            data: {boostingList,user}
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
