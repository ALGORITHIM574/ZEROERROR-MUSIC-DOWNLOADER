const loginForm = document.getElementById("loginForm");
const email = document.getElementById("email");
const password = document.getElementById("password");
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const loginData = {
    email: email.value,
    password: password.value,
  };
  try {
    const response = await fetch("http://localhost:3001/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    });
    const data = await response.json();
    if (response.status === 200) {
      loginMessage.textContent = data.message;
    } else if (response.status === 401) {
      loginMessage.textContent = data.error;
    } else if (response.status === 400) {
      loginMessage.textContent = data.error;
    } else if (response.status === 500) {
      loginMessage.textContent = data.error;
    }
  } catch (error) {
    loginMessage.textContent = "Unable to connect to the server";
  }
  console.log("Login form submitted");
});
