const express = require("express");

const authControllers = require("../controllers/auth-controllers");

const router = express.Router();

router.post("/signup", authControllers.signupUser);

router.post("/login", authControllers.loginUser);

router.post("/getUserSession", authControllers.getUserSession);

router.post("/logout", authControllers.logoutUser);

router.post("/resetPassword", authControllers.resetPassword);

router.post("/updatePassword", authControllers.updatePassword);

router.post("/verifyOTP", authControllers.verifyOTP);

module.exports = router;
