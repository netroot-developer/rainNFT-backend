const {UserModel} = require("../models/user.model");
const {BoosterInvestModel} = require("../models/booster.model");
const {CommissionModel} = require("../models/commission.model");
const {IncomeDetailModel} = require("../models/incomedetail.model");
const { generateCustomId } = require("../utils/generator.uniqueid");
exports.calculateBoostingIncome = async (user) => {
    try {
        // sponsor ko fetch karo
        const sponsor = await UserModel.findById(user.sponsor);
        if (!sponsor) return;

        // sponsor ka koi active boosting slot dhundo
        const oldBoosting = await BoosterInvestModel.findOne({ user: sponsor._id, status: false }).sort({ createdAt: 1 });
        if (!oldBoosting) return console.log(`Booster not active ${sponsor.username}`);

        // check duplicate entry
        if (!oldBoosting.nextMember.includes(user._id)) {
            oldBoosting.nextMember.push(user._id);
            console.log({nextMember:oldBoosting.nextMember})

            if (oldBoosting.nextMember.length >= 3) {
                // ✅ 3 users complete -> income generate
                const income = oldBoosting.amount * 3;
                const id = generateCustomId({ prefix: 'TVFB', max: 10, min: 10 });

                const newIncome = new CommissionModel({
                    income,
                    amount: oldBoosting.amount,
                    user: sponsor._id,
                    booster: oldBoosting._id,
                    usersLength:oldBoosting.nextMember.length,
                    id,
                    type: "Boosting"
                });

                // sponsor income update
                const incomeDetails = await IncomeDetailModel.findOne({ user: sponsor._id });
                if (incomeDetails) {
                    incomeDetails.currentIncome += income;
                    incomeDetails.totalIncome += income;
                    incomeDetails.boostingIncome += income;
                    await incomeDetails.save();
                }

                // booster slot complete mark
                oldBoosting.status = true;
                await oldBoosting.save();
                await newIncome.save();

                // ✅ sponsor ko lock karna next cycle ke liye
                sponsor.boosterInfo.cycle += 1;
                sponsor.boosterInfo.required = 2; // agle cycle ke liye 2 boosters chahiye
                sponsor.boosterInfo.usedForNext = 0;
                sponsor.boosterInfo.eligible = false;

                await sponsor.save();
                console.log(`Boosting income calculate ${sponsor.username} successfully.`)
            }else{
                console.log(`Boosting income not calculate ${sponsor.username}`)
            }
            await oldBoosting.save();
        }
    } catch (err) {
        console.error("calculateBoostingIncome error:", err);
    }
};
