const { BoosterModel } = require("../../models/booster.model");
const { BoostingIdModel } = require("../../models/boostingId.model");
const { CommissionModel } = require("../../models/commission.model");
const { IncomeDetailModel } = require("../../models/incomedetail.model");
const { UserModel } = require("../../models/user.model");
const { generateCustomId } = require("../generator.uniqueid");
const { boostingInserts } = require("./boosting.insertId");

const boostingSlotMethod = async ({
    index, tier1, tier2, count, team, fromLevel, toLevel, turnover, rebirthIdLength }) => {
    try {
        const currentTierCount = tier2.length;
        const parent = tier1[currentTierCount];
        if (!parent) return;

        const totalToSlice = (currentTierCount + 1) * count;
        const nextUsers = tier1.slice(currentTierCount * (count - 1), totalToSlice);
        nextUsers.shift();

        if (nextUsers.length >= (count - 1)) {
            const boostingUserFind = await BoostingIdModel.findById(parent);
            if (!boostingUserFind) return;
            const parentUser = await UserModel.findById(boostingUserFind.user, {username: 1, sponsor: 1, income: 1,account:1}).lean();
            if (!parentUser) return;
            const incomeDetails = await IncomeDetailModel.findOne({ user: parentUser._id });
            if (!incomeDetails) return;
            const boosterFind = await BoosterModel.findOne({ amount: 5 }, { amount: 1, 'boosters': 1 });
            // console.log({ boosterFind, parent, nextUsers, count, active: nextUsers.length >= (count - 1) })
            if (!boosterFind) return;
            const didection = boosterFind.amount * rebirthIdLength;
            const income = turnover - didection;

            incomeDetails.totalIncome += income;
            incomeDetails.boostingIncome += income;
            boostingUserFind.income += income;
            boostingUserFind.totalIncome += turnover;
            boostingUserFind.active = true;
            if (rebirthIdLength > 0) {
                await boostingInserts({ user:parentUser._id,boosterNumber:rebirthIdLength,boosting:boosterFind });
            }

            const id = generateCustomId({ prefix: 'TVFNW', max: 10, min: 10 });
            const incomeDoc = {
                id: id,
                user: parentUser._id,
                boosterId: boostingUserFind._id,
                income: income,
                amount: turnover,
                teamRequired: team,
                usersLength: nextUsers.length,
                fromLevel,
                toLevel,
                level: index,
                booster: boosterFind._id,
                groups: nextUsers,
                type: "Boosting",
                status: "earned"
            };

            tier2.push(boostingUserFind._id);
            await CommissionModel.insertMany([incomeDoc]);
            await incomeDetails.save()
            await boostingUserFind.save()
            console.log(`${parentUser.username}, ${fromLevel}, ${toLevel}, ${income} Slot change successfully.`);
        }
    } catch (error) {
        console.error("Error in boostingSlotMethod:", error);
        console.error("Error in boostingSlotMethod:", error.message);
    }
};

module.exports = { boostingSlotMethod }