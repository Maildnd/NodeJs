const express = require("express");

const dashboardDetailsControllers = require("../controllers/dashboard-details-controllers");

const router = express.Router();

router.post("/getDetails", dashboardDetailsControllers.getDashboardDetails);

module.exports = router;
