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
  const name = document.getElementById('fullName').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const email = document.getElementById('email').value.trim();
  const pass = document.getElementById('pass').value.trim();
  const confirm = document.getElementById('confirmPass').value.trim();
  const location = document.getElementById('location').value.trim();

  if (!name) { alert('Please enter your full name.'); return false; }
  if (!phone) { alert('Please enter your phone number.'); return false; }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) { alert('Please enter a valid email address.'); return false; }
  if (!pass || pass.length < 6) { alert('Password must be at least 6 characters.'); return false; }
  if (pass !== confirm) { alert('Passwords do not match.'); return false; }
  if (!location) { alert('Please enter your location or service area.'); return false; }

  const anyService = !!document.querySelectorAll('#registerCard input[name="services"]:checked').length;
  if (!anyService) { if(!confirm('You have not selected any service categories. Continue?')) return false; }

  const agreeTerms = document.getElementById('agreeTerms');
  const agreePrivacy = document.getElementById('agreePrivacy');
  if (!agreeTerms.checked || !agreePrivacy.checked) { alert('You must accept Terms & Conditions and Privacy Policy.'); return false; }

  // Minimal demo submission behavior
  alert('Registration submitted (demo).');
  return true;
}

// Attach validation to buttons once DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.querySelector("#loginCard .btn.blue");
  const registerBtn = document.querySelector("#registerCard .btn.green");
  const providerBtn = document.getElementById('providerRegister');

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