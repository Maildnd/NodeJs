const express = require("express");

const supportControllers = require("../controllers/support-controllers");

const router = express.Router();

router.post("/submitMessage", supportControllers.createContactUsmessage);

module.exports = router;
