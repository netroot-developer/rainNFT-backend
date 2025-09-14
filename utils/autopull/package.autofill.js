const { CommissionModel } = require("../../models/commission.model");
const { IncomeDetailModel } = require("../../models/incomedetail.model");
const { PackageInvestment, PackageModel } = require("../../models/package.model");
const { RebirthIdModel } = require("../../models/rebirthId.model");
const { TransactionModel } = require("../../models/transaction.model");
const { UserModel } = require("../../models/user.model");
const { directIncomeCalculate } = require("../calculateDirect.icome");
const { levelIncomeCalculate } = require("../calculateLevel.income");
const { royaltyDistributeCalculate } = require("../calculateRoyalty.investment");
const { generateCustomId } = require("../generator.uniqueid");
const { packageInserts, createRebirthIds } = require("./package.insertId");

const packageSlotMethod = async ({
    index, tier1, tier2, packageId, directPercentage, count, team, fromLevel, toLevel, turnover, distribution, rebirthIdLength }) => {
    try {
        const currentTierCount = tier2.length;
        const parent = tier1[currentTierCount];
        if (!parent) return;

        const totalToSlice = (currentTierCount + 1) * count;
        const nextUsers = tier1.slice(currentTierCount * (count - 1), totalToSlice);
        nextUsers.shift();

        if (nextUsers.length >= (count - 1)) {
            const rebirthFind = await RebirthIdModel.findById(parent);
            if (!rebirthFind) return;

            const parentUser = await UserModel.findById(rebirthFind.user, { username: 1, sponsor: 1, income: 1, account: 1 }).lean();
            if (!parentUser) return;
            const incomeDetails = await IncomeDetailModel.findOne({ user: parentUser._id });
            if (!incomeDetails) return;
            const rebirthCount = await RebirthIdModel.countDocuments({ user: parentUser._id });
            const rebirthMainCount = (await RebirthIdModel.countDocuments({ user: parentUser._id, type: "USER" }) ?? 0) * 3;
            if (rebirthCount <= rebirthMainCount) {
                const packageFind = await PackageModel.findById(packageId, { amount: 1, "slots.level1": 1 });
                if (!packageFind) return;
                const [ids] = await createRebirthIds({
                    userId: parentUser._id,
                    packageId: packageFind._id,
                    type: "Auto-Rebirth",
                    count: 1,
                    packageAmount: packageFind.amount
                });
                packageFind.slots.level1.push(ids);
                await packageFind.save();
            }

            const income = Number(turnover);

            incomeDetails.totalIncome += income;
            incomeDetails.currentIncome += income;
            incomeDetails.nonWorkingIncome += income;
            rebirthFind.income += income;

            const id = generateCustomId({ prefix: 'RNFTNW', max: 10, min: 10 });
            const incomeDoc = {
                id: id,
                user: parentUser._id,
                rebirth: rebirthFind._id,
                income: income,
                amount: turnover,
                teamRequired: team,
                usersLength: nextUsers.length,
                fromLevel,
                toLevel,
                level: index,
                package: packageId,
                groups: nextUsers,
                type: "Non-Working",
                status: "earned"
            };

            tier2.push(rebirthFind._id);
            await CommissionModel.insertMany([incomeDoc]);
            await incomeDetails.save()
            await rebirthFind.save()
            console.log(`${parentUser.username}, ${fromLevel}, ${toLevel}, ${income} Slot change successfully.`);
        }
    } catch (error) {
        console.error("Error in packageSlotMethod:", error);
        console.error("Error in packageSlotMethod:", error.message);
    }
};

module.exports = { packageSlotMethod }