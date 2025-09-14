const { CommissionModel } = require("../models/commission.model");
const { IncomeDetailModel } = require("../models/incomedetail.model");
const { UserModel } = require("../models/user.model");
const { generateCustomId } = require("./generator.uniqueid");
const { NumberFixed } = require("./NumberFixed");

exports.directIncomeCalculate = async ({ userId = null, directPercentage = 0, amount = 0, type = 'Direct' }) => {
    try {
        console.log({userId})
        const user = await UserModel.findById(userId, { sponsor: 1 });
        if (!user) return;
        const sponsor = await UserModel.findById(user.sponsor, { username: 1, sponsor: 1, active: 1 });
        if (!sponsor || !sponsor.active?.isActive || sponsor.active?.isBlocked) return;
        const incomes = await IncomeDetailModel.findOne({ user: sponsor._id }, { directIncome: 1, currentIncome: 1, totalIncome: 1 });
        if (incomes) {
            const percentage = Number(directPercentage / 100);
            const income = Number(amount * percentage);
            incomes.directIncome = NumberFixed(incomes.directIncome, income);
            incomes.totalIncome = NumberFixed(incomes.totalIncome, income);
            incomes.currentIncome = NumberFixed(incomes.currentIncome, income);
            const idTx = generateCustomId({ prefix: 'RNFT-REF', max: 10, min: 10 });
            const newLevel = new CommissionModel({
                id: idTx, user: sponsor._id,
                fromUser: user._id, level: 1, income,
                percentage: directPercentage,
                amount, type,
                status: "earned"
            });
            await Promise.all([newLevel.save(), incomes.save()]);
            console.log(`Direct income given to ${sponsor.username}`);
        }

    } catch (error) {
        console.error("Error in Direct Income Calculation:", error.message);
    }
};
