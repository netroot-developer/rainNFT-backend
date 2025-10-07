const { TransactionModel } = require("../models/transaction.model");
const { generateCustomId } = require("../utils/generator.uniqueid");
const { IncomeDetailModel } = require("../models/incomedetail.model");
const { UserModel } = require("../models/user.model");
const { sendUsdtWithdrawal } = require("../utils/withdrawal.web");
const { CommissionModel } = require("../models/commission.model");
const { uploadToImageKit } = require("../utils/upload.imagekit");
const { isAddress } = require("ethers");
const { generateOTP } = require("../utils/generateOTP");
const { withdrawalRequestTemplete } = require("../utils/mailtemplate");
const { sendToOtp } = require("../utils/sendtootp.nodemailer");
const { getDailyProfitPercentage } = require("../utils/activedays.date");
const { ControllerModel } = require("../models/controller.model");

exports.withdrawalRequestSendOtp = async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || amount < 0) res.status(500).json({ success: false, message: 'Amount & Wallet address are required.' });
        if (amount < 0) res.status(500).json({ success: false, message: 'Minimum $50 withdrawal.' });
        const amountNumber = Number(amount);
        const user = await UserModel.findOne({ _id: req.user._id }, { email: 1, otpDetails: 1, username: 1, id: 1, email: 1, mobile: 1 });
        if (!user) return res.status(400).json({ success: false, message: "User not found" });
        const incomeDetails = await IncomeDetailModel.findOne({ user: user._id }, { currentIncome: 1 }).populate({ path: "user", select: "username account" })
        if (incomeDetails.currentIncome < amountNumber) return res.status(500).json({ success: false, message: `Insufficient balance. Please try again with an amount within your available limit.` });
        const { otp, otpExpiry } = generateOTP({});
        user.otpDetails.otp = otp;
        user.otpDetails.otpExpiry = otpExpiry;
        const { html, text } = await withdrawalRequestTemplete(user, amount, otp, new Date());
        await sendToOtp({ user: user, otp, html, text, subject: "💸 Withdrawal Request Confirmation - Rain NFT" });
        await user.save();
        res.status(200).json({ success: true, message: "📩 OTP sent successfully to your registered email.", data: { id: user._id, email: user.email } });
    } catch (err) {
        res.status(500).json({ success: false, message: `⚠️ ${err.message}` });
    }
};

// exports.WalletWithdrawalRequest = async (req, res) => {
//     try {
//         const { amount, walletAddress, otp } = req.body
//         if (!amount || amount < 0 || !walletAddress || !otp) res.status(500).json({ success: false, message: 'Amount & Wallet address are required.' });
//         if (!isAddress(walletAddress)) return res.status(500).json({ success: false, message: "Invalid wallet address. Please provide a valid address." })

//         const userFind = await UserModel.findById(req.user._id,{otpDetails:1,"active.activeDate":1})
//         if (!userFind.otpDetails.otp || !userFind.otpDetails.otpExpiry) return res.status(400).json({ success: false, message: "OTP not generated" });
//         if (Date.now() > userFind.otpDetails.otpExpiry) return res.status(400).json({ success: false, message: "OTP expired" })
//         if (userFind.otpDetails.otp != otp) return res.status(400).json({ success: false, message: "Invalid OTP" })
//         const amountNumber = Number(amount);
//         if (amountNumber < 0) return res.status(500).json({ success: false, message: 'Minimum withdrawal amount is $5.' });
//         const user = await IncomeDetailModel.findOne({ user: req.user._id }, { currentIncome: 1, user: 1, withdrawal: 1 }).populate({ path: "user", select: "username account" })
//         if (!user) res.status(500).json({ success: false, message: 'User does not exist.' });
//         if (user.currentIncome < amountNumber) return res.status(500).json({ success: false, message: `Insufficient balance. Please try again with an amount within your available limit.` });
//         const id = generateCustomId({ prefix: "RNFW", min: 10, max: 10 });
//         const percentageDayBise = getDailyProfitPercentage(userFind.active.activeDate);
//         const newWith = new TransactionModel({ id, clientAddress: walletAddress, mainAddress: process.env.WALLET_ADDRESS, percentage: percentageDayBise ?? 5, role: 'USER', investment: amountNumber, user: user.user, status: "Processing", type: "Withdrawal" });
//         user.withdrawal += Number(amountNumber);
//         user.currentIncome -= Number(amountNumber);

//         userFind.otpDetails.otp = null; // clear otp
//         userFind.otpDetails.otpExpiry = null;
//         await user.save();
//         await newWith.save();
//         res.status(201).json({ success: true, data: { amount, walletAddress: user?.user?.account }, message: 'Your withdrawal request has been placed successfully. Settlement will be done within 24 hours.' })
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ success: false, message: error.message })
//     }
// }



// let amount = 30;
// let currentIncome = 90;
// let investment = 80;
// let overlap = 0;

// // 🔹 Calculate remaining after currentIncome deduction
// let remainingAmount = currentIncome - amount;

// // 🔹 If remainingAmount < investment, calculate overlap
// if (remainingAmount < investment) {
//     overlap = investment - remainingAmount;  // amount to deduct additionally from investment
//     investment -= overlap;                   // deduct overlap from investment
// } 

// currentIncome -= amount;  // deduct from currentIncome

// console.log("currentIncome:", currentIncome);
// console.log("investment:", investment);
// console.log("overlap:", overlap);


exports.WalletWithdrawalRequest = async (req, res) => {
    try {
        const { amount, walletAddress, otp } = req.body;

        if (!amount || amount <= 0 || !walletAddress || !otp)
            return res.status(400).json({ success: false, message: 'Amount, wallet address, and OTP are required.' });

        if (!isAddress(walletAddress))
            return res.status(400).json({ success: false, message: "Invalid wallet address. Please provide a valid address." });

        // ✅ Fetch user with OTP and investment
        const userFind = await UserModel.findById(req.user._id, {
            otpDetails: 1,
            "active.activeDate": 1,
            investment: 1
        });

        if (!userFind) return res.status(400).json({ success: false, message: "User not found." });
        if (!userFind?.otpDetails?.otp || !userFind?.otpDetails?.otpExpiry) return res.status(400).json({ success: false, message: "OTP not generated." });
        if (Date.now() > userFind.otpDetails.otpExpiry) return res.status(400).json({ success: false, message: "OTP expired." });
        if (userFind.otpDetails.otp != otp) return res.status(400).json({ success: false, message: "Invalid OTP." });
        const amountNumber = Number(amount);
        if (amountNumber < 5) return res.status(400).json({ success: false, message: 'Minimum withdrawal amount is $5.' });
        const incomeDetail = await IncomeDetailModel.findOne({ user: req.user._id }, { currentIncome: 1, user: 1, withdrawal: 1 }).populate({ path: "user", select: "username account" });
        if (!incomeDetail) return res.status(400).json({ success: false, message: 'User income record not found.' });
        if (incomeDetail.currentIncome < amountNumber) return res.status(400).json({ success: false, message: `Insufficient balance. Available: $${totalAvailable}` });
        const id = generateCustomId({ prefix: "RNFW", min: 10, max: 10 });
        const percentageDayBise = getDailyProfitPercentage(userFind.active.activeDate);
        const newWith = new TransactionModel({
            id, clientAddress: walletAddress, mainAddress: process.env.WALLET_ADDRESS,
            percentage: percentageDayBise ?? 5,
            investment: amountNumber,
            user: incomeDetail.user,
            status: "Processing",
            type: "Withdrawal"
        });

        let overlapAmount = 0;
        let remainingAmount = incomeDetail.currentIncome - amountNumber;
        if (remainingAmount < userFind.investment) {
            overlapAmount = userFind.investment - remainingAmount;
            userFind.investment -= overlapAmount;
            if(userFind.investment < 0) userFind.investment = 0;
            newWith.remainInvestment = overlapAmount;
        }
        incomeDetail.currentIncome -= amountNumber;
        incomeDetail.withdrawal += amountNumber;

        // console.log("incomeDetail.currentIncome:", incomeDetail.currentIncome);
        // console.log("userFind.investment:", userFind.investment);
        // console.log("overlapAmount:", overlapAmount);

        userFind.otpDetails.otp = null;
        userFind.otpDetails.otpExpiry = null;
        if (!userFind.account) userFind.account = walletAddress;
        await Promise.all([incomeDetail.save(), userFind.save(), newWith.save()]);
        res.status(201).json({ success: true, data: { amount, walletAddress }, message: 'Your withdrawal request has been placed successfully. Settlement will be done within 24 hours.' })
    } catch (error) {
        console.error("❌ Withdrawal Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};



exports.WithdrawalAccepted = async (req, res) => {
    try {
        const { status, id, reason } = req.body;
        if (!id || !status) return res.status(500).json({ success: false, message: 'Amount & Status are required.' });
        const newWith = await TransactionModel.findById(id);
        if (!newWith) res.status(500).json({ success: false, message: 'TX does not exist.' });
        const user = await IncomeDetailModel.findOne({ user: newWith.user }).populate({ path: "user", select: "investment levelCount" });
        if (!user) res.status(500).json({ success: false, message: 'User does not exist.' });
        if (status === 'Completed') {
            const amount = newWith.investment - (newWith.investment * (newWith.percentage / 100));
            const controller = await ControllerModel.findOne({}, { walletDetails: 1 });
            const hash = await sendUsdtWithdrawal({ toAddress: newWith.clientAddress, amount: amount, PRIVATE_KEY: controller.walletDetails.key });
            if (!hash) return res.status(500).json({ success: false, message: "Insufficient balance." });
            newWith.status = 'Completed';
            newWith.hash = hash;
        } else if (status === 'Cancelled') {
            newWith.status = 'Cancelled';
            user.withdrawal -= Number(newWith.investment);
            user.currentIncome += Number(newWith.investment);
            if(newWith?.remainInvestment){
                const userFind = await UserModel.findById(newWith.user, { investment: 1 });
                userFind.investment += Number(newWith.investment);
                await userFind.save();
            }
            const levelCheck = {
                1: { min: 50, max: 499 },
                2: { min: 500, max: 1999 },
                3: { min: 2000, max: 4999 },
                4: { min: 5000, max: 9999 },
                5: { min: 10000, max: 29999 },
                6: { min: 30000, max: Infinity }
            };
            const currentIncome = user.currentIncome;
            for (const [level, range] of Object.entries(levelCheck)) {
                if (currentIncome >= range.min && currentIncome <= range.max) {
                    user.user.levelCount = parseInt(level);
                    break;
                };
            };
        }
        newWith.reason = reason;
        newWith.approvedDate = new Date();
        await user.save();
        await newWith.save();
        res.status(201).json({ success: true, message: `Withdrawal ${status} Successful.` })
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message })
    }
}


// withdrawal limits as per levels
exports.createInstantWithdrawal = async (req, res) => {
    try {
        const userId = req.user._id;
        const { amount } = req.body;
        if (!amount || amount < 0) return res.status(400).json({ success: false, message: "Please enter a valid withdrawal amount" });
        if (amount < 0) return res.status(400).json({ success: false, message: "Minimum $1 withdrawal." });
        const user = await UserModel.findById(userId, { account: 1, income: 1, sponsor: 1, investment: 1 });
        const income = await IncomeDetailModel.findOne({ user: user._id }, { currentIncome: 1, totalIncome: 1, withdrawal: 1 });
        if (income.currentIncome < amount) return res.status(400).json({ success: false, message: "Insufficient wallet balance" });
        const maxWithdrawal = (user.investment || 0) * 5;
        const totalWithdrawalDone = await TransactionModel.aggregate([
            { $match: { user: user._id, type: "Withdrawal", status: "Confirmed" } },
            { $group: { _id: null, total: { $sum: "$investment" } } }
        ]);

        const alreadyWithdrawn = totalWithdrawalDone.length ? totalWithdrawalDone[0].total : 0;
        if ((alreadyWithdrawn + amount) > maxWithdrawal) {
            return res.status(400).json({ success: false, message: "You can take up to 5x of your investment amount. Please increase your package." });
        }
        const Admincharge = 5;
        const sponsorcharge = 5;
        const admincharges = (amount * Admincharge) / 100;
        const sponsorCharges = (amount * sponsorcharge) / 100;
        const finalAmount = amount - admincharges - sponsorCharges;
        const hash = await sendUsdtWithdrawal({ toAddress: user.account, amount: finalAmount });
        if (!hash) return res.status(500).json({ success: false, message: "Insufficient balance." })
        const id = generateCustomId({ prefix: "TVFW", min: 10, max: 10 });
        const withdrawal = await TransactionModel.create({ id, user: user._id, investment: amount, parcentage: Admincharge, toAddress: user.account, admincharges: Admincharge, sponsorCharges: sponsorcharge, finalAmount, hash, type: 'Withdrawal', status: "Confirmed" });
        income.currentIncome -= amount;
        income.withdrawal += amount;
        if (user.sponsor) {
            const sponsor = await UserModel.findById(user?.sponsor);
            const sponsorIncome = await IncomeDetailModel.findOne({ user: sponsor._id }, { currentIncome: 1, totalIncome: 1, withdrawalIncome: 1 });
            sponsorIncome.withdrawalIncome += sponsorCharges;
            sponsorIncome.totalIncome += sponsorCharges;
            sponsorIncome.currentIncome += sponsorCharges;
            const id = generateCustomId({ prefix: "TVFW", min: 10, max: 10 })
            const newIncome = new CommissionModel({ id, user: sponsor._id, fromUser: user._id, amount, income: sponsorCharges, percentage: sponsorcharge, type: "Withdrawal-Income" })
            await newIncome.save();
            await sponsorIncome.save();
        }
        await income.save();
        return res.status(200).json({ success: true, message: "Withdrawal successfully.", data: withdrawal });
    } catch (error) {
        console.error("Withdrawal error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};


// withdrawal limits as per levels
exports.createBoostingInstantWithdrawal = async (req, res) => {
    try {
        const userId = req.user._id;
        const { amount } = req.body;
        if (!amount || amount < 0) return res.status(400).json({ success: false, message: "Please enter a valid withdrawal amount" });
        if (amount < 0) return res.status(400).json({ success: false, message: "Minimum $1 withdrawal." });
        const user = await UserModel.findById(userId, { account: 1, income: 1, sponsor: 1, investment: 1 });
        const income = await IncomeDetailModel.findOne({ user: user._id }, { totalIncome: 1, withdrawal: 1, boostingIncome: 1 });
        if (income.boostingIncome < amount) return res.status(400).json({ success: false, message: "Insufficient Boosting wallet balance" });

        const Admincharge = 5;
        const sponsorcharge = 5;
        const admincharges = (amount * Admincharge) / 100;
        const sponsorCharges = (amount * sponsorcharge) / 100;
        const finalAmount = amount - admincharges - sponsorCharges;
        const hash = await sendUsdtWithdrawal({ toAddress: user.account, amount: finalAmount });
        if (!hash) return res.status(500).json({ success: false, message: "Insufficient balance." })
        const id = generateCustomId({ prefix: "TVFW", min: 10, max: 10 });
        const withdrawal = await TransactionModel.create({ id, user: user._id, investment: amount, parcentage: Admincharge, toAddress: user.account, admincharges: Admincharge, sponsorCharges: sponsorcharge, finalAmount, hash, type: 'Withdrawal', status: "Confirmed" });
        income.boostingIncome -= amount;
        // income.withdrawal += amount;
        if (user.sponsor) {
            const sponsor = await UserModel.findById(user?.sponsor);
            const sponsorIncome = await IncomeDetailModel.findOne({ user: sponsor._id }, { currentIncome: 1, totalIncome: 1, withdrawalIncome: 1 });
            sponsorIncome.withdrawalIncome += sponsorCharges;
            sponsorIncome.totalIncome += sponsorCharges;
            sponsorIncome.currentIncome += sponsorCharges;
            const id = generateCustomId({ prefix: "TVFW", min: 10, max: 10 })
            const newIncome = new CommissionModel({ id, user: sponsor._id, fromUser: user._id, amount, income: sponsorCharges, percentage: sponsorcharge, type: "Withdrawal-Income" })
            await newIncome.save();
            await sponsorIncome.save();
        }
        await income.save();
        return res.status(200).json({ success: true, message: "Withdrawal successfully.", data: withdrawal });
    } catch (error) {
        console.error("Withdrawal error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};