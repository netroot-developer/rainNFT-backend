const express = require("express");
const router = express.Router();
const RoyaltyController = require("../controllers/royalty.controller");
router.post("/create", RoyaltyController.createRoyalty);
router.put("/update/:id", RoyaltyController.updateRoyalty);
router.delete("/delete/:id", RoyaltyController.deleteRoyalty);
router.patch("/status/:id", RoyaltyController.toggleRoyaltyStatus);
router.get("/get-all-history", RoyaltyController.getAllRoyalties);
router.get("/get-active-history", RoyaltyController.getAllActiveRoyalties);
router.get("/get-by-id/:id", RoyaltyController.getRoyaltyById);

module.exports = router;
