const { PackageModel } = require("../../models/package.model.js");
const { packageSlotMethod } = require("./package.autofill.js");
const pLimit = require("p-limit");

// delay utility
const delay = ms => new Promise(res => setTimeout(res, ms));

// limit concurrency to 3 parallel slots per package

const limit = pLimit(3);
// ---------------- TWO BY EIGHT MAIN FUNCTION ----------------
const twoByEightHandSlot = async () => {
    try {
        const packages = await PackageModel.find();

        for (const pkg of packages) {
            if (!pkg) continue;

            const slotKeys = Object.keys(pkg.slots);
            const taskBatch = [];

            for (let index = 0; index < (slotKeys.length-1); index++) {
                const fromLevel = slotKeys[index];
                const toLevel = slotKeys[index + 1];
                const turnover = pkg.turnoverArray[index] ?? 0;
                const teamsLength = pkg.teams[index] ?? 0;
                const rebirthIdLength = pkg.rebirthIdArray[index] ?? 0;
                const distribution = pkg.distributionArray[index] ?? 0;

                if ((pkg.slots[fromLevel] ?? []).length > 0) {
                    taskBatch.push(
                        limit(() =>
                            
                            packageSlotMethod({
                                index: index + 1,
                                tier1: pkg.slots[fromLevel] ?? [],
                                tier2: pkg.slots[toLevel] ?? [],
                                fromLevel,
                                toLevel: toLevel ?? "finally",
                                packageId: pkg._id,
                                directPercentage: pkg.referralPercentage,
                                amount: pkg.amount,
                                count: teamsLength + 1,
                                team: teamsLength,
                                turnover,
                                income: turnover,
                                rebirthIdLength,
                                distribution,
                            })
                        )
                    );
                }
            }
            // Run all slot methods with concurrency limit
            await Promise.all(taskBatch);

            // Save once per package
            await pkg.save();

            // throttle between packages to avoid overload
            await delay(500);
        }
    } catch (err) {
        console.error("Error in twoByEightHandSlot:", err.message);
    }
};

// const twoByEightHandSlot = async () => {
//     try {
//         const packages = await PackageModel.find();

//         for (const pkg of packages) {
//             if (!pkg) continue;

//             const slotKeys = Object.keys(pkg.slots);
//             const results = []; // collect all levels in one array

//             for (let index = 0; index < slotKeys.length; index++) {
//                 const fromLevel = slotKeys[index];
//                 const toLevel = slotKeys[index + 1];

//                 results.push({
//                     tier1: pkg.slots[fromLevel] ?? [],
//                     tier2: pkg.slots[toLevel] ?? [],
//                     turnover: pkg.turnoverArray[index] ?? 0,
//                     rebirthIdLength: pkg.rebirthIdArray[index] ?? 0,
//                     distribution: pkg.distributionArray[index] ?? 0
//                 });
//             }

//             // 🚀 batch wise handle instead of per loop console
//             console.log(JSON.stringify(results, null, 2));

//             // Agar DB me save karna hai
//             // await packageSlotMethod({ packageId: pkg._id, results });

//             await pkg.save();
//             await delay(200); // thoda kam throttle rakha
//         }
//     } catch (err) {
//         console.error("Error in twoByEightHandSlot:", err.message);
//     }
// };


// setTimeout(twoByEightHandSlot, 5000)

let isProcessing = false; // Lock variable
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
