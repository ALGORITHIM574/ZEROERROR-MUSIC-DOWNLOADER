console.log("SCRIPT LOADED");

const videoUrl = document.getElementById("videoUrl");
const audioBtn = document.getElementById("audioBtn");
const videoBtn = document.getElementById("videoBtn");
const downloadBtn = document.getElementById("downloadBtn");
const downloadFileBtn = document.getElementById("downloadFileBtn");
const statusBox = document.getElementById("statusBox");

let selectedType = null;
let currentDownloadId = sessionStorage.getItem("currentDownloadId");
let progressTimer = null;

const API = "http://localhost:3001";

function getToken() {
  return localStorage.getItem("token");
}

function setStatus(message) {
  if (statusBox) statusBox.textContent = message;
}

function setDownloadButtonVisible(visible) {
  if (downloadFileBtn) downloadFileBtn.hidden = !visible;
}

function authHeaders() {
  const token = getToken();
  if (!token) throw new Error("Please log in before downloading.");
  return { Authorization: `Bearer ${token}` };
}

// AUDIO BUTTON
audioBtn.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();

  selectedType = "audio";
  audioBtn.classList.add("active");
  videoBtn.classList.remove("active");
});

// VIDEO BUTTON
videoBtn.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();

  selectedType = "video";
  videoBtn.classList.add("active");
  audioBtn.classList.remove("active");
});

// START DOWNLOAD
downloadBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  e.stopPropagation();

  const url = videoUrl.value.trim();
  const type = selectedType;

  if (!url) {
    setStatus("Please enter a YouTube URL.");
    return;
  }

  if (!type) {
    setStatus("Choose Audio or Video first.");
    return;
  }

  try {
    const headers = authHeaders();
    setDownloadButtonVisible(false);

    if (progressTimer) clearTimeout(progressTimer);

    setStatus("Starting download...");

    const response = await fetch(`${API}/api/download`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify({ url, type }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not start the download.");
    }

    if (!data.downloadId) {
      throw new Error("The server did not return a download ID.");
    }

    currentDownloadId = data.downloadId;
    sessionStorage.setItem("currentDownloadId", currentDownloadId);
    sessionStorage.setItem("currentDownloadType", type);

    setStatus("Download started. Checking progress...");
    checkProgress(currentDownloadId);
  } catch (error) {
    console.error("DOWNLOAD ERROR:", error);
    setStatus(error.message || "Unable to start download.");
  }
});

// CHECK PROGRESS AND STATUS

async function checkProgress(downloadId) {
  try {
    const headers = authHeaders();

    const [progressResponse, statusResponse] = await Promise.all([
      fetch(`${API}/api/download/progress/${encodeURIComponent(downloadId)}`, {
        headers,
      }),
      fetch(`${API}/api/download/status/${encodeURIComponent(downloadId)}`, {
        headers,
      }),
    ]);

    const progressData = await progressResponse.json();
    const statusData = await statusResponse.json();

    if (!progressResponse.ok) {
      throw new Error(progressData.error || "Unable to get download progress.");
    }

    if (!statusResponse.ok) {
      throw new Error(statusData.error || "Unable to get download status.");
    }

    const progress = Number(progressData.progress) || 0;
    const status = statusData.status;

    if (status === "failed") {
      setStatus("Download failed. Check the backend terminal.");
      setDownloadButtonVisible(false);
      return;
    }

    if (status === "completed") {
      setStatus("Download complete. Your file is ready.");
      setDownloadButtonVisible(true);
      return;
    }

    setStatus(`Downloading... ${Math.floor(progress)}%`);
    progressTimer = setTimeout(() => checkProgress(downloadId), 1000);
  } catch (error) {
    console.error("PROGRESS ERROR:", error);
    setStatus(error.message || "Could not check download progress.");
  }
}

// AUTHENTICATED FILE DELIVERY
downloadFileBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  e.stopPropagation();

  const downloadId = sessionStorage.getItem("currentDownloadId");
  const type = sessionStorage.getItem("currentDownloadType");

  if (!downloadId) {
    setStatus("No download is available. Start a download first.");
    return;
  }

  try {
    setStatus("Preparing your file...");

    const response = await fetch(
      `${API}/api/download/file/${encodeURIComponent(downloadId)}`,
      { headers: authHeaders() },
    );

    if (!response.ok) {
      let message = "Unable to retrieve the file.";
      try {
        const data = await response.json();
        message = data.error || message;
      } catch (_) {}
      throw new Error(message);
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = objectUrl;
    link.download =
      type === "audio" ? "stream-fetch-audio.mp3" : "stream-fetch-video.mp4";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    setStatus("Your file download has started.");
  } catch (error) {
    console.error("FILE DOWNLOAD ERROR:", error);
    setStatus(error.message || "File download failed.");
  }
});

// RESTORE BUTTON VISIBILITY AFTER A PAGE REFRESH
setDownloadButtonVisible(false);
