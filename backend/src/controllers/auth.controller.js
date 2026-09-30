const bcrypt = require("bcrypt");
const pool = require("../config/database");

const signup = async (req, res) => {
  const { full_name, email, password } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({
      error: "All fields must be filled",
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      error: "Enter the correct email format",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      error: "Use at least 8 character password",
    });
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      `INSERT INTO users (full_name, email, password_hash, date_created)
       VALUES (?, ?, ?, NOW())`,
      [full_name, email, password_hash],
    );

    console.log("USER CREATED:", result.insertId);

    return res.status(201).json({
      message: "Account created successfully",
      user_id: result.insertId,
    });
  } catch (error) {
    console.error("SIGNUP ERROR:", error);

    return res.status(500).json({
      error: "Something went wrong while creating your account",
    });
  }
};

module.exports = {
  signup,
};
