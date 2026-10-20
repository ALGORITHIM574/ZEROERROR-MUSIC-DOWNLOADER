console.log("SCRIPT LOADED");

const videoUrl = document.getElementById("videoUrl");
const audioBtn = document.getElementById("audioBtn");
const videoBtn = document.getElementById("videoBtn");
const downloadBtn = document.getElementById("downloadBtn");
const downloadFileBtn = document.getElementById("downloadFileBtn");
const statusBox = document.getElementById("statusBox");

const API = "http://localhost:3001";

let selectedType = "audio";
let currentDownloadId = sessionStorage.getItem("currentDownloadId");
let progressTimer = null;
let isCheckingProgress = false;

function getToken() {
  return localStorage.getItem("token");
}

function setStatus(message) {
  if (statusBox) {
    statusBox.classList.remove("hidden");
    const messageElement = statusBox.querySelector(".status-message");

    if (messageElement) {
      messageElement.textContent = message;
    } else {
      statusBox.textContent = message;
    }
  }

  console.log("STATUS:", message);
}

function setDownloadButtonVisible(visible) {
  if (!downloadFileBtn) {
    console.error("downloadFileBtn was not found in the HTML.");
    return;
  }

  downloadFileBtn.hidden = !visible;
  downloadFileBtn.style.display = visible ? "block" : "none";
}

function authHeaders() {
  const token = getToken();

  if (!token) {
    throw new Error("Please log in before downloading.");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

async function readResponse(response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error("The server returned an invalid response.");
  }
}

function stopProgressChecking() {
  if (progressTimer) {
    clearTimeout(progressTimer);
    progressTimer = null;
  }

  isCheckingProgress = false;
}

// AUDIO BUTTON
audioBtn?.addEventListener("click", (e) => {
  e.preventDefault();

  selectedType = "audio";
  audioBtn.classList.add("active");
  videoBtn?.classList.remove("active");
});

// VIDEO BUTTON
videoBtn?.addEventListener("click", (e) => {
  e.preventDefault();

  selectedType = "video";
  videoBtn.classList.add("active");
  audioBtn?.classList.remove("active");
});

// START DOWNLOAD
downloadBtn?.addEventListener("click", async (e) => {
  e.preventDefault();

  stopProgressChecking();
  setDownloadButtonVisible(false);

  const url = videoUrl?.value.trim();
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

    setStatus("Starting download...");

    const response = await fetch(`${API}/api/download`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify({ url, type }),
    });

    const data = await readResponse(response);

    if (!response.ok) {
      throw new Error(
        data.error || `Could not start download (HTTP ${response.status}).`,
      );
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
  if (isCheckingProgress) return;

  isCheckingProgress = true;

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

    const progressData = await readResponse(progressResponse);
    const statusData = await readResponse(statusResponse);

    if (!progressResponse.ok || !statusResponse.ok) {
      const failedResponse = !progressResponse.ok
        ? progressResponse
        : statusResponse;

      const errorData = !progressResponse.ok ? progressData : statusData;

      if (failedResponse.status === 401) {
        stopProgressChecking();
        setStatus("Your session may have expired. Please log in again.");
        return;
      }

      throw new Error(
        errorData.error ||
          `Could not check download status (HTTP ${failedResponse.status}).`,
      );
    }

    const progress = Number(progressData.progress) || 0;
    const status = statusData.status;

    console.log("Download ID:", downloadId);
    console.log("Download progress:", progress);
    console.log("Download status:", status);

    if (status === "completed") {
      stopProgressChecking();
      setDownloadButtonVisible(true);
      setStatus("Download complete. Your file is ready.");
      return;
    }

    if (status === "failed") {
      stopProgressChecking();
      setDownloadButtonVisible(false);
      setStatus("Download failed. Check the backend terminal.");
      return;
    }

    setStatus(`Downloading... ${Math.floor(progress)}%`);
  } catch (error) {
    console.error("PROGRESS ERROR:", error);
    stopProgressChecking();
    setStatus(error.message || "Could not check download progress.");
    return;
  } finally {
    isCheckingProgress = false;
  }

  // Schedule the next check only if the download is still in progress.
  if (currentDownloadId === downloadId) {
    progressTimer = setTimeout(() => {
      checkProgress(downloadId);
    }, 1000);
  }
}

// AUTHENTICATED FILE DELIVERY
downloadFileBtn?.addEventListener("click", async (e) => {
  e.preventDefault();

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
      let message = `Unable to retrieve file (HTTP ${response.status}).`;

      try {
        const data = await readResponse(response);
        message = data.error || message;
      } catch {
        // Keep the original HTTP error message.
      }

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

// INITIAL PAGE STATE
setDownloadButtonVisible(false);

audioBtn?.classList.toggle("active", selectedType === "audio");
videoBtn?.classList.toggle("active", selectedType === "video");

// Restore the previous download's status after refreshing the page.
if (currentDownloadId) {
  checkProgress(currentDownloadId);
}
