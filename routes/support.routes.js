const router = require("express").Router();
const SupportController = require("../controllers/support.controller");
const { isLoggedIn } = require("../middleware/authenticate.middleware");

router.post("/support-request",isLoggedIn,SupportController.SupportTicketRaise)
router.post("/support/status/:id",SupportController.SupportTicketResponse);
router.get('/support-in-process',SupportController.SupportAdminReports);
router.get('/support-messages',isLoggedIn,SupportController.SupportClientReports);

module.exports = router;