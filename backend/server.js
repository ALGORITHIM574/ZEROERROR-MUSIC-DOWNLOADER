console.log("THIS IS THE SERVER.JS I AM RUNNING");

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

require("dotenv").config();

const downloadRoutes = require("./src/routes/download.routes");
const authRoutes = require("./src/routes/auth.routes");

const app = express();

app.use(cors());
app.use(express.json());

// Define the downloads directory
const downloadsDir = path.join(__dirname, "src", "downloads");

console.log("DOWNLOAD FOLDER:", downloadsDir);

// Check that the downloads directory exists
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

// Register API routes
app.use("/api/download", downloadRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Stream Fetch API is running",
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
