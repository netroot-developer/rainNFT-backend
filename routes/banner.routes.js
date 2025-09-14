const router = require("express").Router()
const BannerController = require("../controllers/banner.controller");
const { isAdminLoggedIn } = require("../middleware/authenticate.middleware");

router.post('/create-update', BannerController.BannerCreateUpdate);
router.get('/get-banner', BannerController.getBanner);
router.get('/get-banners', BannerController.AllBanners);

module.exports = router