const { CommissionModel } = require("../models/commission.model");
const { IncomeDetailModel } = require("../models/incomedetail.model");
const { UserModel } = require("../models/user.model");
const { generateCustomId } = require("./generator.uniqueid");
const { calculateLevelMultiArrayDownline } = require("./getteams.downline");
const { NumberFixed } = require("./NumberFixed");
const cron = require("node-cron");


const calculateLevelIncomes = async (userId) => {
    try {
        const user = await UserModel.findById(userId).populate({path:"income",select:"currentIncome totalIncome tradingIncome"});
        try {
            const { teamA, teamB, teamC } = await calculateLevelMultiArrayDownline(user._id);
            const otherTeam = teamB.length + teamC.length;
            const TeamALength = teamA.length;
            const investment = user.income.currentIncome;
            let incomeDistributed = false;
            if (investment >= 30000 && TeamALength >= 35 && otherTeam >= 180) {
                await selfIncomeDistribute(user,investment, 4);
                user.levelCount = 5;
                incomeDistributed = true;
            } else if (investment > 10000 && TeamALength >= 25 && otherTeam >= 70) {
                await selfIncomeDistribute(user,investment, 3.5);
                user.levelCount = 4;
                incomeDistributed = true;
            } else if (investment > 5000 && TeamALength >= 15 && otherTeam >= 35) {
                await selfIncomeDistribute(user,investment, 3);
                user.levelCount = 3;
                incomeDistributed = true;
            } else if (investment > 2000 && TeamALength >= 6 && otherTeam >= 20) {
                await selfIncomeDistribute(user,investment, 2.8);
                user.levelCount = 2;
                incomeDistributed = true;
            } else if (investment >= 500 && TeamALength >= 3 && otherTeam >= 5) {
                await selfIncomeDistribute(user,investment, 2);
                user.levelCount = 1;
                incomeDistributed = true;
            } else if (investment >= 50) {
                await selfIncomeDistribute(user,investment, 1.8);
                incomeDistributed = true;
            }
            console.log({ investment, teamA: TeamALength, otherTeam });
            if (incomeDistributed) {
                await user.save();
                console.log(`Income distributed and saved for user ${user._id}`);
            } else {
                console.log(`No income distributed for user ${user._id}`);
            }
        } catch (err) {
            console.error(`Error processing user ${user._id}:`, err.message);
        }
    } catch (err) {
        console.log(err)
        console.error("Error in calculateLevelIncomes:", err.message);
    }
};

const selfIncomeDistribute = async (user,investment, percentage) => {
    try {
        const incomeDetails = await IncomeDetailModel.findById(user.income, { currentIncome: 1, totalIncome: 1, tradingIncome: 1 });
        if (!incomeDetails) return;
        const totalCommission = investment * (percentage/100);
        const id = generateCustomId({ prefix: 'RNFT-TD', max: 14, min: 14 });
        const newTrading = new CommissionModel({ id, user: user._id, income: totalCommission, percentage: percentage, amount: Number(incomeDetails.currentIncome), type: "Trading" });
        incomeDetails.tradingIncome = NumberFixed(incomeDetails.tradingIncome, totalCommission);
        incomeDetails.totalIncome = NumberFixed(incomeDetails.totalIncome, totalCommission);
        incomeDetails.currentIncome = NumberFixed(incomeDetails.currentIncome, totalCommission);
        await newTrading.save();
        await incomeDetails.save();
        console.log(`✅ Daily Roi Profit Income Added Successfully`, user.username);
    } catch (error) {
        console.error(`Error in selfIncomeDistribute for user ${user._id}:`, error);
    }
};


let isTradingProcessing = false;
const tradingNodeCron = async () => {
    if (isTradingProcessing) return;
    isTradingProcessing = true;
    try {
        const users = await UserModel.find({ 'active.isActive': true, 'active.isVerified': true, 'active.isBlocked': false },{_id:1}).lean();
        const chunkSize = 40;
        for (let i = 0; i < users.length; i += chunkSize) {
            const chunk = users.slice(i, i + chunkSize);
            await Promise.all(chunk.map(u => calculateLevelIncomes(u._id)));
        }
    } catch (error) {
        console.error("Error in scheduled task:", error);
    } finally {
        isTradingProcessing = false;
    }
};
// Run this every month on the 1st at 12:00 AM ( `0 0 1 * *` )
cron.schedule('15 0 * * *', tradingNodeCron);
// setTimeout(tradingNodeCron, 10000)

module.exports = { calculateLevelIncomes };








// const { CommissionModel } = require("../models/commission.model");
// const { ControllerModel } = require("../models/controller.model");
// const { IncomeDetailModel } = require("../models/incomedetail.model");
// const { PackageModel } = require("../models/package.model");
// const { TransactionModel } = require("../models/transaction.model");
// const { UserModel } = require("../models/user.model");
// const { levelIncomeCalculate } = require("./calculateLevel.income");
// const { generateCustomId } = require("./generator.uniqueid");
// const { NumberFixed } = require("./NumberFixed");
// const cron = require('node-cron');

// const getCurrentMonthDays = (month = null) => {
//     const today = new Date();
//     const currentMonth = month == null ? (month || (today.getMonth() + 1)) : month || 0;
//     const year = today.getFullYear();
//     const daysInCurrentMonth = new Date(year, currentMonth, 0).getDate();
//     return daysInCurrentMonth;
// }

// function getRandomValue(min, max) {
//     return (Math.random() * (max - min) + min) / 100;
// }


// //  ------------------------ 1.TRADING PROFIT NODE-CRON START ---------------------------------
// const tradingProfitCalculate = async (userId) => {
//     try {
//         const user = await UserModel.findById(userId,{income:1,username:1,account:1,investment:1});
//         if (!user) return;
//         const incomeDetails = await IncomeDetailModel.findById(user.income,{currentIncome:1,totalIncome:1,tradingIncome:1});
//         if (!incomeDetails) return;
//         const controller = await ControllerModel.findOne();
//         const dailyPercentage = getRandomValue(controller.roi.min,controller.roi.max);
//         const totalCommission = user.investment * (dailyPercentage);
//         const id = generateCustomId({ prefix: 'RNFT-TD', max: 14, min: 14 });
//         const newTrading = new CommissionModel({ id, user: user._id, income:totalCommission, percentage: dailyPercentage*100, amount: Number(user.investment), type: "Trading" });
//         incomeDetails.tradingIncome = NumberFixed(incomeDetails.tradingIncome, totalCommission);
//         incomeDetails.totalIncome = NumberFixed(incomeDetails.totalIncome, totalCommission);
//         incomeDetails.currentIncome = NumberFixed(incomeDetails.currentIncome, totalCommission);
//         await newTrading.save();
//         await incomeDetails.save();
//         await levelIncomeCalculate({userId:user._id,amount:totalCommission,levelIncomePercentages:controller.levels,type:"Level"})
//         console.log(`✅ Daily Roi Profit Income Added Successfully`, user.username);
//     } catch (error) {
//         console.error("❌ Error in Trading Profit Income Calculation:", error.message);
//     }
// };
// let isTradingProcessing = false;
// const tradingNodeCron = async () => {
//     if (isTradingProcessing) return;
//     isTradingProcessing = true;
//     try {
//         const users = await UserModel.find({ 'active.isActive': true, 'active.isVerified': true, 'active.isBlocked': false }, "_id").lean();
//         const chunkSize = 40;
//         for (let i = 0; i < users.length; i += chunkSize) {
//             const chunk = users.slice(i, i + chunkSize);
//             await Promise.all(chunk.map(u => tradingProfitCalculate(u._id)));
//         }
//     } catch (error) {
//         console.error("Error in scheduled task:", error);
//     } finally {
//         isTradingProcessing = false;
//     }
// };
// // Run this every month on the 1st at 12:00 AM ( `0 0 1 * *` )
// cron.schedule('15 0 * * *', tradingNodeCron);
// // setInterval(tradingNodeCron, 6000000)
// // setTimeout(tradingNodeCron, 10000)
// //  ------------------------ 1.TRADING PROFIT NODE-CRON END --------------------------------- 

