const express = require("express");

const residentAccountControllers = require("../controllers/resident-account-controllers");

const router = express.Router();

router.post("/updateProfile", residentAccountControllers.updateProfile);

router.post(
  "/updateNotifications",
  residentAccountControllers.updateNotifications
);

router.post("/getFeedback", residentAccountControllers.getFeedback);

router.post("/sendFeedback", residentAccountControllers.sendFeedback);

module.exports = router;
