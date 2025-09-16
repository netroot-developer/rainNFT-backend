const { PackageModel, PackageInvestment } = require("../models/package.model");
const { TransactionModel } = require("../models/transaction.model");
const { UserModel } = require("../models/user.model");
const { generateCustomId } = require("../utils/generator.uniqueid");
const { BoosterModel, BoosterInvestModel } = require("../models/booster.model");
const { createBoostingIds } = require("../utils/boostingpull/boosting.insertId");
const { uploadToImageKit } = require("../utils/upload.imagekit");
const { IncomeDetailModel } = require("../models/incomedetail.model");
const { calculateLevelMultiArrayDownline } = require("../utils/getteams.downline");
const { directIncomeCalculate } = require("../utils/calculateDirect.icome");
const { CommissionModel } = require("../models/commission.model");
const { default: mongoose } = require("mongoose");


// 1. FUND PURCHASE
exports.packagePurchaseRequest = async (req, res) => {
    try {
        const { amount, hash } = req.body;
        const query = mongoose.Types.ObjectId.isValid(req?.user?._id)? { _id: req?.user?._id }: { id: req?.body?.userId };
        const user = await UserModel.findOne(query, {id:1, active: 1, account: 1, investment: 1, role: 1, levelCount: 1,sponsor:1 });
        const amountNumber = Number(amount);
        if (!user) return res.status(500).json({ success: false, message: "User not found." });
        const idTx = generateCustomId({ prefix: 'RNFT', max: 10, min: 10 });
        const hashID = hash ?? generateCustomId({ prefix: '#', max: 14, min: 14 });
        const newInvest = new TransactionModel({ id: idTx, clientAddress: user.account, mainAddress: process.env.WALLET_ADDRESS, hash: hashID, investment: amount, user: user._id, status: 'Completed', type: "Deposit", purchaseBy: (req?.user?.role ?? 'ADMIN') });
        const incomeDetails = await IncomeDetailModel.findOne({ user: user._id }, { currentIncome: 1, totalIncome: 1 });
        if (!incomeDetails) return res.status(500).json({ success: false, message: "Income not found." });
        user.investment += amountNumber;
        incomeDetails.totalIncome += amountNumber;
        incomeDetails.currentIncome += amountNumber;
        const { teamA, teamB, teamC } = await calculateLevelMultiArrayDownline(user._id);
        const otherTeam = teamB.length + teamC.length;
        const TeamALength = teamA.length;
        const investment = incomeDetails.currentIncome;
        if (investment >= 30000 && TeamALength >= 35 && otherTeam >= 180) {
            user.levelCount = 6;
        } else if (investment > 10000 && TeamALength >= 25 && otherTeam >= 70) {
            user.levelCount = 5;
        } else if (investment > 5000 && TeamALength >= 15 && otherTeam >= 35) {
            user.levelCount = 4;
        } else if (investment > 2000 && TeamALength >= 6 && otherTeam >= 20) {
            user.levelCount = 3;
        } else if (investment >= 500 && TeamALength >= 3 && otherTeam >= 5) {
            user.levelCount = 2;
        } else if (investment >= 50) {
            user.levelCount = 1;
        }
        if (!user.active.isActive) {
            user.active.isActive = true;
            user.active.activeDate = new Date();
        }
        await user.save();
        await incomeDetails.save();
        await newInvest.save();
        if(user.sponsor){
            const checkIn = await CommissionModel.countDocuments({user:user.sponsor,fromUser:user._id,type:"Direct"});
            if(checkIn < 1){
                await directIncomeCalculate({amount:amountNumber,directPercentage:10,type:"Direct",userId:user._id})
            }else{
                console.log(`Already Direct income ${user.sponsor} ${user.id}`)
            }
        }
        return res.status(201).json({ success: true, message: "Fund Add successfully.", data: hash });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 1. FUND PURCHASE
exports.packagePurchaseApproved = async (req, res) => {
    try {
        const { status, id, reason } = req.body;
        if (!id) return res.status(500).json({ success: false, message: "ID is required." });
        const newInvest = await TransactionModel.findById(id);
        if (['Completed', 'Cancelled'].includes(newInvest.status)) return res.json({ success: false, message: "Already project approved." });
        if (status == "Completed") {
            const user = await UserModel.findById(newInvest.user, { active: 1, investment: 1 });
            if (!user.active.isActive) {
                user.active.isActive = true;
                user.active.activeDate = new Date();
            }
            user.investment += newInvest.investment;
            user.investment += newInvest.investment;
            newInvest.approvedDate = new Date();
            await user.save();
        };
        newInvest.reason = reason;
        newInvest.status = status;
        newInvest.approvedDate = new Date();
        await newInvest.save();
        return res.status(201).json({ success: true, message: "Fund approved successfully.", data: newInvest });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// booster investment 
exports.boosterInvestment = async (req, res) => {
    try {
        const { boosterId, hash } = req.body;
        if (!boosterId) return res.status(400).json({ success: false, message: "Booster ID is required." });

        // ✅ Find user
        const userId = req?.user?._id || req?.body?.userId;
        const user = await UserModel.findOne({ '$or': [{ _id: userId }] });
        if (!user) return res.status(404).json({ success: false, message: "User not found." });

        const boosterFind = await BoosterModel.findById(boosterId);
        if (!boosterFind) return res.status(404).json({ success: false, message: "Booster not found." });

        // ✅ Check today's booster count (limit = 10 per day)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const todayBoosters = await BoosterInvestModel.countDocuments({
            user: user._id,
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });
        if (todayBoosters >= 10) return res.status(400).json({ success: false, message: "You cannot purchase more than 10 boosters in a single day." });

        const [generateUserId] = await createBoostingIds({ userId: user._id, count: 1, boosterAmount: boosterFind.amount, boosteringId: boosterFind._id, type: "USER" });
        const idTx = generateCustomId({ prefix: 'RNFTB', max: 10, min: 10 });
        const hashID = hash ?? generateCustomId({ prefix: '#', max: 10, min: 10 });
        const newBoosterInvest = new BoosterInvestModel({
            id: idTx, amount: boosterFind.amount, hash: hashID, booster: boosterFind._id, boosterIds: generateUserId, user: user._id
        });

        if (!user.active.isActive) {
            user.active.isActive = true;
            user.active.activeDate = new Date();
        }
        user.boosterInvestment += boosterFind.amount;
        if (!boosterFind.users.includes(user._id)) {
            boosterFind.users.push(user._id);
        }
        boosterFind.boosters.push(generateUserId);
        await boosterFind.save();
        await newBoosterInvest.save();
        await user.save();
        return res.status(201).json({ success: true, message: "Booster purchased successfully.", data: { txHash: hash, boosterId: newBoosterInvest._id } });
    } catch (error) {
        console.error("Booster Invest Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.boosterInvestHsitory = async (req, res) => {
    try {
        const histrory = await BoosterInvestModel.find({ user: req.user._id });
        return res.status(200).json({ success: true, data: histrory, message: "Booster investment history Successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.boosterInvestAllHsitory = async (req, res) => {
    try {
        const histrory = await BoosterInvestModel.find({}).populate({ path: "user", select: "username email account" });
        return res.status(200).json({ success: true, data: histrory, message: "Booster investment all history Successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};