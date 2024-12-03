const express = require("express");

const campaignMailControllers = require("../controllers/campaign-mail-controllers");

const router = express.Router();

router.post("/getCampaignMail", campaignMailControllers.getCampaignMail);

router.post("/updateMailView", campaignMailControllers.updateMailView);

router.post("/getTransactions", campaignMailControllers.getTransactions);

router.post("/getSavedList", campaignMailControllers.getSavedList);

router.post("/createSavedList", campaignMailControllers.createSavedList);

router.post("/deleteSavedList", campaignMailControllers.deleteSavedList);

router.post("/updateSavedList", campaignMailControllers.updateSavedList);

router.post("/updateSavedMail", campaignMailControllers.updateSavedMail);

router.post("/addMailToSavedList", campaignMailControllers.addMailToSavedList);

module.exports = router;
