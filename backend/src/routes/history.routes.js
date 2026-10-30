const express = require("express");
const router = express.Router();

const { getDownloadHistory } = require("../controllers/history.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.get("/", authMiddleware, getDownloadHistory);

module.exports = router;
