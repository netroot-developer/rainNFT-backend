const { WalletWithdrawalRequest, WithdrawalAccepted, createInstantWithdrawal, createBoostingInstantWithdrawal, withdrawalRequestSendOtp } = require("../controllers/withdrawal.controller");
const { isAdminLoggedIn, isLoggedIn } = require("../middleware/authenticate.middleware");

const router = require("express").Router();

// WITHDRAWAL MANUAL
// WITHDRAWAL MANUAL
router.post("/withdrawal-otp-request",isLoggedIn,withdrawalRequestSendOtp);
router.post("/withdrawal-request",isLoggedIn,WalletWithdrawalRequest);
router.post("/withdrawal-approved",isAdminLoggedIn,WithdrawalAccepted);

// WITHDRAWAL INSTANT
router.post("/instant-withdrawal",isLoggedIn,createInstantWithdrawal);
router.post("/instant-boosting-withdrawal",isLoggedIn,createBoostingInstantWithdrawal);
module.exports = router;