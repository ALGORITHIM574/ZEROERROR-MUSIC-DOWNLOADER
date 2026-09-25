console.log("SCRIPT LOADED");

const videoUrl = document.getElementById("videoUrl");
const audioBtn = document.getElementById("audioBtn");
const videoBtn = document.getElementById("videoBtn");
const downloadBtn = document.getElementById("downloadBtn");
const downloadFileBtn = document.getElementById("downloadFileBtn");
const statusBox = document.getElementById("statusBox");

let selectedType = null;
let currentDownloadId = sessionStorage.getItem("currentDownloadId");

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

    console.log("FETCH COMPLETED");
    console.log("RESPONSE STATUS:", response.status);

    const data = await response.json();

    console.log("SERVER RESPONSE:", data);
    console.log("ABOUT TO GET DOWNLOAD ID");

    // GET DOWNLOAD ID
    const downloadId = data.downloadId;

    console.log("DOWNLOAD ID:", downloadId);

    currentDownloadId = downloadId;
    sessionStorage.setItem("currentDownloadId", downloadId);
    console.log("CURRENT ID AFTER ASSIGNMENT:", currentDownloadId);

    // START CHECKING PROGRESS
    await checkProgress(downloadId);
  } catch (error) {
    console.error("FETCH ERROR:", error);
  }
});

// DOWNLOAD FILE BUTTON
downloadFileBtn.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();

  const downloadId = sessionStorage.getItem("currentDownloadId");

  console.log("DOWNLOAD FILE BUTTON CLICKED");
  console.log("DOWNLOAD ID:", downloadId);

  if (!downloadId) {
    console.error("NO DOWNLOAD ID AVAILABLE");
    return;
  }

  window.location.href = `http://localhost:3001/api/download/file/${downloadId}`;
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

    // HANDLE SERVER ERROR
    if (data.error) {
      console.error("PROGRESS ERROR:", data.error);
      return;
    }

    // DOWNLOAD NOT FINISHED
    if (data.progress < 100) {
      console.log("CHECKING AGAIN...");

      setTimeout(() => {
        checkProgress(downloadId);
      }, 1000);

      return;
    }

    // DOWNLOAD FINISHED
    console.log("DOWNLOAD REACHED 100%");

    downloadFileBtn.hidden = false;

    console.log("DOWNLOAD FILE BUTTON IS NOW VISIBLE");
  } catch (error) {
    console.error("PROGRESS FETCH ERROR:", error);
  }
}
