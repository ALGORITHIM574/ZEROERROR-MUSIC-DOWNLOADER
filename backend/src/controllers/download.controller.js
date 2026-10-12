const path = require("path");

const {
  download,
  progressStore,
  downloadStore,
  downloadOwners,
} = require("../services/downloader.service");

// Start a new download
const downloadController = async (req, res) => {
  const { url, type } = req.body;

  if (!url) {
    return res.status(400).json({
      error: "YouTube URL is required",
    });
  }

  if (!type) {
    return res.status(400).json({
      error: "Download type is required",
    });
  }

  if (type !== "audio" && type !== "video") {
    return res.status(400).json({
      error: "Type must be audio or video",
    });
  }

  try {
    const parsedUrl = new URL(url);

    const allowedHosts = [
      "youtube.com",
      "www.youtube.com",
      "m.youtube.com",
      "youtu.be",
      "www.youtu.be",
    ];

    if (!allowedHosts.includes(parsedUrl.hostname.toLowerCase())) {
      return res.status(400).json({
        error: "Only YouTube URLs are supported",
      });
    }

    const result = download(url, type);

    // Record which user owns this download
    downloadOwners[result.downloadId] = req.user.user_id;

    return res.status(202).json({
      message: "Download started",
      downloadId: result.downloadId,
    });
  } catch (error) {
    console.error("Download controller error:", error);

    return res.status(500).json({
      error: "Download failed",
    });
  }
};

// Get progress for a download
const getProgress = (req, res) => {
  const { downloadId } = req.params;

  // Only the owner may check this download's progress
  if (downloadOwners[downloadId] === undefined) {
    return res.status(404).json({
      error: "Download not found",
    });
  }

  if (downloadOwners[downloadId] !== req.user.user_id) {
    return res.status(403).json({
      error: "Not authorized to access this download",
    });
  }

  const progress = progressStore[downloadId];

  if (progress === undefined) {
    return res.status(404).json({
      error: "Download progress not found",
    });
  }

  return res.json({
    downloadId,
    progress,
  });
};

// Download a completed file
const getDownload = (req, res) => {
  const { downloadId } = req.params;

  // Confirm that this download exists
  if (downloadOwners[downloadId] === undefined) {
    return res.status(404).json({
      error: "Download not found",
    });
  }

  // Confirm that the logged-in user owns this download
  if (downloadOwners[downloadId] !== req.user.user_id) {
    return res.status(403).json({
      error: "Not authorized to access this download",
    });
  }

  const file = downloadStore[downloadId];

  if (!file) {
    return res.status(404).json({
      error: "Download not completed",
    });
  }

  const downloadsDir = path.resolve(__dirname, "../downloads");
  const filePath = path.resolve(downloadsDir, file);

  // Prevent a stored filename from escaping the downloads directory
  if (!filePath.startsWith(downloadsDir + path.sep)) {
    return res.status(400).json({
      error: "Invalid download file path",
    });
  }

  return res.download(filePath, (error) => {
    if (error && !res.headersSent) {
      console.error("File delivery error:", error);

      return res.status(500).json({
        error: "Unable to deliver download file",
      });
    }
  });
};

module.exports = {
  download: downloadController,
  getProgress,
  getDownload,
};
