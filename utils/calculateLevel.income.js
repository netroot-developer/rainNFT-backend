const { CommissionModel } = require("../models/commission.model");
const { ControllerModel } = require("../models/controller.model");
const { IncomeDetailModel } = require("../models/incomedetail.model");
const { UserModel } = require("../models/user.model");
const { generateCustomId } = require("./generator.uniqueid");
const { getDownlineData } = require("./getteams.downline");
const { NumberFixed } = require("./NumberFixed");

// ----------------------------------------- 2. LEVEL INCOME START -----------------------------
const levelPercentages = [5, 4, 3, 2, 1];

const levelIncomeCalculate = async ({ userId, amount, levelIncomePercentages = levelPercentages, type = 'Level' }) => {
  try {
    let currentUser = await UserModel.findById(userId, { sponsor: 1, active: 1 });
    if (!currentUser) return;

    for (let level = 0; level < levelIncomePercentages.length; level++) {
      if (!currentUser.sponsor) break;

      const uplineUser = await UserModel.findById(currentUser.sponsor, { sponsor: 1, active: 1, investment: 1, income: 1 });
      if (!uplineUser) break;

      // Skip blocked or inactive users
      if (!uplineUser.active?.isActive || uplineUser.active?.isBlocked) {
        currentUser = uplineUser;
        continue;
      }

      const incomes = await IncomeDetailModel.findOne(
        { user: uplineUser._id },
        { levelIncome: 1, currentIncome: 1, totalIncome: 1 }
      );

      if (!incomes) {
        currentUser = uplineUser;
        continue;
      }
      const controller = await ControllerModel.findOne({}, { maxIncome: 1 });
      if (incomes.totalIncome > (uplineUser.investment * controller.maxIncome)) {
        currentUser = uplineUser;
        continue;
      }

      // 🔹 Self + Team investment
      const { totalInvestment } = await getDownlineData({ userId: uplineUser._id, listDownlineShow: false });

      let isEligible = false;
      if (level >= 0 && level <= 2) {
        isEligible = uplineUser.investment >= 30000;
      } else if (level >= 3 && level <= 5) {
        const totalTeamInvestment = Number((uplineUser.investment + totalInvestment) ?? 0);
        isEligible = totalTeamInvestment >= 200000;
      } else {
        isEligible = true;
      }

      if (isEligible) {
        const percentage = levelIncomePercentages[level];
        const income = Number(amount * (percentage / 100));

        incomes.levelIncome = NumberFixed(incomes.levelIncome, income);
        incomes.totalIncome = NumberFixed(incomes.totalIncome, income);
        incomes.currentIncome = NumberFixed(incomes.currentIncome, income);

        const idTx = generateCustomId({ prefix: 'RNFT-LV', max: 10, min: 10 });
        const newLevel = new CommissionModel({
          id: idTx, user: uplineUser._id, fromUser: userId, level: level + 1,
          income, percentage, amount, type, status: "earned"
        });
        await Promise.all([newLevel.save(), incomes.save()]);
        console.log(`✅ Level Income Added: Level ${level + 1}`);
      }

      currentUser = uplineUser;
    }
  } catch (error) {
    console.error("Error in Level Income Calculation:", error.message);
  }
};



module.exports = { levelIncomeCalculate }

// ----------------------------------------- 2. LEVEL INCOME END -----------------------------
