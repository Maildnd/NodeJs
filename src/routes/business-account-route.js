const express = require("express");
const multer = require("multer");

const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage });

const businessAccountController = require("../controllers/business-account-controllers");

const router = express.Router();

router.get("/getDetails", businessAccountController.getBusinessAccount);

router.post(
  "/updateDetails",
  upload.single("cover_image"),
  businessAccountController.updateBusinessAccount
);

module.exports = router;
