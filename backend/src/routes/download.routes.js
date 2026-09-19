const express = require("express");
const { download, getProgress } = require("../controllers/download.controller");

const router = express.Router();

router.post("/", download);
router.get("/progress/:downloadId", getProgress);

module.exports = router;
