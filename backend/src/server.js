const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./config/database");

const app = express();
// test to the connection
pool
  .getConnection()
  .then((connection) => {
    console.log("MySQL connection successful");
    connection.release();
  })
  .catch((error) => {
    console.error("MySQL connection failed:", error.message);
  });
const downloadRoutes = require("./routes/download.routes");
const authRoutes = require("./routes/auth.routes");

app.use(cors());
app.use(express.json());

app.use("/downloads", express.static("downloads"));

app.use("/api/download", downloadRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Stream Fetch API is running",
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
