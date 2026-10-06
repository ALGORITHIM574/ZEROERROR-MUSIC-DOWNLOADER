const loginForm = document.getElementById("loginForm");
const email = document.getElementById("email");
const password = document.getElementById("password");
loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const loginData = {
    email: email.value,
    password: password.value,
  };
  console.log("Login form submitted");
});
