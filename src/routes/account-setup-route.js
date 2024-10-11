const express = require("express");
const multer = require("multer");

const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage });

const setupControllers = require("../controllers/account-setup-controllers");

const router = express.Router();

router.get("/getAvailablePlans", setupControllers.getSubscriptionPlans);

router.get("/getDiscounts", setupControllers.getDiscounts);

router.post(
  "/completeSetup",
  upload.single("cover_image"),
  setupControllers.completeSetup
);

router.post("/saveBusinessDetails", setupControllers.saveBusinessDetails);

router.post("/uploadFile", upload.single("file"), setupControllers.uploadFile);

router.post("/updateUser", setupControllers.updateUser);

router.post("/insertBusinessUser", setupControllers.insertBusinessUser);
router.post("/updateBusinessAccount", setupControllers.updateBusinessAccount);

module.exports = router;
