const { CommissionModel } = require("../models/commission.model");
const { IncomeDetailModel } = require("../models/incomedetail.model");
const { PackageModel } = require("../models/package.model");
const { RoyaltyModel } = require("../models/royalty.model");
const { UserModel } = require("../models/user.model");
const { generateCustomId } = require("./generator.uniqueid");
const { getDownlineArrayRoyalty } = require("./getteams.downline");
const { NumberFixed } = require("./NumberFixed");

const pLimit = require("p-limit"); // npm install p-limit

// concurrency limiter (3 tasks parallel)
const limit = pLimit(3);

const delay = (ms) => new Promise((res) => setTimeout(res, ms));


const royaltyIncomeCalculate = async () => {
  try {
    const packages = await PackageModel.find({ status: true }).lean();

    for (const pkg of packages) {
      if (!pkg.users || pkg.users.length === 0) continue;

      const royaltySlabs = await RoyaltyModel.find({ status: true }).sort({ teamUsers: -1 })

      console.log(`Processing package: ${pkg._id} (${pkg.amount})`);
      await Promise.all(
        pkg.users.map((user) =>
          limit(async () => {
            try {
              const currentUser = await UserModel.findOne({ _id: user._id, "active.isActive": true,"active.isBlocked": false}, { sponsor: 1, active: 1, username: 1 }).lean();

              if (!currentUser) return;

              for (const slab of royaltySlabs) {
                const alreadyEarned = await CommissionModel.findOne({ user: currentUser._id, reward: slab._id, package: pkg._id, type: "Reward"});

                if (alreadyEarned) {
                  console.log(`Already earned royalty for slab ${slab.teamUsers}: ${currentUser.username}`);
                  continue;
                }

                const { downlineWithPackage } = await getDownlineArrayRoyalty(currentUser._id, pkg.amount);
                const achieved = downlineWithPackage >= slab.teamUsers;
                if (achieved) {
                  const income = slab.income;
                  let incomeDetails = await IncomeDetailModel.findOne({user: currentUser._id});

                  if (!incomeDetails) incomeDetails = new IncomeDetailModel({ user: currentUser._id,});
                  incomeDetails.rewardIncome = NumberFixed( incomeDetails.rewardIncome, income );
                  incomeDetails.totalIncome = NumberFixed(incomeDetails.totalIncome,income );
                  incomeDetails.currentIncome = NumberFixed(incomeDetails.currentIncome, income );

                  const id = generateCustomId({ prefix: "RNFT-RLT" });
                  const newRoyalty = new CommissionModel({
                    id,
                    income,
                    user: currentUser._id,
                    reward: slab._id,
                    package: pkg._id,
                    type: "Reward",
                    status: "earned",
                  });
                  await RoyaltyModel.updateOne({ _id: slab._id }, { $addToSet: { users: currentUser._id } });
                  await Promise.all([newRoyalty.save(), incomeDetails.save()]);

                  console.log(
                    `✅ Reward achieved (Slab ${slab.teamUsers}) for ${currentUser.username}`
                  );
                } else {
                  console.log(
                    `❌ Not eligible (Slab ${slab.teamUsers}) for ${currentUser.username}`
                  );
                }
              }

              // Add small delay to avoid DB overload
              await delay(200);
            } catch (err) {
              console.error(
                `Error processing user ${user._id} in package ${pkg._id}:`,
                err.message
              );
            }
          })
        )
      );
    }
  } catch (error) {
    console.error("❌ Error in royalty income calculation:", error);
  }
};


// const royaltyIncomeCalculate = async ({ userId }) => {
//     try {
//         // ✅ Active & verified user
//         const currentUser = await UserModel.findOne(
//             { _id: userId, 'active.isActive': true, 'active.isBlocked': false },
//             { sponsor: 1, active: 1, username: 1 }
//         );
//         if (!currentUser) return;

//         // ✅ Royalty slabs (jisme user already eligible nahi hai)
//         const royaltySlabs = await RoyaltyModel.find({
//             status: true,
//             users: { $nin: [currentUser._id] }
//         }).sort({ teamUsers: 1 });

//         // ✅ User ka highest package
//         const highestPackage = await PackageModel.findOne({ users: currentUser._id }).sort({ amount: -1 }).lean();

//         for (const slab of royaltySlabs) {
//             // ✅ Double-check: agar user already us slab me hai
//             if (slab.users.includes(currentUser._id)) continue;

//             // ✅ Downline condition check
//             const { directCount, downlineWithPackage, downlineCount } = await getDownlineArrayRoyalty(currentUser._id, slab.teamPackage);

//             console.log({ directCount, downlineWithPackage, downlineCount });

//             const eligibleTeamCount = downlineWithPackage >= slab.teamUsers;

//             if (eligibleTeamCount) {
//                 // ✅ Same royalty + package check
//                 const alreadyEarned = await CommissionModel.findOne({
//                     user: currentUser._id,
//                     royalty: slab._id,
//                     teamPackage: slab.teamPackage,  // 👈 package bhi check
//                     type: "Royalty"
//                 });

//                 if (alreadyEarned) {
//                     console.log(
//                         `Already earned royalty for package ${slab.teamPackage}: ${currentUser.username}`
//                     );
//                     continue;
//                 }

//                 const income = slab.income;

//                 // ✅ Income details update
//                 let incomeDetails = await IncomeDetailModel.findOne({ user: currentUser._id });
//                 if (!incomeDetails) {
//                     incomeDetails = new IncomeDetailModel({ user: currentUser._id });
//                 }

//                 incomeDetails.rewardIncome = NumberFixed(incomeDetails.rewardIncome, income);
//                 incomeDetails.totalIncome = NumberFixed(incomeDetails.totalIncome, income);
//                 incomeDetails.currentIncome = NumberFixed(incomeDetails.currentIncome, income);

//                 // ✅ Commission record create
//                 const id = generateCustomId({ prefix: "TVF-RLT" });
//                 const newRoyalty = new CommissionModel({
//                     income,
//                     user: currentUser._id,
//                     royalty: slab._id,
//                     teamPackage: slab.teamPackage, // 👈 important
//                     id,
//                     type: "Royalty",
//                     status: "earned"
//                 });

//                 // ✅ User ko royalty achieved me add karo
//                 slab.users.push(currentUser._id);
//                 await slab.save();
//                 await newRoyalty.save();
//                 await incomeDetails.save();

//                 console.log(`Reward achieved successfully: ${currentUser.username}`);
//             } else {
//                 console.log(`Not eligible for royalty: ${currentUser.username}`);
//             }
//         }
//     } catch (error) {
//         console.error("Error in royalty income calculation:", error.message);
//     }
// };







// const royaltyIncomeCalculate = async ({ userId }) => {
//   try {
//     // ✅ Active user check
//     const currentUser = await UserModel.findOne( { _id: userId, 'active.isActive': true, 'active.isBlocked': false },{ username: 1 });
//     if (!currentUser) return;
//     const highestPackage = await PackageModel.findOne({ users: currentUser._id }).sort({ amount: -1 }).lean();
//     if (!highestPackage) return;
//     const packageAmount = highestPackage.amount; // 👈 10 or 100
//     const { downlineCount } = await getDownlineArrayRoyalty(currentUser._id, packageAmount);

//     for (const slab of ROYALTY_SLABS) {
//       if (downlineCount >= slab.team) {
//         const income = slab.reward[packageAmount];

//         // ✅ Pehle se reward mila kya?
//         const alreadyEarned = await CommissionModel.findOne({
//           user: currentUser._id,
//           type: "Royalty",
//           teamPackage: packageAmount,
//           teamUsers: slab.team // 👈 ye bhi store karenge
//         });

//         if (alreadyEarned) {
//           console.log(
//             `Already earned reward for Team ${slab.team}, Package ${packageAmount}: ${currentUser.username}`
//           );
//           continue;
//         }

//         // ✅ Income details update
//         let incomeDetails = await IncomeDetailModel.findOne({ user: currentUser._id });
//         if (!incomeDetails) {
//           incomeDetails = new IncomeDetailModel({ user: currentUser._id });
//         }

//         incomeDetails.rewardIncome = NumberFixed(incomeDetails.rewardIncome, income);
//         incomeDetails.totalIncome = NumberFixed(incomeDetails.totalIncome, income);
//         incomeDetails.currentIncome = NumberFixed(incomeDetails.currentIncome, income);

//         // ✅ Commission record create
//         const id = generateCustomId({ prefix: "TVF-RLT" });
//         const newRoyalty = new CommissionModel({
//           income,
//           user: currentUser._id,
//           id,
//           type: "Royalty",
//           status: "earned",
//           teamPackage: packageAmount, // 👈 save package
//           teamUsers: slab.team // 👈 save team size
//         });

//         await newRoyalty.save();
//         await incomeDetails.save();

//         console.log(
//           `Reward achieved: Team ${slab.team}, Package ${packageAmount}, User ${currentUser.username}`
//         );
//       }
//     }
//   } catch (error) {
//     console.error("Error in royalty income calculation:", error.message);
//   }
// };




// ======================
// 🚀 Cron Job (daily midnight)
// ======================
const cron = require("node-cron");

let isProcessing = false;
const royaltyCron = async () => {
    if (isProcessing) return;
    isProcessing = true;
    try {
        const users = await UserModel.find({ 'active.isActive': true, 'active.isBlocked': false, 'active.isVerified': true }, { username: 1 }
        );
        for (const user of users) {
            await royaltyIncomeCalculate({ userId: user._id });
        }
    } catch (error) {
        console.error("Error in royaltyCron:", error.message);
    } finally {
        isProcessing = false;
    }
};

// ✅ Roz raat 12:10 AM baje chalega
cron.schedule('10 0 * * *', royaltyCron);
// setTimeout(royaltyCron,5000)

module.exports = { royaltyIncomeCalculate, royaltyCron };
