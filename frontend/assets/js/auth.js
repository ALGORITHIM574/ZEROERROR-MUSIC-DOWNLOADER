const signupForm = document.getElementById("signupForm");
const full_name = document.getElementById("full_name");
const email = document.getElementById("email");
const password = document.getElementById("password");
const signupMessage = document.getElementById("signupMessage");
async function handlesubmit(event) {
  event.preventDefault();
  const signupData = {
    full_name: full_name.value,
    email: email.value,
    password: password.value,
  };
  //console.log(signupData);
  const response = await fetch("http://localhost:3001/api/auth/signup", {
    method: "POST",
    headers: {
      "content-Type": "application/json",
    },
    body: JSON.stringify(signupData),
  });
  const data = await response.json();
  console.log(data);
  if (response.status === 201) {
    signupMessage.textContent = data.message;
  }
}

signupForm.addEventListener("submit", handlesubmit);
