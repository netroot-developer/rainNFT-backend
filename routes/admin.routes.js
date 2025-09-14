const router = require("express").Router()
const AdminController = require("../controllers/admin.controller");
const TransactionController = require('../controllers/transaction.controller');
const { isAdminLoggedIn } = require("../middleware/authenticate.middleware");

router.post('/login', AdminController.AdminLogin);
router.post('/create', AdminController.AdminCreate);
router.put('/update/:id', isAdminLoggedIn, AdminController.AdminUpdate);
router.delete('/delete/:id', isAdminLoggedIn, AdminController.AdminDelete);
router.get('/get-profile', isAdminLoggedIn, AdminController.AdminProfile);
router.put('/password-change', isAdminLoggedIn, AdminController.ChangePassword);
router.post('/logout', isAdminLoggedIn, AdminController.AdminLogout);
router.get('/user-block/:id', isAdminLoggedIn, AdminController.getUserBlock);
router.post('/update-user/:id', AdminController.UserProfileUpdate);
router.get('/login-access/:id', isAdminLoggedIn, AdminController.loginAdminAccessUser);

// PACKAGE PACKAGE BUY -----------
router.post('/fund-add', TransactionController.packagePurchaseRequest);
router.post('/fund-approved', TransactionController.packagePurchaseApproved);

// BOOSTING PACKAGE BUY -----------
router.post('/booster-purchase', TransactionController.boosterInvestment);

// REPORTS
router.get('/get-income-summary', AdminController.getIncomeSummary);
router.get('/all-users', AdminController.getAllPartners);
router.get('/get-user/:id', isAdminLoggedIn, AdminController.getUser);
router.get('/getAllInvestedUsers', isAdminLoggedIn, AdminController.getInvestmentReports);
router.get('/investment-history', isAdminLoggedIn, AdminController.getInvestmentReports);
router.get('/get-purchased-miners', AdminController.getPackageInvestmentReports);
router.get('/get-referralincome-reports', AdminController.getReferralIncomes);
router.get('/getAllLevelIncome-history', AdminController.getLevelIncomes);

router.get('/get-withdrawalincome-history', AdminController.getWithdrawalIncomes);

// ------ -------- WITHDRAWAL -----------------------
router.get('/withdrawal-history', isAdminLoggedIn, AdminController.getWithdrawReports);

// -----------------ROYALTY -----------------------------
router.get('/get-royalty-invest-all-history', AdminController.getRoyaltyInvestment);


// ---------- BOOSTER START ------------------
router.post('/booster-purchase', isAdminLoggedIn, TransactionController.boosterInvestment);
router.get('/booster-all-purchase-history', isAdminLoggedIn, TransactionController.boosterInvestAllHsitory);
// ---------- BOOSTER END ------------------

// income history -----
router.get('/get-level-income-history', isAdminLoggedIn, AdminController.getLevelIncomes);
router.get('/get-reward-income-history', isAdminLoggedIn, AdminController.getRewardIncomes);
router.get('/get-trading-income-history', isAdminLoggedIn, AdminController.getTradingIncomes);
router.get('/get-nonworking-income-history', isAdminLoggedIn, AdminController.getNonWorkingIncomes);
router.get('/referral-history', isAdminLoggedIn, AdminController.getReferralIncomes);
router.get('/get-booster-income-history', isAdminLoggedIn, AdminController.getBoostingIncomes);
router.get('/get-withdrawal-income-history', isAdminLoggedIn, AdminController.getWithdrawalIncomes);

// boostingIds generate automatic --
router.get('/get-boosting-ids-history', AdminController.getBoostingIds);

// rebirthIds generate automatic --
router.get('/get-rebirth-ids-history', AdminController.getRebirthIds);



module.exports = router