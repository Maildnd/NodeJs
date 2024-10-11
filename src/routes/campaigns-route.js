const express = require("express");
const multer = require("multer");

const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage });

const campaignControllers = require("../controllers/campaigns-controller");

const router = express.Router();

router.post("/getCampaigns", campaignControllers.getCampaigns);

const cpUpload = upload.fields([
  { name: "images_files", maxCount: 10 },
  { name: "pdf_files", maxCount: 10 },
  { name: "coupon_files", maxCount: 10 },
  { name: "promotion_files", maxCount: 10 },
]);
router.post("/createCampaign", cpUpload, campaignControllers.createCampaign);

router.post("/publishCampaign", campaignControllers.publishCampaign);

router.post("/createCampaignMails", campaignControllers.createCampaignMails);

router.post("/getTargetCoordinates", campaignControllers.getTargetCoordinates);

module.exports = router;
