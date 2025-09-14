const { AdminModel } = require("../models/admin.model");
const { PackageModel, PackageInvestment } = require("../models/package.model");
const { TransactionModel } = require("../models/transaction.model");
const { UserModel } = require("../models/user.model");
const { generateCustomId } = require("../utils/generator.uniqueid");
const { getToken } = require("../utils/token.generator");

const { SrPassword } = require("../utils/password.encrypt");
const { CommissionModel } = require("../models/commission.model");
const { RoyaltyInvestment } = require("../models/royalty.model");
const { BoostingIdModel } = require("../models/boostingId.model");
const { RebirthIdModel } = require("../models/rebirthId.model");
const { ControllerModel } = require("../models/controller.model");
const { isAddress } = require("ethers");

const srPassword = new SrPassword()


exports.AdminProfile = async (req, res) => {
  try {
    const user = await AdminModel.findById(req.admin._id);
    const controller = await ControllerModel.findOne({},{_id:0,updatedAt:0,createdAt:0});
    return res.status(201).json({ success: true, message: "Admin Dashboard", data: {...user._doc, ...controller._doc}, role: user.role, token: user.token });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

exports.AdminLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: "Email and password are required." });
  try {
    const admin = await AdminModel.findOne({ email });
    if (!admin) return res.status(400).json({ success: false, message: "Invalid email or password." });

    const isMatch = srPassword.compare(admin.password, password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid email or password." });
    const token = await getToken(admin);
    admin.token = token;
    await admin.save();
    res.cookie('sgt.sid', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
    return res.status(200).json({ success: true, message: "Logged in successfully.", data:{user: admin,id:admin._id, role: 'Admin', token} });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
exports.loginAdminAccessUser = async (req, res) => {
    try {
      if(!req.params.id) return res.status(500).json({success:false,message:"ID is required."})
        let user = await UserModel.findById(req.params.id,{username:1,id:1,active:1,email:1,role:1,token:1});
        if (!user) return res.status(500).json({ success: false, message: "User not exist." })
        if (user.active.isBlocked) return res.status(500).json({ success: false, message: "Your account has been blocked." })
        const token = await getToken(user);
        user.token.token = token;
        await user.save();
        res.cookie('sgt.sid', token, { httpOnly: true, secure: true, sameSite: 'Strict', path: '/', maxAge: 7 * 24 * 60 * 60 * 1000 });
        return res.status(200).json({ success: true, message: "Login successfully.", data: { user, token, id: user._id, role: user.role } });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

exports.ChangePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) return res.status(400).json({ success: false, message: 'Both old and new passwords are required.' });
  try {
    const user = await AdminModel.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'Admin not found' });
    const isMatch = srPassword.compare(user.password, oldPassword);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Old password is incorrect' });
    const hashPassword = srPassword.hash(newPassword)
    user.password = hashPassword;
    await user.save();
    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}
exports.AdminLogout = async (req, res) => {
  try {
    const admin = await AdminModel.findById(req.admin._id);
    if (admin) {
      admin.token = null;
      admin.tokenBlock.push(req.cookies.wallet_coin_admin);
      await admin.save();
    }
    res.clearCookie('wallet_coin_admin', { httpOnly: true, secure: true });
    return res.status(200).json({ success: true, message: 'Admin Logout successful' });
  } catch (error) {

    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
}
exports.AdminCreate = async (req, res) => {
  try {
    const { email, mobile, password, role } = req.body;
    if (!email || !mobile || !password || !role) return res.status(500).json({ success: false, message: "All field are required." });
    const adminFind = await AdminModel.findOne({ email });
    if (adminFind) return res.status(500).json({ success: false, message: "Admin already exist." });
    const newPassword = srPassword.hash(password);
    const id = generateCustomId({ prefix: "XIO-ADMIN", min: 5, max: 5 })
    const newAdmin = new AdminModel({ id, email, mobile, password: newPassword, role });
    await newAdmin.save();
    return res.status(201).json({ success: true, message: "Admin created successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
exports.AdminUpdate = async (req, res) => {
  try {
    const { email, mobile, password, role } = req.body;
    if(!req.params.id) return res.status(500).json({success:false,message:"ID is required."})
    const adminFind = await AdminModel.findById(req.params.id);
    if (!adminFind) return res.status(500).json({ success: false, message: "Admin not exist." });
    const newPassword = srPassword.hash(password);
    if (password) adminFind.password = newPassword;
    if (email) adminFind.email = email;
    if (mobile) adminFind.mobile = mobile;
    if (role) adminFind.role = role;
    await adminFind.save()
    return res.status(201).json({ success: true, message: "Admin updated successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.UserProfileUpdate = async (req, res) => {
  try {
    const { email, mobile, password,username,account } = req.body;
    if(!req.params.id) return res.status(500).json({success:false,message:"ID is required."})
    const userFind = await UserModel.findById(req.params.id);
    if (!userFind) return res.status(500).json({ success: false, message: "User not exist." });
    if (password) userFind.password = srPassword.hash(password);
    if (username) userFind.username = username;
    if (email) userFind.email = email;
    if (mobile) userFind.mobile = mobile;
    if (account) {
      if(!isAddress(account)) return res.status(500).json({success:false,message:"Invalid wallet address."})
      userFind.account = account;
    }
    await userFind.save()
    return res.status(201).json({ success: true, message: "User profile updated successfully." });
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: error.message })
  }
}


exports.AdminDelete = async (req, res) => {
  try {
    const adminFind = await AdminModel.findByIdAndDelete(req.params.id);
    if (!adminFind) return res.status(500).json({ success: false, message: "Admin already exist." });
    return res.status(201).json({ success: true, message: "Admin deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
exports.getAllPartners = async (req, res) => {
  try {
    const history = await UserModel.aggregate([
      // sponsor populate
      {
        $lookup: {
          from: "users",
          localField: "sponsor",
          foreignField: "_id",
          as: "sponsor"
        }
      },
      { $unwind: { path: "$sponsor", preserveNullAndEmptyArrays: true } },

      // direct partners lookup
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "sponsor",
          as: "directPartners"
        }
      },
      {
        $addFields: {
          totalDirectUsers: { $size: "$directPartners" }
        }
      },

      // total downline users (graphLookup)
      {
        $graphLookup: {
          from: "users",
          startWith: "$_id",
          connectFromField: "_id",
          connectToField: "sponsor",
          as: "downline"
        }
      },
      {
        $addFields: {
          totalDownlineUsers: { $size: "$downline" }
        }
      },

      // income populate
      {
        $lookup: {
          from: "incomedetails",
          localField: "income",
          foreignField: "_id",
          as: "income"
        }
      },
      { $unwind: { path: "$income", preserveNullAndEmptyArrays: true } },

      // final projection
      {
        $project: {
          id: 1,
          username: 1,
          account: 1,
          picture: 1,
          mobile: 1,
          email: 1,
          createdAt: 1,
          active: 1,
          referralLink: 1,
          investment: 1,
          totalDirectUsers: 1,
          totalDownlineUsers: 1,
          sponsor: {
            username: "$sponsor.username",
            email: "$sponsor.email",
            mobile: "$sponsor.mobile",
            id: "$sponsor.id",
            account: "$sponsor.account",
            referralLink: "$sponsor.referralLink"
          },
          income: 1
        }
      },

      { $sort: { createdAt: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: history,
      message: "Get All Partners successfully."
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.getUserBlock = async (req, res) => {
  try {
    if (!req.params.id) return res.status(500).json({ success: false, message: "User ID is required." });
    const user = await UserModel.findById(req.params.id);
    if (!user) return res.status(500).json({ success: false, message: "User not found." });
    user.active.isBlocked = !user.active.isBlocked;
    await user.save();
    res.status(200).json({ success: true, message: `User ${user.active.isBlocked ? 'block' : "unblock"}ed successfully.` })
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: error.message })
  }
}
exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) res.status(500).json({ success: true, data: history, message: "ID is required." });
    const history = await UserModel.findById(id).populate({ path: "account" });
    if (!history) res.status(500).json({ success: true, data: history, message: "User not found." });
    res.status(200).json({ success: true, data: history, message: "Get User successfully." })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}




// ----------------- INCOME REPORTS ------------------------------
exports.getLevelIncomes = async (req, res) => {
  try {
    const history = await CommissionModel.find({ type: "Level" }).populate({ path: "user fromUser", select: 'account email id mobile username' })
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
exports.getRewardIncomes = async (req, res) => {
  try {
    const history = await CommissionModel.find({ type: "Reward" }).populate([{ path: "user", select: 'account email id mobile username' }, { path: "reward", select: "title income" }]);
    const totalIncome = history.reduce((sum, investment) => sum + investment.income, 0);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayLevelIncome = history.filter(investment => investment.createdAt >= startOfToday);
    const todayTotal = todayLevelIncome.reduce((sum, investment) => sum + investment.income, 0);
    res.status(200).json({ success: true, message: "Reward Incomes Reports", data: { history, totalIncome, todayTotal } })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getTradingIncomes = async (req, res) => {
  try {
    const history = await CommissionModel.find({ type: "Trading" }).populate([{ path: "user", select: 'account email id mobile username' }]);
    const totalIncome = history.reduce((sum, investment) => sum + investment.income, 0);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayLevelIncome = history.filter(investment => investment.createdAt >= startOfToday);
    const todayTotal = todayLevelIncome.reduce((sum, investment) => sum + investment.income, 0);
    res.status(200).json({ success: true, message: "Trading Incomes Reports", data: { history, totalIncome, todayTotal } })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
exports.getNonWorkingIncomes = async (req, res) => {
  try {
    const history = await CommissionModel.find({ type: { $in: ["Non-Working"] } }).populate([{ path: "user", select: 'account email id mobile username' }]);
    const totalIncome = history.reduce((sum, investment) => sum + investment.income, 0);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayLevelIncome = history.filter(investment => investment.createdAt >= startOfToday);
    const todayTotal = todayLevelIncome.reduce((sum, investment) => sum + investment.income, 0);
    res.status(200).json({ success: true, message: "Royalty Incomes Reports", data: { history, totalIncome, todayTotal } })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
exports.getBoostingIncomes = async (req, res) => {
  try {
    const history = await CommissionModel.find({ type: { $in: ['Boosting'] } }).populate([{ path: "user", select: 'account email id mobile username' }]);
    const totalIncome = history.reduce((sum, investment) => sum + investment.income, 0);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayLevelIncome = history.filter(investment => investment.createdAt >= startOfToday);
    const todayTotal = todayLevelIncome.reduce((sum, investment) => sum + investment.income, 0);
    res.status(200).json({ success: true, message: "Booster Incomes Reports", data: { history, totalIncome, todayTotal } })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
exports.getReferralIncomes = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const history = await CommissionModel.aggregate([
      { $match: { type: "Direct" } },
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
          from: "users",
          localField: "fromUser",
          foreignField: "_id",
          as: "fromUser"
        }
      },
      { $unwind: "$fromUser" },
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
          id: 1,
          income: 1,
          amount: 1,
          percentage: 1,
          createdAt: 1,
          "user.id": 1,
          "user.username": 1,
          "user.email": 1,
          "fromUser.id": 1,
          "fromUser.username": 1,
          "fromUser.email": 1,
          "package.title": 1,
          "package.amount": 1
        }
      },
      {
        $facet: {
          history: [{ $sort: { createdAt: -1 } }],
          totalIncome: [
            { $group: { _id: null, total: { $sum: "$income" } } }
          ],
          todayTotal: [
            { $match: { createdAt: { $gte: startOfToday } } },
            { $group: { _id: null, total: { $sum: "$income" } } }
          ]
        }
      },
      {
        $project: {
          history: 1,
          totalIncome: { $ifNull: [{ $arrayElemAt: ["$totalIncome.total", 0] }, 0] },
          todayTotal: { $ifNull: [{ $arrayElemAt: ["$todayTotal.total", 0] }, 0] }
        }
      }
    ]);

    res.status(200).json({ success: true, message: "Referral Incomes Reports", data: history[0] || { history: [], totalIncome: 0, todayTotal: 0 } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getWithdrawalIncomes = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const history = await CommissionModel.aggregate([
      { $match: { type: "Withdrawal-Income" } },
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
          from: "users",
          localField: "fromUser",
          foreignField: "_id",
          as: "fromUser"
        }
      },
      { $unwind: "$fromUser" },
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
          id: 1,
          income: 1,
          amount: 1,
          percentage: 1,
          createdAt: 1,
          "user.username": 1,
          "fromUser.username": 1
        }
      },
      {
        $facet: {
          history: [{ $sort: { createdAt: -1 } }],
          totalIncome: [
            { $group: { _id: null, total: { $sum: "$income" } } }
          ],
          todayTotal: [
            { $match: { createdAt: { $gte: startOfToday } } },
            { $group: { _id: null, total: { $sum: "$income" } } }
          ]
        }
      },
      {
        $project: {
          history: 1,
          totalIncome: { $ifNull: [{ $arrayElemAt: ["$totalIncome.total", 0] }, 0] },
          todayTotal: { $ifNull: [{ $arrayElemAt: ["$todayTotal.total", 0] }, 0] }
        }
      }
    ]);

    res.status(200).json({ success: true, message: "Referral Incomes Reports", data: history[0] || { history: [], totalIncome: 0, todayTotal: 0 } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



exports.getWithdrawalIncomes = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const history = await CommissionModel.aggregate([
      { $match: { type: "Withdrawal-Income" } },
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
          from: "users",
          localField: "fromUser",
          foreignField: "_id",
          as: "fromUser"
        }
      },
      { $unwind: "$fromUser" },
      {
        $project: {
          _id: 1,
          id: 1,
          amount: 1,
          percentage: 1,
          income: 1,
          createdAt: 1,
          "user.username": 1,
          "fromUser.username": 1
        }
      },
      {
        $facet: {
          history: [{ $sort: { createdAt: -1 } }],
          totalIncome: [
            { $group: { _id: null, total: { $sum: "$income" } } }
          ],
          todayTotal: [
            { $match: { createdAt: { $gte: startOfToday } } },
            { $group: { _id: null, total: { $sum: "$income" } } }
          ]
        }
      },
      {
        $project: {
          history: 1,
          totalIncome: { $ifNull: [{ $arrayElemAt: ["$totalIncome.total", 0] }, 0] },
          todayTotal: { $ifNull: [{ $arrayElemAt: ["$todayTotal.total", 0] }, 0] }
        }
      }
    ]);

    res.status(200).json({ success: true, message: "Referral Incomes Reports", data: history[0] || { history: [], totalIncome: 0, todayTotal: 0 } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.getPackageInvestmentReports = async (req, res) => {
  try {
    const history = await PackageInvestment.find({}).populate([{ path: 'user', select: "username email id mobile" }, { path: "package", select: 'title amount' }])
    const total = history.reduce((sum, investment) => sum + investment.investment, 0);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayInvestments = history.filter(investment => investment.createdAt >= startOfToday);
    const todayTotal = todayInvestments.reduce((sum, investment) => sum + investment.investment, 0);
    res.status(200).json({ success: true, message: "Self Incomes", data: { history, total, today: todayTotal } })
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: error.message })
  }
};
exports.getInvestmentReports = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const history = await TransactionModel.aggregate([
      {
        $match: { type: { $in: ["Deposit", "Auto Rebirth"] } }
      },
      {
        $lookup: {
          from: "users", // UserModel ka collection name (db me lowercase plural hota hai)
          localField: "user", // TransactionModel me user field
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 1,
          id: 1,
          hash: 1,
          type: 1,
          status: 1,
          picture: 1,
          investment: 1,
          createdAt: 1,
          "user.id": 1,
          "user.username": 1,
          "user.email": 1,
          "user.mobile": 1,
          "user.account": 1
        }
      },
      {
        $facet: {
          // Full history with populated user
          history: [
            { $sort: { createdAt: -1 } }
          ],

          // Total investment (all time)
          total: [
            {
              $group: {
                _id: null,
                totalInvestment: { $sum: "$investment" }
              }
            }
          ],

          // Today investment
          today: [
            { $match: { createdAt: { $gte: startOfToday } } },
            {
              $group: {
                _id: null,
                todayTotal: { $sum: "$investment" }
              }
            }
          ]
        }
      },
      {
        $project: {
          history: 1,
          total: { $ifNull: [{ $arrayElemAt: ["$total.totalInvestment", 0] }, 0] },
          today: { $ifNull: [{ $arrayElemAt: ["$today.todayTotal", 0] }, 0] }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: "Deposit Reports",
      data: history[0] || { history: [], total: 0, today: 0 }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.getTransactionReports = async (req, res) => {
  try {
    const history = await TransactionModel.find({}).populate({ path: "user", select: 'username id email account' })
    const total = history.reduce((total, investment) => total + investment.investment, 0);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayInvestments = history.filter(txn => txn.createdAt >= startOfToday);
    const todayTotal = todayInvestments.reduce((sum, txn) => sum + txn.investment, 0);
    res.status(200).json({ success: true, message: "Deposit Reports", data: { history, total, today: todayTotal } })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
};

exports.getWithdrawReports = async (req, res) => {
  try {
    const history = await TransactionModel.find({ type: "Withdrawal" }).populate({ path: "user", select: 'username id email account' })
    const total = history.reduce((total, investment) => total + investment.investment, 0);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayInvestments = history.filter(txn => txn.createdAt >= startOfToday);
    const todayTotal = todayInvestments.reduce((sum, txn) => sum + txn.investment, 0);
    res.status(200).json({ success: true, message: "Withdrawal Reports", data: { history, total, today: todayTotal } })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
};

exports.getIncomeSummary = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
    const incomeSources = {
      direct: { model: CommissionModel, field: "income", match: { type: "Direct" } },
      level: { model: CommissionModel, field: "income", match: { type: { $in: ["Level"] } } },
      reward: { model: CommissionModel, field: "income", match: { type: { $in: ["Reward"] } } },
      trading: { model: CommissionModel, field: "income", match: { type: { $in: ["Trading"] } } },
      // nonWorking: { model: CommissionModel, field: "income", match: { type: { $in: ["Non-Working"] } } },
      transaction: { model: TransactionModel, field: "investment", match: { type: "Deposit",status:"Completed" } },
      withdraw: { model: TransactionModel, field: "investment", match: { type: "Withdrawal" ,status:"Completed"} },
    };
    const results = {};
    let totalIncome = 0;
    let todayIncome = 0;

    const promises = [];

    for (const key in incomeSources) {
      const { model, field, match = {} } = incomeSources[key];
      // Total income
      promises.push(
        model.aggregate([
          { $match: match },
          { $group: { _id: null, total: { $sum: `$${field}` } } },
        ])
      );
      // Today's income
      promises.push(
        model.aggregate([
          { $match: { ...match, createdAt: { $gte: todayStart, $lte: todayEnd } } },
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

      if (["direct", "level", 'reward', 'boosting', 'nonWorking'].includes(key)) {
        totalIncome += total;
        todayIncome += today;
      }
    });

    const users = await UserModel.countDocuments();
    const activeUsers = await UserModel.countDocuments({ 'active.isActive': true });
    const inactiveUsers = await UserModel.countDocuments({ 'active.isActive': false });
    const blockedUsers = await UserModel.countDocuments({ 'active.isBlocked': true });
    const packages = await PackageModel.countDocuments();
    return res.status(200).json({ success: true, message: "Income Summary", data: { ...results, totalIncome, users, activeUsers, inactiveUsers, blockedUsers, packages } });
  } catch (error) {
    console.error("Income Summary Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


exports.getRoyaltyInvestment = async (req, res) => {
  try {
    const history = await RoyaltyInvestment.aggregate([
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
          amount: 1,
          createdAt: 1,
          "user.id": "$user._id",
          "user.username": "$user.username",
          "user.account": "$user.account",
          "user.referralLink": "$user.referralLink",
          "package.title": "$package.title",
          "package.amount": "$package.amount"
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    res.status(200).json({ success: true, data: history, message: "Get Royalty Investments successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.getBoostingIds = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    const match = { };
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
    if (type) match.type = type;

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
          totalIncome: 1,
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
          totalIncome: 1,
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


exports.getRebirthIds = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    const match = { };
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
          totalIncome: 1,
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
          id: 1,
          investment: 1,
          count: 1,
          income: 1,
          totalIncome: 1,
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