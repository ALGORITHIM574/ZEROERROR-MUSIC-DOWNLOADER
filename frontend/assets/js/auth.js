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
  try {
    const response = await fetch("http://localhost:3001/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(signupData),
    });
    const data = await response.json();
    // console.log(data);
    if (response.status === 201) {
      signupMessage.textContent = data.message;
    } else if (response.status === 409) {
      signupMessage.textContent = data.error;
    } else if (response.status === 400) {
      signupMessage.textContent = data.error;
    } else if (response.status === 500) {
      signupMessage.textContent = data.error;
    }
  } catch (error) {
    signupMessage.textContent = "Unable to connect to the server";
  }
}
signupForm.addEventListener("submit", handlesubmit);
