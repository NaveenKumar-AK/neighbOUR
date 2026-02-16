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
  // Here you would typically send data to server
  return true;
}

// Validate register form
function validateRegister() {
  const name = document.getElementById('fullName').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const email = document.getElementById('email').value.trim();
  const pass = document.getElementById('pass').value.trim();
  const confirm = document.getElementById('confirmPass').value.trim();
  const location = document.getElementById('location').value.trim();
  const serviceCategory = document.getElementById('serviceCategory').value;

  // Full Name validation
  if (!name || name.length < 3) { 
    alert('Please enter your full name (minimum 3 characters).'); 
    return false; 
  }

  // Phone validation (basic check for digits)
  if (!phone || phone.replace(/\D/g, '').length < 10) { 
    alert('Please enter a valid phone number (minimum 10 digits).'); 
    return false; 
  }

  // Email validation
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) { 
    alert('Please enter a valid email address.'); 
    return false; 
  }

  // Password validation
  if (!pass || pass.length < 6) { 
    alert('Password must be at least 6 characters.'); 
    return false; 
  }

  // Password confirmation match
  if (pass !== confirm) { 
    alert('Passwords do not match.'); 
    return false; 
  }

  // Location validation
  if (!location || location.length < 3) { 
    alert('Please enter your location or service area.'); 
    return false; 
  }

  // Service category validation
  if (!serviceCategory) { 
    alert('Please select a service category.'); 
    return false; 
  }

  if (serviceCategory === 'Other') {
    const serviceOther = document.getElementById('serviceOther').value.trim();
    if (!serviceOther) {
      alert('Please describe your service in the "Other" field.');
      return false;
    }
  }

  // Skills description validation
  const skills = document.getElementById('skills').value.trim();
  if (!skills || skills.length < 10) { 
    alert('Please provide a brief skills description (minimum 10 characters).'); 
    return false; 
  }

  // Experience validation
  const experience = document.getElementById('experience').value;
  if (experience === "" || parseInt(experience) < 0) { 
    alert('Please enter valid experience (years).'); 
    return false; 
  }

  // Pricing validation
  const pricing = document.getElementById('pricing').value;
  if (pricing === "" || parseFloat(pricing) < 0) { 
    alert('Please enter valid pricing.'); 
    return false; 
  }

  // At least one service category selected
  const anyService = !!document.querySelectorAll('#registerCard input[name="services"]:checked').length;
  if (!anyService) { 
    if(!confirm('You have not selected any service categories. Continue?')) 
      return false; 
  }

  // Terms and privacy acceptance
  const agreeTerms = document.getElementById('agreeTerms');
  const agreePrivacy = document.getElementById('agreePrivacy');
  if (!agreeTerms || !agreeTerms.checked) { 
    alert('You must accept Terms & Conditions.'); 
    return false; 
  }
  if (!agreePrivacy || !agreePrivacy.checked) { 
    alert('You must accept Privacy Policy.'); 
    return false; 
  }

  // ID Proof validation
  const idProof = document.getElementById('idProof');
  if (!idProof || !idProof.files || idProof.files.length === 0) {
    alert('Please upload a valid ID proof.');
    return false;
  }

  // Validate CAPTCHA before registration
  if (!validateCaptchaInput()) {
    return false;
  }

  // All validations passed
  alert('Registration submitted successfully (demo).');
  return true;
}

// Attach validation to buttons once DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.querySelector("#loginCard .btn.blue");
  const registerBtn = document.querySelector("#registerCard .btn.green");
  const providerBtn = document.getElementById('providerRegister');

  // Generate initial CAPTCHA on page load
  generateCaptcha();

  // Profile photo preview
  const profileInput = document.getElementById('profilePhoto');
  const avatarLabel = document.getElementById('avatarLabel');
  if (profileInput) {
    profileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      avatarLabel.style.backgroundImage = `url(${url})`;
      avatarLabel.style.backgroundSize = 'cover';
      avatarLabel.textContent = '';
    });
  }
  // service category other-field toggle
  const serviceSelect = document.getElementById('serviceCategory');
  const serviceOther = document.getElementById('serviceOther');
  if (serviceSelect && serviceOther) {
    serviceSelect.addEventListener('change', () => {
      if (serviceSelect.value === 'Other') serviceOther.style.display = 'block';
      else serviceOther.style.display = 'none';
    });
  }

  // day pills behavior
  const dayPills = document.querySelectorAll('.day-pill');
  const selectedDaysInput = document.getElementById('selectedDays');
  if (dayPills && selectedDaysInput) {
    dayPills.forEach(p => {
      p.addEventListener('click', () => {
        p.classList.toggle('active');
        const days = Array.from(document.querySelectorAll('.day-pill.active')).map(el => el.dataset.day);
        selectedDaysInput.value = days.join(',');
      });
    });
  }

  // styled file inputs: display selected filename(s)
  const idProofInput = document.getElementById('idProof');
  const idProofName = document.getElementById('idProofName');
  if (idProofInput && idProofName) {
    idProofInput.addEventListener('change', () => {
      const f = idProofInput.files[0];
      idProofName.textContent = f ? f.name : 'No file chosen';
    });
  }

  const certsInput = document.getElementById('certs');
  const certsName = document.getElementById('certsName');
  if (certsInput && certsName) {
    certsInput.addEventListener('change', () => {
      const files = Array.from(certsInput.files || []);
      if (!files.length) {
        certsName.textContent = 'No files chosen';
      } else if (files.length === 1) {
        certsName.textContent = files[0].name;
      } else {
        certsName.textContent = `${files.length} files selected`;
      }
    });
  }

  if (loginBtn) loginBtn.onclick = validateLogin;
  if (registerBtn) registerBtn.onclick = validateRegister;
  if (providerBtn) providerBtn.onclick = validateRegister;
});