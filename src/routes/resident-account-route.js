const express = require("express");

const residentAccountControllers = require("../controllers/resident-account-controllers");

const router = express.Router();

router.post("/updateProfile", residentAccountControllers.updateProfile);

router.post("/updateToken", residentAccountControllers.updateToken);

router.post(
  "/updateNotifications",
  residentAccountControllers.updateNotifications
);

router.post("/getFeedback", residentAccountControllers.getFeedback);

router.post("/sendFeedback", residentAccountControllers.sendFeedback);

router.post("/submitRedemption", residentAccountControllers.submitRedemption);

module.exports = router;
