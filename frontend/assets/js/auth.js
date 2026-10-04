const signupForm = document.getElementById("signupForm");
const full_name = document.getElementById("full_name");
const email = document.getElementById("email");
const password = document.getElementById("password");
function handlesubmit(event) {
  event.preventDefault();

  console.log(
    `name ${full_name.value} email ${email.value} password  ${password.value}`,
  );
}
signupForm.addEventListener("submit", handlesubmit);
