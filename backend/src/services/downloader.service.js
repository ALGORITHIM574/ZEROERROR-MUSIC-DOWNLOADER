const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const progressStore = {};
const downloadStore = {};

const ytDlpPath = path.join(__dirname, "../../../yt-dlp.exe");

const download = (url, type) => {
  const downloadsDir = path.join(__dirname, "../downloads");

  if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
  }

  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  progressStore[fileName] = 0;
  console.log("SERVER PID:", process.pid);
  console.log("CREATED PROGRESS ID:", fileName);

  const outputTemplate = path.join(downloadsDir, `${fileName}.%(ext)s`);

  let args;

  if (type === "audio") {
    args = [
      "-f",
      "140",
      "-x",
      "--audio-format",
      "mp3",
      "--newline",
      "--progress",
      "--progress-template",
      "download:%(progress._percent_str)s",
      "-o",
      outputTemplate,
      url,
    ];
  } else if (type === "video") {
    args = [
      "-f",
      "bv*+ba/b",
      "--merge-output-format",
      "mp4",
      "--newline",
      "--progress",
      "--progress-template",
      "download:%(progress._percent_str)s",
      "-o",
      outputTemplate,
      url,
    ];
  } else {
    throw new Error("Invalid download type");
  }

  // Start yt-dlp
  const child = spawn(ytDlpPath, args);

  // Listen to yt-dlp error output
  child.stderr.on("data", (data) => {
    console.log("STDERR:", data.toString());
  });

  // Listen to progress output
  child.stdout.on("data", (data) => {
    const output = data.toString();

    console.log("STDOUT:", output);
    console.log("RAW OUTPUT:", JSON.stringify(output));

    const match = output.match(/(\d+(?:\.\d+)?)%/);

    console.log("MATCH:", match);

    if (match) {
      const percentage = parseFloat(match[1]);

      progressStore[fileName] = percentage;

      console.log("PROGRESS STORE UPDATED:", progressStore[fileName]);
      console.log("PROGRESS:", percentage);
    }
  });
  // yt-dlp has finished
  child.on("close", (code) => {
    console.log("yt-dlp finished with code:", code);

    if (code !== 0) {
      console.error("yt-dlp download failed");
      return;
    }

    const files = fs.readdirSync(downloadsDir);

    const downloadedFile = files.find((file) =>
      file.startsWith(fileName + "."),
    );

    if (!downloadedFile) {
      console.error("Downloaded file could not be found");
      return;
    }
    downloadStore[fileName] = downloadedFile;
    console.log("DOWNLOAD STORE:", downloadStore);
    console.log("Download completed:", downloadedFile);
  });

  // Catch errors starting/running the process
  child.on("error", (error) => {
    console.error("yt-dlp process error:", error);
  });

  // Return immediately without waiting for yt-dlp
  return {
    downloadId: fileName,
  };
};

module.exports = {
  download,
  progressStore,
  downloadStore,
};
