const { execFile } = require("child_process");
const path = require("path");
const fs = require("fs");
const ytDlpPath = path.join(__dirname, "../../../yt-dlp.exe");
const download = (url, type) => {
  return new Promise((resolve, reject) => {
    const downloadsDir = path.join(__dirname, "../../downloads");

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

    execFile(ytDlpPath, args, (error, stdout, stderr) => {
      if (error) {
        reject(error);
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
        output: stdout,
      });
    });
  });
};

module.exports = {
  download,
};
