const express = require("express");

const envController = require("../controllers/env-controllers");

const router = express.Router();

router.get("/getEnvVariables", envController.getEnvVariables);

module.exports = router;
