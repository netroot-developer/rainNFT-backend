const express = require("express");
const router = express.Router();
const boosterController = require("../controllers/booster.controller");

router.post("/create", boosterController.createBooster);
router.put("/update/:id", boosterController.updateBooster);
router.delete("/delete/:id", boosterController.deleteBooster);
router.patch("/status/:id", boosterController.changeBoosterStatus);
router.get("/get-by-id/:id", boosterController.getBoosterById);
router.get("/get-all", boosterController.getAllBoosters);
router.get("/get-all-active", boosterController.getActiveBoosters);

router.get('/get-activation/:userId',boosterController.getAdminActivationBoosting);

module.exports = router;
