const signup = (req, res) => {
  const { full_name, email, password } = req.body;
  if (!full_name || !email || !password) {
    return res.status(400).json({
      error: "all fields must be field",
    });
  }
  res.json({
    message: "Validation successful",
    full_name,
    email,
    password,
  });
};

module.exports = {
  signup,
};
