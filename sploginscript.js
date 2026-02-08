 // Toggle between login and register cards
function showRegister() {
  document.getElementById("loginCard").style.display = "none";
  document.getElementById("registerCard").style.display = "block";
}
function showLogin() {
  document.getElementById("registerCard").style.display = "none";
  document.getElementById("loginCard").style.display = "block";
}

// Password strength meter
function strength() {
  let v = document.getElementById("pass").value;
  let b = document.getElementById("bar");
  if (v.length < 4) {
    b.style.width = "30%";
    b.style.background = "red";
  } else if (v.length < 7) {
    b.style.width = "60%";
    b.style.background = "orange";
  } else {
    b.style.width = "100%";
    b.style.background = "green";
  }
}

// Validate login form
function validateLogin() {
  const email = document.querySelector("#loginCard input[type='text']").value.trim();
  const password = document.querySelector("#loginCard input[type='password']").value.trim();

  if (!email) {
    alert("Please enter your email or phone.");
    return false;
  }
  if (!password) {
    alert("Please enter your password.");
    return false;
  }
  alert("Login successful (demo).");
  return true;
}

// Validate register form
function validateRegister() {
  const inputs = document.querySelectorAll("#registerCard .form input");
  const name = inputs[0].value.trim();
  const phone = inputs[1].value.trim();
  const email = inputs[2].value.trim();
  const pass = inputs[3].value.trim();
  const confirm = inputs[4].value.trim();
  const address = inputs[5].value.trim();

  if (!name || !phone || !email || !pass || !confirm || !address) {
    alert("All fields are required.");
    return false;
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    alert("Please enter a valid email address.");
    return false;
  }
  if (pass.length < 6) {
    alert("Password must be at least 6 characters.");
    return false;
  }
  if (pass !== confirm) {
    alert("Passwords do not match.");
    return false;
  }
  const terms = document.querySelectorAll("#registerCard .terms input");
  if (!terms[0].checked || !terms[1].checked) {
    alert("You must accept Terms & Conditions and Privacy Policy.");
    return false;
  }
  alert("Registration successful (demo).");
  return true;
}

// Attach validation to buttons once DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.querySelector("#loginCard .btn.blue");
  const registerBtn = document.querySelector("#registerCard .btn.green");

  if (loginBtn) loginBtn.onclick = validateLogin;
  if (registerBtn) registerBtn.onclick = validateRegister;
});