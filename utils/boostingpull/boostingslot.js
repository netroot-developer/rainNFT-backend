const { BoosterModel } = require("../../models/booster.model");
const { boostingSlotMethod } = require("./boosting.autofill");
const pLimit = require("p-limit"); // npm install p-limit

// delay utility
const delay = ms => new Promise(res => setTimeout(res, ms));
const limit = pLimit(2);
// ---------------- TWO BY EIGHT MAIN FUNCTION ----------------
const twoByEightHandSlot = async () => {
    try {
        const boosters = await BoosterModel.find({},{users:0});
        for (const pkg of boosters) {
            if (!pkg) continue;
            const taskBatch = [];
            taskBatch.push(
                limit(()=>
                    boostingSlotMethod({index:1,tier1:pkg.boosters,tier2:pkg.slotExits,count:4,fromLevel:"Level 1",toLevel:"Level 2",rebirthIdLength:2,team:pkg.usersLength,turnover:15})
                )
            )
            await Promise.all(taskBatch);
            await pkg.save();

            await delay(500);
        }
    } catch (err) {
        console.error("Error in twoByEightHandSlot:", err.message);
    }
};



let isProcessing = false;
setInterval(async () => {
    if (isProcessing) return;
    isProcessing = true;
    try {
        await twoByEightHandSlot();
    } catch (error) {
        isProcessing = false;
    } finally {
        isProcessing = false;
    }
}, 1000)
