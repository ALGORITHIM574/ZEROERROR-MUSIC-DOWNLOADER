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
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        error: "Email already registered",
      });
    }
    return res.status(500).json({
      error: "Something went wrong while creating your account",
    });
  }
};
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      error: "Email and Password required",
    });
  }
  const [rows] = await pool.execute(
    `SELECT user_id, full_name, email, password_hash
   FROM users
   WHERE email = ?`,
    [email],
  );
  if (rows.length === 0) {
    return res.status(401).json({
      error: "Invalid email or password",
    });
  }
  const pass = await bcrypt.compare(password, rows[0].password_hash);
  if (pass === true) {
    return res.status(200).json({
      message: "Login successful",
    });
  } else {
    return res.status(401).json({
      error: "invalid credentials",
    });
  }
};
module.exports = {
  signup,
  login,
};
