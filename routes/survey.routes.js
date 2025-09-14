const router = require("express").Router();
const SurveyController = require("../controllers/survey.controller");
const { isAdminLoggedIn } = require("../middleware/admin.middleware");

// ------------------------------ SURVEY ROUTE START ---------------------------------------

router.post('/create', isAdminLoggedIn, SurveyController.createSurvey);
router.put('/update/:id', isAdminLoggedIn, SurveyController.updateSurvey);
router.delete('/delete/:id', isAdminLoggedIn, SurveyController.deleteSurvey);
router.patch('/status/:id', isAdminLoggedIn, SurveyController.toggleSurveyStatus);
router.get('/get-admin-history', isAdminLoggedIn, SurveyController.SurveyAdminHistory);
router.get('/get-user-history', SurveyController.getSurveyQuestionsHistory);

// ------------------------------ SURVEY ROUTE END ---------------------------------------

module.exports = router