const videoUrl = document.getElementById("videoUrl");
const audioBtn = document.getElementById("audioBtn");
const videoBtn = document.getElementById("videoBtn");
const downloadBtn = document.getElementById("downloadBtn");
const statusBox = document.getElementById("statusBox");
let selectedType = null;
audioBtn.addEventListener("click", () => {
  console.log("AUDIO BUTTON CLICKED");
  selectedType = "audio";
  audioBtn.classList.add("active");
  videoBtn.classList.remove("active");
});
videoBtn.addEventListener("click", () => {
  console.log("AUDIO BUTTON CLICKED");
  selectedType = "video";
  videoBtn.classList.add("active");
  audioBtn.classList.remove("active");
});
downloadBtn.addEventListener("click", () => {
  console.log("DOWNLOAD BUTTON CLICKED");
  const url = videoUrl.value;
  console.log(url);
  const type = selectedType;
  console.log("URL:", url);
  console.log("TYPE:", type);
});
