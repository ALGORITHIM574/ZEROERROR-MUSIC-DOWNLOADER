const express = require("express");
const {
  download,
  getProgress,
  getDownload,
} = require("../controllers/download.controller");

const router = express.Router();

router.post("/", download);
router.get("/progress/:downloadId", getProgress);
router.get("/file/:downloadId", getDownload);

module.exports = router;
