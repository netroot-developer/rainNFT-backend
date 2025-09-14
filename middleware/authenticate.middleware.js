const { AdminModel } = require("../models/admin.model");
const { UserModel } = require("../models/user.model");
const { verifyToken } = require("../utils/token.generator");
const { checkRoleMiddleware } = require("./checkrole.middleware");

exports.isAdminLoggedIn = async (req, res, next) => {
    const token = req?.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: "No token, authorization denied" });
    try {
        const decoded = await verifyToken(token);
        req.admin = decoded;
        const admin = await AdminModel.findById(req.admin._id);
        if (!admin) return res.status(401).json({ success: false, message: "Admin details not found." });
        const response = await checkRoleMiddleware(req.admin, ['SUPER-ADMIN', 'ADMIN', 'MANAGER'])
        if (response) return res.status(401).json({ success: false, message: "Access Denied!" })
        next();
    } catch (err) {
        res.status(401).json({ success: false, message: err.message });
    }
};

/**
 * This function checks if the user's role is among the allowed roles.
 * 
 * @param {*} allowedRoles  -  ['SUPER-ADMIN', 'ADMIN','MANAGER','STAFF','RECEPTIONIST','ACCOUNTANT','DOCTOR','NURSE','LAB-TECHNICIAN','PHARMACIST','PATIENT','NURSE-ASSISTANT','LAB-ASSISTANT','PHARMACY-ASSISTANT','RECEPTIONIST-ASSISTANT','CLEANING-STAFF','SECURITY-STAFF','OTHER'] An array of roles that are allowed to access a certain resource.
 * @returns {boolean} - Returns true if the user's role is in the allowedRoles array, otherwise returns false.
 */

exports.isLoggedIn = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies['sgt.sid'];
    if (!token) return res.status(401).json({ success: false, message: "No token, authorization denied" });
    try {
        const decoded = await verifyToken(token);
        req.user = decoded;
        const user = await UserModel.findById(req.user._id);
        if (!user) return res.status(401).json({ success: false, message: "User not round." });
        if (user.active.isBlocked) return res.status(401).json({ success: false, message: "User is blocked. Please contact the admin." });
        const response = checkRoleMiddleware(user, ['USER','CLIENT','user','client'])
        if (response) return res.status(401).json({ success: false, message: "Access Denied!" })
        next();
    } catch (err) {
        res.status(401).json({ success: false, message: "Invalid token" });
    }
};
