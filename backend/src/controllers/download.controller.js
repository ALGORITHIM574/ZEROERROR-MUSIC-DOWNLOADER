const { download, progressStore } = require("../services/downloader.service");

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

    if (
      parsedUrl.hostname !== "youtube.com" &&
      parsedUrl.hostname !== "www.youtube.com" &&
      parsedUrl.hostname !== "youtu.be" &&
      parsedUrl.hostname !== "www.youtu.be"
    ) {
      return res.status(400).json({
        error: "Only YouTube URLs are supported",
      });
    }

    const result = download(url, type);

    res.json({
      message: "Download started",
      downloadId: result.downloadId,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Download failed",
      details: error.message,
    });
  }
};
const getProgress = (req, res) => {
  const { downloadId } = req.params;

  const progress = progressStore[downloadId];

  if (progress === undefined) {
    return res.status(404).json({
      error: "Download not found",
    });
  }

  res.json({
    downloadId,
    progress,
  });
};

module.exports = {
  download: downloadController,
  getProgress,
};
