var express = require('express');
var router = express.Router();

const userRouter = require('./user.routes');
const walletRouter = require('./wallet.routes');
const adminRouter = require('./admin.routes');
const packageRouter = require('./package.routes');
const royaltyRouter = require('./royalty.routes');
const bannerRouter = require('./banner.routes');
const supportRouter = require('./support.routes');
const boosterRoutes = require("./booster.routes");
// const twoFaRouter = require('./2fa.routes');
const withdrawRouter = require('./withdraw.routes');

router.use('/user',userRouter);
router.use('/user/wallet',walletRouter);
// router.use('/user/2fa',twoFaRouter);
router.use('/user',withdrawRouter);
router.use('/admin',withdrawRouter);

// ADMIN
router.use('/admin',adminRouter);
router.use('/admin/controller',require("./controller.routes"));

// PACKAGE CREATE
router.use('/admin/package',packageRouter);
router.use('/user/package',packageRouter);

// ROYALTY CREATE
router.use('/admin/royalty',royaltyRouter);
router.use('/user/royalty',royaltyRouter);


// BANNER CREATE
router.use('/admin/banner',bannerRouter);
router.use('/user/banner',bannerRouter);

// SUPPORTS
router.use('/admin',supportRouter);
router.use('/user',supportRouter);

// booster
router.use("/admin/booster", boosterRoutes);
router.use("/user/booster", boosterRoutes);

module.exports = router;
