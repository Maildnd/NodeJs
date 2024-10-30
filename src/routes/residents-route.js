const express = require("express");

const residentsControllers = require("../controllers/residents-controllers");

const router = express.Router();

router.post("/getResidentsCount", residentsControllers.getResidentsCount);

router.get("/getZipCodes", residentsControllers.getZipCodes);

router.post(
  "/getResidentsCountByZipcodes",
  residentsControllers.getResidentsCountByZipcodes
);

router.post("/connectByCode", residentsControllers.connectByCode);

router.post("/registerAddress", residentsControllers.registerAddress);

router.post("/validateAddress", residentsControllers.validateAddress);

module.exports = router;
