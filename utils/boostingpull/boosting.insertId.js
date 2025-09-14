const { BoosterInvestModel } = require("../../models/booster.model");
const { BoostingIdModel } = require("../../models/boostingId.model");
const { PackageInvestment } = require("../../models/package.model");
const { RebirthIdModel } = require("../../models/rebirthId.model");
const { TransactionModel } = require("../../models/transaction.model");
const { UserModel } = require("../../models/user.model");
const { generateCustomId } = require("../generator.uniqueid");

const createBoostingIds = async ({ userId, boosteringId, count = 0, boosterAmount = 0, type, details = false }) => {
    const rebirthIds = Array.from({ length: count }, () => {
        const id = generateCustomId({ prefix: 'TVF-RB', max: 10, min: 10 });
        return {
            id: id,
            user: userId,
            boosting: boosteringId,
            type: type ?? "Auto-Boosting",
            investment: boosterAmount
        }
    });
    const createdRebirthIds = await BoostingIdModel.insertMany(rebirthIds);
    return details ? createdRebirthIds : createdRebirthIds.map(doc => doc._id);
};

const boostingInserts = async ({ user, boosterNumber, boosting }) => {
    try {
        const boostingIds = await createBoostingIds({
            userId: user?._id,
            boosteringId: boosting._id, count: boosterNumber, boosterAmount: boosting.amount,
            details: true
        });
        const ids = boostingIds.map(doc => doc._id);
        boosting.boosters.push(...ids);
        // console.log('AUTO: ',boostingIds)
        for (const boostingId of boostingIds) {
            const id = generateCustomId({ prefix: 'TVF-TXPN', max: 10, min: 10 });
            const newBoostingInvestment = new BoosterInvestModel({
                id,
                boosterIds: boostingId?._id,
                amount: boosting?.amount,
                booster: boosting._id,
                user: boostingId?.user,
                active: false,
                purchaseBy: 'USER',
                type: "AUTO PURCHASE"
            });
            await newBoostingInvestment.save();
        }
        await boosting.save();
    } catch (error) {
        console.log("Error in packageInserts:", error.message);
    }
};


module.exports = { createBoostingIds, boostingInserts }