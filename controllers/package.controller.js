const { isValidObjectId, default: mongoose } = require("mongoose");
const { PackageModel, PackageInvestment } = require("../models/package.model");
const { UserModel } = require("../models/user.model");
const { generateCustomId } = require("../utils/generator.uniqueid");
const { uploadToImageKit } = require("../utils/upload.imagekit");
const { RebirthIdModel } = require("../models/rebirthId.model");
const { CommissionModel } = require("../models/commission.model");
const { BoosterModel } = require("../models/booster.model");
const { BoostingIdModel } = require("../models/boostingId.model");

exports.PackageCreate = async (req, res) => {
    const { title, amount, tags, picture, referralPercentage, rebirthIdArray, turnoverArray, distributionArray, status } = req.body;
    if (!amount || !title) return res.status(500).json({ success: false, message: "All fields required." })
    const packageFind = await PackageModel.findOne({ amount });
    if (packageFind) return res.status(500).json({ success: false, message: "Allready Package Created." });
    try {
        const id = generateCustomId({ prefix: "TVF-PKG" });
        const pictureUrl = await uploadToImageKit(picture, 'packages')
        const newPackage = new PackageModel({ id, title, amount, tags, picture: pictureUrl, referralPercentage, rebirthIdArray, turnoverArray, distributionArray, status });
        await newPackage.save();
        res.status(201).json({ success: true, message: 'Package created successfully', data: newPackage });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.PackageUpdate = async (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(500).json({ success: false, message: "Package ID is required." })
    const { title, amount, picture, tags, referralPercentage, status, rebirthIdArray, turnoverArray, distributionArray } = req.body;
    try {
        const package = await PackageModel.findById(id);
        if (!package) return res.status(404).json({ success: false, message: 'Package not found' });
        if (package.picture != picture) package.picture = await uploadToImageKit(picture, 'Packages');
        if (title) package.title = title;
        if (amount) package.amount = amount;
        if (tags) package.tags = tags.split(',');
        if (referralPercentage) package.referralPercentage = referralPercentage;
        if (status) package.status = status;
        if (rebirthIdArray) package.rebirthIdArray = rebirthIdArray;
        if (distributionArray) package.distributionArray = distributionArray;
        if (turnoverArray) package.turnoverArray = turnoverArray;
        await package.save();
        res.status(200).json({ success: true, message: 'Package updated successfully', data: package });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.PackageDelete = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedPackage = await PackageModel.findByIdAndUpdate(id, {});
        if (!deletedPackage) return res.status(404).json({ success: false, message: 'Package not found' });
        res.status(200).json({ success: true, message: 'Package deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.PackageStatusUpdate = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedPackage = await PackageModel.findById(id);
        if (!updatedPackage) return res.status(404).json({ success: false, message: 'Package not found' });
        updatedPackage.status = !updatedPackage.status;
        await updatedPackage.save();
        const message = updatedPackage.status ? 'Package activated successfully' : 'Package inactivated successfully';
        res.status(200).json({ success: true, data: updatedPackage, message });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.PackagesAdminReports = async (req, res) => {
    try {
        const packages = await PackageModel.find();
        res.status(200).json({ success: true, message: "Package Admin Finds Successfully.", data: packages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// exports.getUserPackages = async (req, res) => {
//     try {
//         const userId = req?.user?._id ?? req?.params?.id;
//         if(!isValidObjectId(userId)) return res.status(500).json({success:false,message:"Invalid User ID."});
//         const allPackages = await PackageModel.find({ status: true }, { slots: 0 }).sort({ amount: 1 });
//         let purchasedCount = 0;
//         allPackages.forEach(pkg => {
//             if (pkg.users.map(u => u.toString()).includes(userId.toString())) {
//                 purchasedCount++;
//             }
//         });
//         const packageList = allPackages.map((pkg, index) => {
//             const isPurchased = pkg.users.map(u => u.toString()).includes(userId.toString());
//             let status = "locked";
//             if (isPurchased) {
//                 status = "purchased"; // agar user ne le liya hai
//             } else if (index === purchasedCount || index === 0) {
//                 status = "unlocked"; // next package unlock OR first package unlock
//             }

//             return {
//                 _id: pkg._id,
//                 id: pkg.id,
//                 amount: pkg.amount,
//                 title: pkg.title,
//                 percentage: pkg.referralPercentage,
//                 tags: pkg.tags,
//                 status
//             };
//         });

//         res.status(200).json({
//             success: true,
//             message: "Packages fetched successfully.",
//             data: packageList
//         });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };



exports.getUserPackages = async (req, res) => {
    try {
        const userId = req?.user?._id ?? req?.params?.id;
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(500).json({ success: false, message: "Invalid User ID." });
        }

        // User fetch karo
        const user = await UserModel.findById(userId).populate({ path: 'income', select: "currentIncome withdrawal" });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        // Direct referrals count
        const directCount = await UserModel.countDocuments({ sponsor: userId, 'active.isActive': true });

        // All active packages
        const allPackages = await PackageModel.find({ status: true }, { slots: 0 }).sort({ amount: 1 });
        let purchasedCount = 0;
        allPackages.forEach(pkg => {
            if (pkg.users.map(u => u.toString()).includes(userId.toString())) {
                purchasedCount++;
            }
        });

        // Income group by package
        const incomeData = await RebirthIdModel.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId) } },
            { $group: { _id: "$package", totalIncome: { $sum: "$income" } } }
        ]);

        const levelDirectData = await CommissionModel.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId), type: { $in: ['Direct', 'Level'] } } },
            { $group: { _id: "$package", totalIncome: { $sum: "$income" } } }
        ]);
        
        const incomeMap = {};
        incomeData.forEach(item => {
            incomeMap[item._id.toString()] = item.totalIncome;
        });
        const levelDirectMap = {};
        levelDirectData.forEach(item => {
            levelDirectMap[item._id.toString()] = item.totalIncome;
        });
        let eligibleTotal = 0;
        let nonEligibleTotal = 0;
        const packageList = allPackages.map((pkg, index) => {
            const isPurchased = pkg.users.map(u => u.toString()).includes(userId.toString());
            const requiredDirects = 2 * (index + 1);
            const eligibleForIncome = directCount >= requiredDirects;
            let status = "locked";
            if (isPurchased) {
                status = "purchased";
            } else if (index === purchasedCount || index === 0) {
                status = "unlocked";
            }
            const nonWorkdingIncome = incomeMap[pkg._id.toString()] || 0
            const totalDirectLevelIncome = levelDirectMap[pkg._id.toString()] || 0
            const totalIncome = nonWorkdingIncome + totalDirectLevelIncome
            
            if (eligibleForIncome) {
                eligibleTotal += nonWorkdingIncome + totalDirectLevelIncome;
            } else {
                nonEligibleTotal += nonWorkdingIncome + totalDirectLevelIncome;
            }
            return {
                _id: pkg._id,
                id: pkg.id,
                amount: pkg.amount,
                title: pkg.title,
                percentage: pkg.referralPercentage,
                tags: pkg.tags,
                status,
                userName: user.name, // user ka naam
                userDirects: directCount,
                eligibleForIncome, // true/false
                requiredDirects,   // condition ka number
                nonWorkdingIncome: eligibleTotal ?? 0, // us package se total income
                totalDirectLevelIncome: totalDirectLevelIncome ?? 0, // us package se total income
                totalIncome: totalIncome, // us package se total income
            };
        });

        const remainingBalance = eligibleTotal - (user?.income?.withdrawal ?? 0);
        const summary = {
            currentIncome: 0 < remainingBalance ? remainingBalance : 0,
            eligibleTotal,
            nonEligibleTotal,
            totalWithdrawal: user?.income?.withdrawal,
        }
        // console.log(packageList)
        res.status(200).json({
            success: true,
            message: "Packages fetched successfully.",
            data: packageList,
            summary
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message });
    }
};


exports.getUserWithdrawalCheck = async (req, res) => {
    try {
        const userId = req?.user?._id ?? req?.params?.id;
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(500).json({ success: false, message: "Invalid User ID." });
        }
        const user = await UserModel.findById(userId).populate({ path: 'income', select: "currentIncome withdrawal" });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        const directCount = await UserModel.countDocuments({ sponsor: userId, 'active.isActive': true });
        const allPackages = await PackageModel.find({ status: true }, { slots: 0 }).sort({ amount: 1 });
        let purchasedCount = 0;
        allPackages.forEach(pkg => {
            if (pkg.users.map(u => u.toString()).includes(userId.toString())) {
                purchasedCount++;
            }
        });
        const incomeData = await RebirthIdModel.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId) } },
            { $group: { _id: "$package", totalIncome: { $sum: "$income" } } }
        ]);
        const levelDirectData = await CommissionModel.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId), type: { $in: ['Direct', 'Level'] } } },
            { $group: { _id: "$package", totalIncome: { $sum: "$income" } } }
        ]);

        const incomeMap = {};
        incomeData.forEach(item => {
            incomeMap[item._id.toString()] = item.totalIncome;
        });
        const levelDirectMap = {};
        levelDirectData.forEach(item => {
            levelDirectMap[item._id.toString()] = item.totalIncome;
        });

        let eligibleTotal = 0;
        let nonEligibleTotal = 0;
        allPackages.map((pkg, index) => {
            const requiredDirects = 2 * (index + 1);
            const eligibleForIncome = directCount >= requiredDirects;
            const nonWorkdingIncome = incomeMap[pkg._id.toString()] || 0
            const totalDirectLevelIncome = levelDirectMap[pkg._id.toString()] || 0
            // const totalDirectLevelIncome = levelDirectMap[pkg._id.toString()] || 0
            // const totalIncome = nonWorkdingIncome + totalDirectLevelIncome
            const totalIncome = nonWorkdingIncome
            if (eligibleForIncome) {
                eligibleTotal += nonWorkdingIncome + totalDirectLevelIncome;
            } else {
                nonEligibleTotal += nonWorkdingIncome + totalDirectLevelIncome;
            }
            // eligibleTotal += totalDirectLevelIncome;
            console.log({totalDirectLevelIncome})
        });
        const remainingBalance = eligibleTotal - (user?.income?.withdrawal ?? 0);
        res.status(200).json({
            success: true,
            message: "Withdrawal Packages eligible balance fetched successfully.",
            data: {
                currentIncome: 0 < remainingBalance ? remainingBalance : eligibleTotal, eligibleTotal, nonEligibleTotal, totalWithdrawal: user?.income?.withdrawal,
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};



exports.getUserWithdrawalBoostingCheck = async (req, res) => {
    try {
        const userId = req?.user?._id ?? req?.params?.id;
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(500).json({ success: false, message: "Invalid User ID." });
        }

        const user = await UserModel.findById(userId)
            .populate({ path: 'income', select: "currentIncome withdrawal" });

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        // ✅ Total income from Boosting IDs (active only)
        const boostingIncome = await BoostingIdModel.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId), active: true } },
            { $group: { _id: null, totalIncome: { $sum: "$income" } } }
        ]);

        const eligibleTotal = boostingIncome.length > 0 ? boostingIncome[0].totalIncome : 0;

        // ✅ Remaining balance after withdrawals
        const remainingBalance = eligibleTotal - (user?.income?.withdrawal ?? 0);

        // ✅ Manual ID required if >= $15
        const manualIdRequired = eligibleTotal >= 15;

        res.status(200).json({
            success: true,
            message: "Withdrawal eligible balance fetched successfully.",
            data: {
                currentIncome: remainingBalance > 0 ? remainingBalance : 0,
                eligibleTotal,
                totalWithdrawal: user?.income?.withdrawal ?? 0,
                manualIdRequired
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};





exports.getAdminActivationPackages = async (req, res) => {
    try {
        const { userId } = req?.params;
        if (!userId) return res.status(500).json({ success: false, message: "ID is required." });
        const user = await UserModel.findOne({ id: userId }, { username: 1, email: 1, referralLink: 1 });
        if (!user) return res.status(500).json({ success: false, message: "Invalid User ID." });
        const allPackages = await PackageModel.find({ status: true }, { slots: 0 }).sort({ amount: 1 });
        let purchasedCount = 0;
        allPackages.forEach(pkg => {
            if (pkg.users.map(u => u.toString()).includes(user._id.toString())) {
                purchasedCount++;
            }
        });
        const packageList = allPackages.map((pkg, index) => {
            const isPurchased = pkg.users.map(u => u.toString()).includes(user._id.toString());
            let status = "locked";
            if (isPurchased) {
                status = "purchased"; // agar user ne le liya hai
            } else if (index === purchasedCount || index === 0) {
                status = "unlocked"; // next package unlock OR first package unlock
            }

            return {
                _id: pkg._id,
                id: pkg.id,
                amount: pkg.amount,
                title: pkg.title,
                percentage: pkg.referralPercentage,
                tags: pkg.tags,
                status
            };
        });

        res.status(200).json({
            success: true,
            message: "Packages fetched successfully.",
            data: { packageList, user }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPackage = async (req, res) => {
    try {
        const package = await PackageModel.findById(req.params.id);
        res.status(200).json({ success: true, message: "Package Find Successfully.", data: package });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.PackagesClientReports = async (req, res) => {
    try {
        const packages = await PackageModel.find({ status: true });
        res.status(200).json({ success: true, message: 'Package Client Finds Successfully.', data: packages });
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message });
    }
}

// exports.PackagesClientReports = async (req, res) => {
//     try {
//         const packages = await PackageModel.find({ status: true });
//         const user = await UserModel.findById(req.user._id);
//         const packageInvestments = await PackageInvestment.find({ user: user._id });

//         const newPackages = await Promise.all(
//             packages.map(async (p) => {
//                 const isActive = p.users.includes(user._id);
//                 const relatedInvestment = packageInvestments.find(inv => inv.package.toString() === p._id.toString());

//                 return {
//                     ...p._doc,
//                     users:null,
//                     upgrade: relatedInvestment?.upgrade || false,
//                     active: relatedInvestment?.active,
//                     isPurchase: isActive,
//                     expireDate:relatedInvestment?.packageExpire || null,
//                     joiningDate:relatedInvestment?.createdAt || null,
//                 };
//             })
//         );

//         res.status(200).json({
//             success: true,
//             message: 'Package client report generated successfully.',
//             data: newPackages
//         });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ success: false, message: error.message });
//     }
// };
