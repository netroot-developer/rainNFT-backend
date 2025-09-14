const { AdminModel } = require('../models/admin.model');
const { ControllerModel } = require('../models/controller.model');
const { SrPassword, hash, compare } = require("../utils/password.encrypt");

const srPassword = new SrPassword()

exports.AdminRegisterAuto = async () => {
    try {
        const { ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD} = process.env
        const admin = await AdminModel.findOne({ email: ADMIN_EMAIL });
        if (admin) return console.log('Allready register Admin.');
        const password = await srPassword.hash(ADMIN_PASSWORD)
        if (!password) return console.log('Hash Password field Invalid.');
        const newAdmin = new AdminModel({email:ADMIN_EMAIL,password,username:ADMIN_USERNAME,role:'ADMIN' });
        await newAdmin.save();
        console.log("Admin register successfully.!");
    } catch (error) {
        console.error(error);
    }
}
exports.ControllerCreateAuto = async () => {
    try {
        const admin = await ControllerModel.findOne({});
        if (admin) return console.log('Already create controller.');
        const newAdmin = new ControllerModel({});
        await newAdmin.save();
        console.log("Auto create controller successfully.!");
    } catch (error) {
        console.error(error);
    }
}