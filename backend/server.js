console.log("THIS IS THE SERVER.JS I AM RUNNING");
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const downloadRoutes = require("./src/routes/download.routes");

const app = express();

app.use(cors());
app.use(express.json());
// test
console.log("DOWNLOAD FOLDER:", path.join(__dirname, "downloads"));

console.log(
  "DOWNLOAD FILES:",
  require("fs").readdirSync(path.join(__dirname, "downloads")),
);
app.use("/downloads", express.static(path.join(__dirname, "downloads")));

app.use("/api/download", downloadRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Stream Fetch API is running",
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
