const express = require("express");
const { createController, getAllControllers, getControllerById, updateController, deleteController, getControllerFindOne} = require("../controllers/controller.controller");

const router = express.Router();

router.post("/create", createController);           // Create
router.put("/update-roi", updateController);         // Update
router.delete("/delete/:id", deleteController);      // Delete
router.get("/get-all-list", getAllControllers);           // Get all
router.get("/get-by-id/:id", getControllerById);        // Get by id
router.get("/get-by-one", getControllerFindOne);        // Get by id

module.exports = router;
