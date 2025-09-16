const { ControllerModel } = require("../models/controller.model");

// ---------------- CREATE ----------------
exports.createController = async (req, res) => {
  try {
    const { min = 0.5, max = 5, levels = [8, 4, 3, 2, 1.5, 1], maxIncome = 5, adminChargePercentage = 5, directPercentage = 0,address=null,key=null } = req.body;
    const controller = new ControllerModel({ roi: { min, max }, levels, maxIncome, adminChargePercentage, directPercentage,walletDetails:{address,key} });
    await controller.save();
    return res.status(201).json({ success: true, message: "Controller created successfully ✅", data: controller });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- GET ALL ----------------
exports.getAllControllers = async (req, res) => {
  try {
    const controllers = await ControllerModel.find({},{"walletDetails.key":1});
    return res.status(200).json({ success: true, data: controllers });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- GET BY ID ----------------
exports.getControllerById = async (req, res) => {
  try {
    const controller = await ControllerModel.findById(req.params.id);
    if (!controller) return res.status(404).json({ success: false, message: "Controller not found ❌" });
    return res.status(200).json({ success: true, data: controller });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
exports.getControllerFindOne = async (req, res) => {
  try {
    const controller = await ControllerModel.findOne({});
    if (!controller) return res.status(404).json({ success: false, message: "Controller not found ❌" });
    return res.status(200).json({ success: true, data: controller });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- UPDATE ----------------
exports.updateController = async (req, res) => {
  try {
    const { min = 0.5, max = 5, levels = [8, 4, 3, 2, 1.5, 1], maxIncome = 5, adminChargePercentage = 5, directPercentage = 0,address=null,key=null } = req.body;
    const controller = await ControllerModel.findOne({});
    if (!controller) return res.status(404).json({ success: false, message: "Controller not found ❌" });
    if (min) controller.roi.min = min;
    if (max) controller.roi.max = max;
    if (levels) controller.levels = levels;
    if (maxIncome) controller.maxIncome = maxIncome;
    if (address) controller.walletDetails.address = address;
    if (key) controller.walletDetails.key = key;
    if (adminChargePercentage) controller.adminChargePercentage = adminChargePercentage;
    if (directPercentage) controller.directPercentage = directPercentage;
    await controller.save();
    return res.status(200).json({ success: true, message: "Controller updated successfully ✅", data: controller });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- DELETE ----------------
exports.deleteController = async (req, res) => {
  try {
    const controller = await ControllerModel.findByIdAndDelete(req.params.id);
    if (!controller)
      return res.status(404).json({ success: false, message: "Controller not found ❌" });

    return res.status(200).json({
      success: true,
      message: "Controller deleted successfully 🗑️",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
