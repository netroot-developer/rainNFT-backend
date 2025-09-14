const router = require("express").Router();
const TransactionController = require('../controllers/transaction.controller');
const UserController = require('../controllers/user.controller');
const { isLoggedIn } = require("../middleware/authenticate.middleware");
const { getDownlineData, calculateLevelMultiArrayDownline } = require("../utils/getteams.downline");

router.post('/add-fund', isLoggedIn, TransactionController.packagePurchaseRequest);
router.get('/get-profile', isLoggedIn, UserController.getUser);

// ------------  ALL INCOMES SUMMARY START ----------------
router.get('/get-income-summary', isLoggedIn, UserController.getIncomeSummary);

router.get('/get-filter-history', isLoggedIn, UserController.getFilterHistory);

// rebirth ids generate automatic
router.get('/get-rebirth-history', isLoggedIn, UserController.getRebirthIds);

// boosting ids generate automatic
router.get('/get-boosting-ids-history', isLoggedIn, UserController.getBoostingIds);
// ------------  ALL INCOMES SUMMARY END ----------------

// ------------  ALL INCOMES SUMMARY END ----------------
router.get('/get-direct-users', isLoggedIn, UserController.getDirectPartners);
router.get('/get-investment-reports', isLoggedIn, UserController.getInvestmentReports);
router.get('/withdrawal-history', isLoggedIn, UserController.getWithdrawalReports);
router.get('/get-purchased-packages', isLoggedIn, UserController.getPackageInvestmentReports);
router.get('/get-activated-packages', isLoggedIn, UserController.getPackageActivatedReports);
router.get('/get-transaction-history', isLoggedIn, UserController.getAllTransactionReports);

// ------------  FOUR TYPE INCOMES START ----------------
router.get('/get-level-income-history', isLoggedIn, UserController.getLevelIncomes);
router.get('/get-refer-income-history', isLoggedIn, UserController.getReferralIncomes);
// ------------  FOUR TYPE INCOMES END ----------------

// /api/user/get-monthlyincome-reports --> GET -> USER SIDE
// /api/admin/get-monthly-income-history --> GET -> ADMIN SIDE

// ---------- BOOSTER START ------------------
router.post('/booster-purchase', isLoggedIn, TransactionController.boosterInvestment);
router.get('/booster-purchase-history', isLoggedIn, TransactionController.boosterInvestHsitory);
// ---------- BOOSTER END ------------------

// ------------ DOWNLINE TREE VIEW START ----------------
router.get('/get-downline-tree', isLoggedIn, UserController.getDownlineTree);
router.get('/get-group-users', isLoggedIn, UserController.getGroupDownlineTree);
// ------------ DOWNLINE TREE VIEW END ----------------

router.post('/downline',async (req,res)=>{
    try {
        const {userId,packageAmount} = req.body;
        // const downline = await getDownlineArray(userId);
        // const {downlineWithPackage} = await getDownlineArrayRoyalty(userId,packageAmount);
        // const ids = await getDownlinePackageUsers(downline.ids,packageAmount)
        // const downline = await getDirectPartnersDownlines({userId});
        const downline = await getDownlineData({userId});
        // const downline = await getDownlineArray(userId);
        res.status(200).json({success:true,data:downline.tree,message:"Get Downline"})
    } catch (error) {
        res.status(500).json({success:false,message:error.message})
    }
})


router.get('/get-royalty-leaderboard', isLoggedIn,UserController.getRoyaltyLeaderboard);
router.get('/get-level-wise-team', isLoggedIn,UserController.getDownlineLists);



// api/user/get-level-tree --> GET --> USER SIDE
// api/user/get-downline-list --> GET --> USER SIDE
router.get('/get-level-tree',isLoggedIn, async (req, res) => {
    try {
        const {tree} = await getDownlineData({userId:req.user._id});
        res.status(200).json({ success: true, data: tree,message:"Get level Tree" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
router.get('/get-team-a-list',isLoggedIn, async (req, res) => {
    try {
        const { teamA } = await calculateLevelMultiArrayDownline(req.user._id);
        res.status(200).json({ success: true, data: teamA,message:"Get teamA Downline list" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/get-team-b-list',isLoggedIn, async (req, res) => {
    try {
        const { teamB } = await calculateLevelMultiArrayDownline(req.user._id);
        res.status(200).json({ success: true, data: teamB,message:"Get teamB Downline list" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/get-team-c-list',isLoggedIn, async (req, res) => {
    try {
        const { teamC } = await calculateLevelMultiArrayDownline(req.user._id);
        res.status(200).json({ success: true, data: teamC,message:"Get teamC Downline list" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});




module.exports = router