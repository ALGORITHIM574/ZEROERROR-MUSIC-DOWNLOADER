console.log("SCRIPT LOADED");

const videoUrl = document.getElementById("videoUrl");
const audioBtn = document.getElementById("audioBtn");
const videoBtn = document.getElementById("videoBtn");
const downloadBtn = document.getElementById("downloadBtn");
const downloadFileBtn = document.getElementById("downloadFileBtn");
const statusBox = document.getElementById("statusBox");

let selectedType = null;
let currentDownloadId = null;

// AUDIO BUTTON
audioBtn.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();

  console.log("AUDIO BUTTON CLICKED");
  selectedType = "audio";
  audioBtn.classList.add("active");
  videoBtn.classList.remove("active");
});

// VIDEO BUTTON
videoBtn.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();

  console.log("VIDEO BUTTON CLICKED");
  selectedType = "video";
  videoBtn.classList.add("active");
  audioBtn.classList.remove("active");
});

// DOWNLOAD BUTTON
downloadBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  e.stopPropagation();

  console.log("DOWNLOAD BUTTON CLICKED");

  const url = videoUrl.value;
  const type = selectedType;

  console.log("URL:", url);
  console.log("TYPE:", type);

  // CHECK URL
  if (!url) {
    alert("Please enter a YouTube URL");
    return;
  }

  // CHECK TYPE
  if (!type) {
    alert(
      "Please select either Audio or Video before pressing the download button",
    );
    return;
  }

  try {
    // SEND DOWNLOAD REQUEST TO SERVER
    const response = await fetch("http://localhost:3001/api/download", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        url: url,
        type: type,
      }),
    });

    const data = await response.json();

    console.log("SERVER RESPONSE:", data);

    // GET DOWNLOAD ID
    const downloadId = data.downloadId;
    currentDownloadId = downloadId;
    console.log("DOWNLOAD ID:", downloadId);

    // START CHECKING PROGRESS
    await checkProgress(downloadId);
  } catch (error) {
    console.error("FETCH ERROR:", error);
  }
});
downloadFileBtn.addEventListener("click", () => {
  console.log("DOWNLOAD FILE BUTTON CLICKED");

  window.location.href = `http://localhost:3001/api/download/file/${currentDownloadId}`;
});

// CHECK DOWNLOAD PROGRESS
async function checkProgress(downloadId) {
  console.log("CHECK PROGRESS STARTED:", downloadId);

  try {
    const response = await fetch(
      `http://localhost:3001/api/download/progress/${downloadId}`,
    );

    const data = await response.json();

    console.log("PROGRESS RESPONSE:", data);

    // DOWNLOAD NOT FINISHED
    if (data.progress < 100) {
      console.log("CHECKING AGAIN...");

      setTimeout(() => {
        checkProgress(downloadId);
      }, 1000);
    } else {
      console.log("DOWNLOAD REACHED 100%");
      downloadFileBtn.hidden = false;
      console.log("DOWNLOAD FILE BUTTON IS NOW VISIBLE");
    }
  } catch (error) {
    console.error("PROGRESS FETCH ERROR:", error);
  }
}
