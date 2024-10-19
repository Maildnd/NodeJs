const express = require("express");

const authResidentControllers = require("../controllers/auth-resident-controllers");

const router = express.Router();

router.post("/signup", authResidentControllers.signupUser);

router.post("/login", authResidentControllers.loginUser);

// router.post("/getUserSession", authResidentControllers.getUserSession);

router.post("/logout", authResidentControllers.logoutUser);

router.post("/resetPassword", authResidentControllers.resetPassword);

router.post("/updatePassword", authResidentControllers.updatePassword);

router.post("/deleteAccount", authResidentControllers.deleteAccount);

router.post("/deleteUser", authResidentControllers.deleteUser);

module.exports = router;
