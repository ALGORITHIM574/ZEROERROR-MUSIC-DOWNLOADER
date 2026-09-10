const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const downloadRoutes = require("./routes/download.routes");

app.use(cors());
app.use(express.json());

app.use("/downloads", express.static("downloads"));

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
