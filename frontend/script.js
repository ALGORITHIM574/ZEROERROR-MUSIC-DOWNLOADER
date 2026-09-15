console.log("SCRIPT LOADED");
const videoUrl = document.getElementById("videoUrl");
const audioBtn = document.getElementById("audioBtn");
const videoBtn = document.getElementById("videoBtn");
const downloadBtn = document.getElementById("downloadBtn");
const statusBox = document.getElementById("statusBox");
let selectedType = null;
audioBtn.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  console.log("AUDIO BUTTON CLICKED");
  selectedType = "audio";
  audioBtn.classList.add("active");
  videoBtn.classList.remove("active");
});
videoBtn.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  console.log("VIDEO CLICKED");
  selectedType = "video";
  videoBtn.classList.add("active");
  audioBtn.classList.remove("active");
});
downloadBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  e.stopPropagation();
  console.log("DOWNLOAD BUTTON CLICKED");
  const url = videoUrl.value;
  console.log(url);
  const type = selectedType;
  console.log("URL:", url);
  if (!url) {
    alert("please enter a youtube url");
    return;
  }
  if (!type) {
    alert(
      "please select either Audio or Video before pressing the download button",
    );
    return;
  }
  console.log("URL:", url);
  console.log("TYPE:", type);
  try {
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
    console.log("server Response", data);
  } catch (error) {
    console.error("Fetch failed error layout reset:", error);
  }
});
