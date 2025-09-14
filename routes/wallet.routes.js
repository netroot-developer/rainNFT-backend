const router = require('express').Router();
const WalletController = require('../controllers/wallet.controller');
const { isLoggedIn } = require('../middleware/authenticate.middleware');

// --------------------- WALLET SIGN IN AND SIGN UP START ---------------------------
router.post('/register',WalletController.walletCreate);
router.post("/verify-otp", WalletController.verifyOtp);
router.post('/login',WalletController.loginUser);
router.get('/forgot-password/:userId',WalletController.forgotPasswordSendOtp);
router.post('/forgot-otp-verify',WalletController.forgotOtpVerify);
router.post('/password-change',isLoggedIn,WalletController.passwordChange);

// --------------------- WALLET SIGN IN AND SIGN UP END ---------------------------

module.exports = router