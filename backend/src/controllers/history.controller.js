const pool = require("../config/database");

const getDownloadHistory = async (req, res) => {
  try {
    const [history] = await pool.execute(
      `SELECT
         download_id,
         status,
         media_type,
         title,
         artist,
         thumbnail,
         file_size_bytes,
         created_at,
         completed_at
       FROM download_history
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [req.user.user_id],
    );

    return res.status(200).json({
      success: true,
      history,
    });
  } catch (error) {
    console.error("Download history error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not retrieve download history",
    });
  }
};

module.exports = { getDownloadHistory };
