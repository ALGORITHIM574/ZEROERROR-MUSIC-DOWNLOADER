const signupForm = document.getElementById("signupForm");
function handlesubmit(event) {
  event.preventDefault();
  console.log("formm submited");
}
signupForm.addEventListener("submit", handlesubmit);
