const mongoose = require("mongoose");
const { LevelIncome } = require("../models/levelIncome.model")
const { ReferralModel } = require("../models/referral.model")
const { TransactionModel } = require("../models/transaction.model");
const { UserModel } = require("../models/user.model");
const { PackageInvestment, PackageModel } = require("../models/package.model");
const { getDownlineTree, getGroupDownline, getDownlineArray, getDownlineArrayRoyalty } = require("../utils/getteams.downline");
const { RoyaltyModel } = require("../models/royalty.model");
const { RebirthIdModel } = require("../models/rebirthId.model");
const { CommissionModel } = require("../models/commission.model");
const { BoostingIdModel } = require("../models/boostingId.model");
const { BoosterInvestModel } = require("../models/booster.model");
const { ControllerModel } = require("../models/controller.model");


exports.getUser = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id, { token: 0, package: 0, otpDetails: 0 }).populate([{ path: 'sponsor', select: 'username' }, { path: "income", select: '-user -updatedAt -createdAt' }]);
    if (!user) return res.status(500).json({ success: false, message: "User not found." });
    const controller = await ControllerModel.findOne({}, { "walletDetails.address": 1 })
    res.status(200).json({ success: true, data: { ...user?._doc, adminWalletAddress: controller?.walletDetails?.address }, message: "Get Profile successfully." })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}



exports.ProfilePictureUpdate = async (req, res) => {
  try {
    const { picture } = req.body
    const user = await UserModel.findById(req.user._id);
    if (!user) return res.status(500).json({ success: false, message: "User not found." });
    if (user.picture != picture) {
      user.picture = await uploadToImageKit(picture, 'Natives');
      await user.save();
    }
    res.status(200).json({ success: true, message: "Profile Picture update successfully." })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getDirectPartners = async (req, res) => {
  try {
    const partners = await UserModel.find({ sponsor: req.user._id }, { account: 1, username: 1, investment: 1, createdAt: 1, active: 1, id: 1, referralLink: 1, incom: 1 }).populate([{ path: "account", select: '-_id walletAddress type' }, { path: "income", select: 'totalIncome currentIncome' }]).sort({ createdAt: -1 })
    res.status(200).json({ success: true, data: partners, message: "Get Partners successfully." })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
exports.getLevelIncomes = async (req, res) => {
  try {
    const history = await LevelIncome.find({ user: req.user._id }).populate({ path: 'user fromUser', select: "-_id username account", populate: { path: "account", select: "-_id walletAddress" } }).sort({ createtAt: -1 })
    const totalIncome = history.reduce((sum, investment) => sum + investment.income, 0);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayLevelIncome = history.filter(investment => investment.createdAt >= startOfToday);
    const todayTotal = todayLevelIncome.reduce((sum, investment) => sum + investment.income, 0);
    res.status(200).json({ success: true, message: "Level Incomes Reports", data: { history, totalIncome, todayTotal } })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
exports.getReferralIncomes = async (req, res) => {
  try {
    const history = await ReferralModel.find({ user: req.user._id }).populate({ path: "package", select: 'title amount' }).populate({ path: 'user fromUser', select: "-_id username account", populate: { path: "account", select: "-_id walletAddress" } }).sort({ createdAt: -1 })
    const totalIncome = history.reduce((sum, investment) => sum + investment.income, 0);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayReferralIncome = history.filter(investment => investment.createdAt >= startOfToday);
    const todayTotal = todayReferralIncome.reduce((sum, investment) => sum + investment.income, 0);
    res.status(200).json({ success: true, message: "Referral Incomes Reports", data: { history, totalIncome, todayTotal } })
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message })
  }
}


exports.getPackageInvestmentReports = async (req, res) => {
  try {
    const history = await TransactionModel.find({ user: req.user._id }).populate({ path: "package", select: 'title amount' }).sort({ createdAt: -1 })
    const totalIncome = history.reduce((sum, investment) => sum + investment.investment, 0);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayInvestments = history.filter(investment => investment.createdAt >= startOfToday);
    const todayTotal = todayInvestments.reduce((sum, investment) => sum + investment.investment, 0);
    res.status(200).json({ success: true, message: "Package Investment Reports", data: { history, totalIncome, todayTotal } })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
};
exports.getPackageActivatedReports = async (req, res) => {
  try {
    const history = await PackageInvestment.find({ user: req.user._id, active: true }, { oldPackageInvestment: 0, upgrade: 0, user: 0 }).populate({ path: "package", select: '-users -referralPercentage -picture -tags -dailyPercentage -createdAt -updatedAt -status' }).sort({ investment: 1 })
    const totalInvestment = history.reduce((sum, investment) => sum + investment.investment, 0);
    const totalIncome = history.reduce((sum, investment) => sum + investment.income, 0);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayInvestments = history.filter(investment => investment.createdAt >= startOfToday);
    const todayTotalInvestment = todayInvestments.reduce((sum, investment) => sum + investment.investment, 0);

    const todayIncome = history.filter(investment => investment.createdAt >= startOfToday);
    const todayTotalIncome = todayIncome.reduce((sum, investment) => sum + investment.income, 0);

    res.status(200).json({ success: true, message: "Package Investment Reports", data: { history, totalInvestment, todayTotalInvestment, totalIncome, todayTotalIncome } })
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: error.message })
  }
};
exports.getInvestmentReports = async (req, res) => {
  try {
    // Get all deposit history (all statuses)
    const history = await TransactionModel.find(
      { user: req.user._id, type: "Deposit" }
    ).sort({ createdAt: -1 });

    // Filter only Processing & Completed for calculations
    const validHistory = history.filter(
      txn => ["Processing", "Completed"].includes(txn.status)
    );

    // Total investments (Processing + Completed only)
    const totalIncome = validHistory.reduce((total, txn) => total + txn.investment, 0);

    // Start of today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Today's investments (Processing + Completed only)
    const todayInvestments = validHistory.filter(txn => txn.createdAt >= startOfToday);
    const todayTotal = todayInvestments.reduce((sum, txn) => sum + txn.investment, 0);

    res.status(200).json({
      success: true,
      message: "Wallet Recharge Investment Reports",
      data: {
        history,        // sabhi status ka history
        totalIncome,    // sirf Processing + Completed
        todayTotal      // sirf Processing + Completed
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllTransactionReports = async (req, res) => {
  try {
    const { type } = req.query; // optional filter
    const match = { user: new mongoose.Types.ObjectId(req.user._id) };

    // --- filter by type if provided ---
    if (type && type !== "All") {
      match.type = type; // e.g. Deposit, packageInvest, rebirth
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // --- history pipeline (sabhi status aayenge) ---
    const history = await TransactionModel.aggregate([
      { $match: match },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "packages",
          localField: "package",
          foreignField: "_id",
          as: "package"
        }
      },
      { $unwind: { path: "$package", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "rebirthids",
          localField: "rebirth",
          foreignField: "_id",
          as: "rebirth"
        }
      },
      { $unwind: { path: "$rebirth", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          type: 1,
          status: 1,
          createdAt: 1,
          investment: 1,
          income: 1,
          user: {
            _id: "$user._id",
            username: "$user.username",
            email: "$user.email",
            mobile: "$user.mobile",
            account: "$user.account"
          },
          packageInvest: {
            $cond: [
              { $eq: ["$type", "packageInvest"] },
              { id: "$package._id", amount: "$package.amount" },
              "$$REMOVE"
            ]
          },
          rebirth: {
            $cond: [
              { $eq: ["$type", "rebirth"] },
              { id: "$rebirth._id", income: "$rebirth.income" },
              "$$REMOVE"
            ]
          }
        }
      }
    ]);

    // --- totals pipeline (sirf Processing & Completed) ---
    const totals = await TransactionModel.aggregate([
      {
        $match: {
          ...match,
          status: { $in: ["Processing", "Completed"] }
        }
      },
      {
        $facet: {
          totalIncome: [
            { $group: { _id: null, sum: { $sum: "$investment" } } }
          ],
          todayTotal: [
            {
              $match: { createdAt: { $gte: startOfToday, $lte: endOfToday } }
            },
            { $group: { _id: null, sum: { $sum: "$investment" } } }
          ]
        }
      }
    ]);

    const totalIncome = totals[0]?.totalIncome[0]?.sum || 0;
    const todayTotal = totals[0]?.todayTotal[0]?.sum || 0;

    res.status(200).json({
      success: true,
      message: "Transaction Reports",
      data: { history, totalIncome, todayTotal }
    });
  } catch (error) {
    console.error("Error fetching transaction reports:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};



exports.getWithdrawalReports = async (req, res) => {
  try {
    // Get all withdrawal history (all statuses)
    const history = await TransactionModel.find(
      { user: req.user._id, type: "Withdrawal" }
    ).sort({ createdAt: -1 });
    const validHistory = history.filter(
      txn => ["Processing", "Completed"].includes(txn.status)
    );
    const totalIncome = validHistory.reduce((total, txn) => total + txn.investment, 0);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayInvestments = validHistory.filter(txn => txn.createdAt >= startOfToday);
    const todayTotal = todayInvestments.reduce((sum, txn) => sum + txn.investment, 0);

    res.status(200).json({
      success: true,
      message: "Withdrawal History",
      data: {
        history,        // sabhi status ka history
        totalIncome,    // sirf Processing + Completed
        todayTotal      // sirf Processing + Completed
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.getIncomeSummary = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const user = await UserModel.findById(userId).populate({ path: "income", select: "totalIncome currentIncome" });
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    const incomeSources = {
      direct: { model: CommissionModel, field: "income", match: { type: "Direct" } },
      level: { model: CommissionModel, field: "income", match: { type: { $in: ["Level"] } } },
      reward: { model: CommissionModel, field: "income", match: { type: { $in: ["Reward"] } } },
      trading: { model: CommissionModel, field: "income", match: { type: "Trading" } },
      // nonWorking: { model: CommissionModel, field: "income", match: { type: { $in: ["Non-Working"] } } },
      transaction: { model: TransactionModel, field: "investment", match: { type: "Deposit", status: "Completed" } },
      withdraw: { model: TransactionModel, field: "investment", match: { type: "Withdrawal", status: "Completed" } },
    };
    const results = {};

    const promises = [];

    for (const key in incomeSources) {
      const { model, field, match = {} } = incomeSources[key];
      const baseMatch = { user: user._id, ...match };
      promises.push(model.aggregate([{ $match: baseMatch }, { $group: { _id: null, total: { $sum: `$${field}` } } }]));
      promises.push(
        model.aggregate([
          { $match: { ...baseMatch, createdAt: { $gte: todayStart, $lte: todayEnd } } },
          { $group: { _id: null, total: { $sum: `$${field}` } } },
        ])
      );
    }

    const allResults = await Promise.all(promises);

    Object.keys(incomeSources).forEach((key, i) => {
      const total = allResults[i * 2]?.[0]?.total || 0;
      const today = allResults[i * 2 + 1]?.[0]?.total || 0;
      results[`total${capitalize(key)}`] = total;
      results[`today${capitalize(key)}`] = today;
    });
    let totalIncome = user?.income?.totalIncome || 0;
    let walletBalance = user?.income?.currentIncome || 0;

    // Calculate totalDirectUsers
    const totalDirectUsers = await UserModel.countDocuments({ sponsor: user._id });

    // Calculate totalDownlineUsers using graphLookup
    const downlineUsers = await UserModel.aggregate([
      { $match: { _id: user._id } },
      {
        $graphLookup: {
          from: "users",
          startWith: "$_id",
          connectFromField: "_id",
          connectToField: "sponsor",
          as: "downline",
        }
      },
      {
        $project: {
          totalDownlineUsers: { $size: "$downline" },
          totalTeamInvestment: { $sum: "$downline.investment" } // 👈 add sum of investments
        }
      }
    ]);
    const totalDownlineUsers = downlineUsers[0]?.totalDownlineUsers || 0;
    const totalTeamInvestment = downlineUsers[0]?.totalTeamInvestment || 0;
    const todayRoiReport = await CommissionModel.findOne({ user: user._id, type: "Trading" }, { income: 1, percentage: 1, amount: 1, type: 1 }).sort({ createdAt: -1 })
    return res.status(200).json({ success: true, message: "Get User Income Summary", data: { ...results, totalIncome, walletBalance, totalDirectUsers, totalDownlineUsers,totalTeamInvestment, todayRoiReport } });
  } catch (error) {
    console.error("Get Income Summary Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
// ---------------- Controller -----------------
exports.getFilterHistory = async (req, res) => {
  try {
    let { type, packageId, rebirthId, startDate, endDate } = req.query;
    let match = { user: new mongoose.Types.ObjectId(req.user._id) };
    if (type) match.type = type;
    if (packageId) match.package = new mongoose.Types.ObjectId(packageId);
    if (rebirthId) match.rebirth = new mongoose.Types.ObjectId(rebirthId);
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) {
        const sDate = new Date(startDate);
        sDate.setHours(0, 0, 0, 0);
        match.createdAt.$gte = sDate;
      }
      if (endDate) {
        const eDate = new Date(endDate);
        eDate.setHours(23, 59, 59, 999);
        match.createdAt.$lte = eDate;
      }
    }

    const commissions = await CommissionModel.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "users",
          localField: "fromUser",
          foreignField: "_id",
          as: "fromUser"
        }
      },
      { $unwind: { path: "$fromUser", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "packages",
          localField: "package",
          foreignField: "_id",
          as: "package"
        }
      },
      { $unwind: { path: "$package", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "rebirthids",
          localField: "rebirth",
          foreignField: "_id",
          as: "rebirth"
        }
      },
      { $unwind: { path: "$rebirth", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          id: 1,
          type: 1,
          income: 1,
          amount: 1,
          level: 1,
          percentage: 1,
          status: 1,
          createdAt: 1,
          "user._id": 1,
          "user.username": 1,
          "user.email": 1,
          "fromUser._id": 1,
          "fromUser.username": 1,
          "fromUser.email": 1,
          "package._id": 1,
          "package.title": 1,
          "package.amount": 1,
          "rebirth._id": 1,
          "rebirth.income": 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]);
    return res.status(200).json({ success: true, message: "Commission history fetched successfully.", data: commissions });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getRebirthIds = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    const match = { user: new mongoose.Types.ObjectId(req.user._id) };
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) {
        const sDate = new Date(startDate);
        sDate.setHours(0, 0, 0, 0);
        match.createdAt.$gte = sDate;
      }
      if (endDate) {
        const eDate = new Date(endDate);
        eDate.setHours(23, 59, 59, 999);
        match.createdAt.$lte = eDate;
      }
    }
    if (type) match.type = type; // "USER", "Rebirth", "Auto Rebirth"

    const rebirthIds = await RebirthIdModel.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },

      {
        $project: {
          _id: 1,
          id: 1,
          investment: 1,
          count: 1,
          income: 1,
          type: 1,
          active: 1,
          createdAt: 1,
          "user._id": 1,
          "user.username": 1,
          "user.email": 1,
          "user.account": 1,
          package: 1
        }
      },
      {
        $lookup: {
          from: "packages",
          localField: "package",
          foreignField: "_id",
          as: "package"
        }
      },
      { $unwind: { path: "$package", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          investment: 1,
          count: 1,
          income: 1,
          type: 1,
          active: 1,
          createdAt: 1,
          "user._id": 1,
          "user.username": 1,
          "user.email": 1,
          "user.account": 1,
          "package._id": 1,
          "package.title": 1,
          "package.amount": 1
        }
      }
    ]);

    return res.status(200).json({ success: true, message: "Rebirth IDs fetched successfully.", data: rebirthIds });
  } catch (error) {
    console.error("Error fetching rebirth IDs:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getBoostingIds = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    const match = { user: new mongoose.Types.ObjectId(req.user._id) };
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) {
        const sDate = new Date(startDate);
        sDate.setHours(0, 0, 0, 0);
        match.createdAt.$gte = sDate;
      }
      if (endDate) {
        const eDate = new Date(endDate);
        eDate.setHours(23, 59, 59, 999);
        match.createdAt.$lte = eDate;
      }
    }
    if (type) match.type = type; // "USER", "Rebirth", "Auto Rebirth"

    const boostingIds = await BoostingIdModel.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },

      {
        $project: {
          _id: 1,
          id: 1,
          investment: 1,
          count: 1,
          income: 1,
          type: 1,
          active: 1,
          createdAt: 1,
          "user._id": 1,
          "user.username": 1,
          "user.email": 1,
          "user.account": 1,
          boosting: 1
        }
      },
      {
        $lookup: {
          from: "boosters",
          localField: "boosting",
          foreignField: "_id",
          as: "boosting"
        }
      },
      { $unwind: { path: "$boosting", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          id: 1,
          investment: 1,
          count: 1,
          income: 1,
          type: 1,
          active: 1,
          createdAt: 1,
          "user._id": 1,
          "user.username": 1,
          "user.email": 1,
          "user.account": 1,
          "boosting._id": 1,
          "boosting.title": 1,
          "boosting.amount": 1,
          "boosting.usersLength": 1
        }
      }
    ]);

    return res.status(200).json({ success: true, message: "Rebirth IDs fetched successfully.", data: boostingIds });
  } catch (error) {
    console.error("Error fetching rebirth IDs:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getDownlineTree = async (req, res) => {
  try {
    const history = await getDownlineTree(req.body.useId)
    return res.status(200).json({ success: true, message: "Get Downline", data: history })
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
}

exports.getGroupDownlineTree = async (req, res) => {
  try {
    let { group = "All", currentLevel = 1, team = "All" } = req.query;

    group = group.toUpperCase();
    team = team.toUpperCase();
    console.log({ group, currentLevel, team });

    const groupMap = { A: "group1", B: "group2", C: "group3", ALL: "all" };

    const teamMap = { A: [1], B: [2], C: [3], "B C": [2, 3], ALL: [1, 2, 3] };

    const selectedGroup = groupMap[group] || "all";
    const selectedTeamNumbers = teamMap[team] || [1];
    const parsedLevel = parseInt(currentLevel) || 1;

    let downlineUsers = [];

    for (const teamNum of selectedTeamNumbers) {
      const result = await getGroupDownline({
        userId: req.user._id,
        groupName: selectedGroup,
        currentLevel: parsedLevel,
        teamName: teamNum
      });

      // Flatten result to single array
      for (const groupKey in result) {
        for (const teamKey in result[groupKey]) {
          downlineUsers.push(...result[groupKey][teamKey]);
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Downline fetched successfully",
      length: downlineUsers.length,
      data: downlineUsers
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


exports.getRoyaltyLeaderboard = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id, { _id: 1, username: 1, investment: 1 });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const royaltySlabs = await RoyaltyModel.find({ status: true }).sort({ teamUsers: 1 });
    const highestPackage = await PackageModel.findOne({ users: user._id }).sort({ amount: -1 }).lean();
    const leaderboardData = await Promise.all(
      royaltySlabs.map(async (slab) => {
        const { directCount, downlineWithPackage, downlineCount } = await getDownlineArrayRoyalty(user._id, slab.teamPackage);
        const eligibleDirect = directCount >= slab.directUsers;
        const eligibleTeamCount = downlineCount >= slab.teamUsers;
        const eligibleSelfPackage = highestPackage ? highestPackage.amount >= slab.selfPackage : false

        const totalTeamPackage = downlineWithPackage.reduce((sum, d) => sum + (d.packageAmount || 0), 0);
        const requiredTeamPackage = slab.teamUsers * slab.teamPackage;
        const achieveTeamPackage = totalTeamPackage;
        const eligibleTeamPackage = achieveTeamPackage >= requiredTeamPackage;
        const achieved = eligibleDirect && eligibleTeamCount && eligibleTeamPackage && eligibleSelfPackage;
        return {
          title: slab.title,
          rewardIncome: slab.income,
          directUsers: `${directCount}/${slab.directUsers}`,
          teamUsers: `${downlineCount}/${slab.teamUsers}`,
          selfPackage: `$${highestPackage ? highestPackage.amount : 0}/$${slab.selfPackage}`,
          teamPackage: `($${slab.teamPackage} * ${downlineWithPackage.length})=$${achieveTeamPackage}/($${slab.teamPackage} * ${slab.teamUsers})=$${requiredTeamPackage}`,
          status: achieved ? 'Achieved' : 'Waiting'
        };
      })
    );

    return res.json({ success: true, message: 'Royalty leaderboard fetched successfully', data: leaderboardData, });
  } catch (error) {
    console.error('Royalty leaderboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}


exports.getDownlineLists = async (req, res) => {
  try {
    const { downline } = await getDownlineArray(req.user._id);
    return res.status(200).json({ success: true, message: 'get Downline list show successfully', data: downline });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}