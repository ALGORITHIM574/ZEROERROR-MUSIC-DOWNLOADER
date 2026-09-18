const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const ytDlpPath = path.join(__dirname, "../../../yt-dlp.exe");

const download = (url, type) => {
  return new Promise((resolve, reject) => {
    const downloadsDir = path.join(__dirname, "../downloads");

    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const outputTemplate = path.join(downloadsDir, `${fileName}.%(ext)s`);

    let args;

    if (type === "audio") {
      args = ["-x", "--audio-format", "mp3", "-o", outputTemplate, url];
    } else if (type === "video") {
      args = [
        "-f",
        "bv*+ba/b",
        "--merge-output-format",
        "mp4",
        "-o",
        outputTemplate,
        url,
      ];
    } else {
      reject(new Error("Invalid download type"));
      return;
    }

    // Start yt-dlp
    const child = spawn(ytDlpPath, args);

    // Listen to yt-dlp output while it is running
    child.stderr.on("data", (data) => {
      console.log(data.toString());
    });

    // yt-dlp has finished
    child.on("close", (code) => {
      console.log("yt-dlp finished with code:", code);

      if (code !== 0) {
        reject(new Error("yt-dlp download failed"));
        return;
      }

      const files = fs.readdirSync(downloadsDir);

      const downloadedFile = files.find((file) =>
        file.startsWith(fileName + "."),
      );

      if (!downloadedFile) {
        reject(new Error("Downloaded file could not be found"));
        return;
      }

      resolve({
        fileName: downloadedFile,
        downloadsDir,
      });
    });

    // Catch errors starting/running the process
    child.on("error", (error) => {
      reject(error);
    });
  });
};

module.exports = {
  download,
};
