const router = require('express').Router();
const PackageController = require('../controllers/package.controller');
const { isLoggedIn } = require('../middleware/authenticate.middleware');

router.post('/create',PackageController.PackageCreate);
router.post('/update/:id',PackageController.PackageUpdate);
router.get('/delete/:id',PackageController.PackageDelete);
router.get('/status/:id',PackageController.PackageStatusUpdate);

router.get('/get-all-history',PackageController.PackagesAdminReports);
router.get('/get-all-package-list',isLoggedIn,PackageController.getUserPackages);
router.get('/get-withdrawal-eligible-details',isLoggedIn,PackageController.getUserWithdrawalCheck);
router.get('/get-withdrawal-boosting-eligible-details',isLoggedIn,PackageController.getUserWithdrawalBoostingCheck);
router.get('/get-pkg-activation/:userId',PackageController.getAdminActivationPackages);
router.get('/get-miners',PackageController.PackagesClientReports);
router.get('/get-package/:id',PackageController.getPackage);


module.exports = router;