const { CommissionModel } = require("../../models/commission.model");
const { IncomeDetailModel } = require("../../models/incomedetail.model");
const { PackageModel, PackageInvestment } = require("../../models/package.model");
const { RebirthIdModel } = require("../../models/rebirthId.model");
const { TransactionModel } = require("../../models/transaction.model");
const { UserModel } = require("../../models/user.model");
const { generateCustomId } = require("../generator.uniqueid");

const createRebirthIds = async ({ userId, packageId, count = 0, packageAmount = 0, type, details = false }) => {
    const rebirthIds = Array.from({ length: count }, () => {
        const id = generateCustomId({ prefix: 'RNFT-RB', max: 10, min: 10 });
        return {
            id: id,
            user: userId,
            package: packageId,
            type: type ?? "Auto-Rebirth",
            investment: packageAmount
        }
    });
    const createdRebirthIds = await RebirthIdModel.insertMany(rebirthIds);
    return details ? createdRebirthIds : createdRebirthIds.map(doc => doc._id);
};

const packageInserts = async ({ user, rebirthNumber, package }) => {
    try {
        const rebirthIds = await createRebirthIds({
            userId: user?._id,
            packageId: package._id, count: rebirthNumber, packageAmount: package.amount,
            details: true
        });
        const ids = rebirthIds.map(doc => doc._id);
        package.slots.level1.push(...ids);
        await package.save();
    } catch (error) {
        console.log("Error in packageInserts:", error.message);
    }
};


module.exports = { createRebirthIds, packageInserts }