// CAPTCHA functionality
let captchaText = "";

function generateCaptcha(elementId = "captcha") {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  captchaText = "";

  for (let i = 0; i < 6; i++) {
    captchaText += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  const captchaElement = document.getElementById(elementId);
  if (captchaElement) {
    captchaElement.innerText = captchaText;
  }
}

function validateCaptchaInput() {
  const captchaInput = document.getElementById("captchaInput");
  if (!captchaInput) return false;
  
  const userInput = captchaInput.value.trim();
  if (userInput !== captchaText) {
    alert("Incorrect CAPTCHA. Please try again.");
    generateCaptcha();
    captchaInput.value = "";
    return false;
  }
  return true;
}

// Toggle between login and register cards
function showRegister() {
  document.getElementById("loginCard").style.display = "none";
  document.getElementById("registerCard").style.display = "block";
  generateCaptcha(); // Generate new captcha when showing register
}
function showLogin() {
  document.getElementById("registerCard").style.display = "none";
  document.getElementById("loginCard").style.display = "block";
  generateCaptcha(); // Generate new captcha when showing login
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
  
  // Validate email format if it looks like an email
  if (email.includes("@") && !/^\S+@\S+\.\S+$/.test(email)) {
    alert("Please enter a valid email address.");
    return false;
  }

  if (!password) {
    alert("Please enter your password.");
    return false;
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters.");
    return false;
  }

  // Validate CAPTCHA before login
  if (!validateCaptchaInput()) {
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

  // Full Name validation
  if (!name || name.length < 3) { 
    alert("Please enter your full name (minimum 3 characters)."); 
    return false; 
  }

  // Phone validation (basic check for digits)
  if (!phone || phone.replace(/\D/g, '').length < 10) { 
    alert("Please enter a valid phone number (minimum 10 digits)."); 
    return false; 
  }

  // Email validation
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) { 
    alert("Please enter a valid email address."); 
    return false; 
  }

  // Password validation
  if (!pass || pass.length < 6) { 
    alert("Password must be at least 6 characters."); 
    return false; 
  }

  // Password confirmation match
  if (pass !== confirm) { 
    alert("Passwords do not match."); 
    return false; 
  }

  // Address validation
  if (!address || address.length < 5) { 
    alert("Please enter a valid address (minimum 5 characters)."); 
    return false; 
  }

  // Terms and privacy acceptance
  const terms = document.querySelectorAll("#registerCard .terms input");
  if (!terms[0] || !terms[0].checked) { 
    alert("You must accept Terms & Conditions."); 
    return false; 
  }
  if (!terms[1] || !terms[1].checked) { 
    alert("You must accept Privacy Policy."); 
    return false; 
  }

  // Validate CAPTCHA before registration
  if (!validateCaptchaInput()) {
    return false;
  }

  alert("Registration successful (demo).");
  return true;
}

// Attach validation to buttons once DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.querySelector("#loginCard .btn.blue");
  const registerBtn = document.querySelector("#registerCard .btn.green");

  // Generate initial CAPTCHA on page load
  generateCaptcha();

  if (loginBtn) loginBtn.onclick = validateLogin;
  if (registerBtn) registerBtn.onclick = validateRegister;
});