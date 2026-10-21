const authMiddleware = require("../middleware/auth.middleware");
const express = require("express");
const {
  download,
  getProgress,
  getDownload,
  getStatus,
  getMetadata,
} = require("../controllers/download.controller");

const router = express.Router();

router.post("/", authMiddleware, download);
router.get("/progress/:downloadId", authMiddleware, getProgress);
router.get("/file/:downloadId", authMiddleware, getDownload);
router.get("/status/:downloadId", authMiddleware, getStatus);
router.get("/metadata/:downloadId", authMiddleware, getMetadata);
module.exports = router;
