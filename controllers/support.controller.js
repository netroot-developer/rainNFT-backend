const { SupportModel } = require("../models/support.model");
const { UserModel } = require("../models/user.model");
const { generateCustomId } = require("../utils/generator.uniqueid");

exports.SupportTicketRaise = async (req, res) => {
    const { message, subject,natureOfComplain } = req.body;
    try {
        if (!message || !subject) return res.status(400).json({ success: false, message: 'Query and message are required' });
        const id = generateCustomId({prefix:"CTI",max:15,min:15})
        const newSupport = new SupportModel({id, message: message, subject,natureOfComplain, user: req.user._id });
        await newSupport.save();
        res.status(201).json({ success: true, message: 'Support request created successfully', data: newSupport });
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
}
exports.SupportClientReports = async (req, res) => {
    try {
        const supports = await SupportModel.find({user:req.user._id}).populate({path:'user',select:"id username email mobile account"});
        return res.status(200).json({ success: true,message:"Supports Admin Finds.", data:supports });
    } catch (error) {
        console.error("Error fetching support messages:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}
exports.SupportAdminReports = async (req, res) => {
    try {
        const supports = await SupportModel.find({}).populate({path:'user',select:'username account email mobile id'});
        return res.status(200).json({ success: true,message:"Supports Client Finds.", data:supports });
    } catch (error) {
        console.error("Error fetching support messages:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

exports.SupportTicketResponse = async (req, res) => {
    try {
        const {id} = req.params
        const { status, response } = req.body;
        if (!id || !status) return res.status(400).json({ success: false, message: 'Support request ID and status are required' });
        if (status !== 'accept' && status !== 'reject') return res.status(400).json({ success: false, message: 'Invalid Action' });
        const supportRequest = await SupportModel.findById(id);
        if (!supportRequest) return res.status(404).json({ success: false, message: 'Support request not found' });
        supportRequest.response = response;
        if(status == 'accept'){
            supportRequest.status = 'Accepted';
        }else if(status == 'reject'){
            supportRequest.status = 'Rejected';
        }
        supportRequest.responseDate = Date.now();
        await supportRequest.save();
        res.status(200).json({ success: true, message: `Support request ${status.toLowerCase()}ed successfully`, data: supportRequest });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
}