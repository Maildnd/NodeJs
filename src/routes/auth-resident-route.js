const express = require("express");

const authResidentControllers = require("../controllers/auth-resident-controllers");

const router = express.Router();

router.post("/signup", authResidentControllers.signupUser);

router.post("/login", authResidentControllers.loginUser);

// router.post("/getUserSession", authResidentControllers.getUserSession);

router.post("/requestOTP", authResidentControllers.requestOTP);

router.post("/verifyOTP", authResidentControllers.verifyOTP);

router.post("/resendOTP", authResidentControllers.resendOTP);

router.post("/logout", authResidentControllers.logoutUser);

router.post("/updatePassword", authResidentControllers.updatePassword);

router.post("/deleteAccount", authResidentControllers.deleteAccount);

router.post("/deleteUser", authResidentControllers.deleteUser);

module.exports = router;
