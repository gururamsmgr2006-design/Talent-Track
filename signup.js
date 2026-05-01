// DOM elements
const roleBtns = document.querySelectorAll('.role-btn');
const dynamicFieldsContainer = document.getElementById('dynamicFields');
const signupForm = document.getElementById('signupForm');
const signupBtn = document.getElementById('signupBtn');
const btnText = signupBtn.querySelector('.btn-text');
const spinner = signupBtn.querySelector('.spinner');
const formErrorDiv = document.getElementById('formError');
const toast = document.getElementById('toast');

let selectedRole = 'jobseeker';

function showError(message) {
  formErrorDiv.textContent = message;
  setTimeout(() => {
    if (formErrorDiv.textContent === message) formErrorDiv.textContent = '';
  }, 3000);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 2500);
}

function updatePasswordStrength(password) {
  const strengthBar = document.getElementById('strengthBar');
  const strengthText = document.getElementById('strengthText');
  if (!strengthBar) return;
  let strength = 0;
  if (password.length >= 6) strength++;
  if (password.length >= 10) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  let width = 0;
  let color = '#dc2626';
  let text = 'Weak';
  if (strength >= 3) { width = 66; color = '#f59e0b'; text = 'Medium'; }
  if (strength >= 4) { width = 100; color = '#10b981'; text = 'Strong'; }
  if (strength === 0 && password.length === 0) { width = 0; text = ''; }
  else if (strength === 1 || strength === 2) { width = 33; text = 'Weak'; }
  strengthBar.style.width = width + '%';
  strengthBar.style.backgroundColor = color;
  strengthText.textContent = text;
}

function renderFormFields() {
  const isRecruiter = selectedRole === 'recruiter';
  dynamicFieldsContainer.innerHTML = `
    <div class="form-group" id="groupFullName">
      <label>Full Name *</label>
      <input type="text" id="fullName" placeholder="Enter your full name">
      <span class="error-text" id="errorFullName"></span>
    </div>
    ${isRecruiter ? `
    <div class="form-group" id="groupCompanyName">
      <label>Company Name *</label>
      <input type="text" id="companyName" placeholder="Company name">
      <span class="error-text" id="errorCompanyName"></span>
    </div>
    ` : ''}
    <div class="form-group" id="groupEmail">
      <label>Email *</label>
      <input type="email" id="email" placeholder="you@example.com">
      <span class="error-text" id="errorEmail"></span>
    </div>
    <div class="form-group" id="groupPassword">
      <label>Password *</label>
      <input type="password" id="password" placeholder="Create a password">
      <div class="strength-meter"><div class="strength-bar" id="strengthBar"></div></div>
      <div class="strength-text" id="strengthText"></div>
      <span class="error-text" id="errorPassword"></span>
    </div>
    <div class="form-group" id="groupConfirmPassword">
      <label>Confirm Password *</label>
      <input type="password" id="confirmPassword" placeholder="Confirm your password">
      <span class="error-text" id="errorConfirmPassword"></span>
    </div>
   
  `;
  const passwordInput = document.getElementById('password');
  if (passwordInput) {
    passwordInput.addEventListener('input', (e) => updatePasswordStrength(e.target.value));
  }
  attachValidationListeners();
  validateFormAndToggleButton();
}

function attachValidationListeners() {
  const fields = ['fullName', 'email', 'password', 'confirmPassword'];
  if (selectedRole === 'recruiter') fields.push('companyName');
  fields.forEach(fieldId => {
    const el = document.getElementById(fieldId);
    if (el) {
      el.removeEventListener('input', validateFormAndToggleButton);
      el.removeEventListener('blur', () => validateField(fieldId));
      el.addEventListener('input', validateFormAndToggleButton);
      el.addEventListener('blur', () => validateField(fieldId));
    }
  });
}

function validateField(fieldId) {
  const value = document.getElementById(fieldId)?.value.trim() || '';
  const errorSpan = document.getElementById(`error${fieldId.charAt(0).toUpperCase() + fieldId.slice(1)}`);
  if (!errorSpan) return true;
  let isValid = true;
  let errorMsg = '';
  switch(fieldId) {
    case 'fullName':
      if (!value) { isValid = false; errorMsg = 'Full name is required.'; }
      break;
    case 'email':
      if (!value) { isValid = false; errorMsg = 'Email is required.'; }
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) { isValid = false; errorMsg = 'Invalid email format.'; }
      break;
    case 'password':
      if (!value) { isValid = false; errorMsg = 'Password is required.'; }
      else if (value.length < 6) { isValid = false; errorMsg = 'Password must be at least 6 characters.'; }
      break;
    case 'confirmPassword':
      const pwd = document.getElementById('password')?.value.trim() || '';
      if (!value) { isValid = false; errorMsg = 'Please confirm your password.'; }
      else if (value !== pwd) { isValid = false; errorMsg = 'Passwords do not match.'; }
      break;
  }
  errorSpan.textContent = errorMsg;
  return isValid;
}

function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }

function validateFormAndToggleButton() {
  const fullName = document.getElementById('fullName')?.value.trim() || '';
  const email = document.getElementById('email')?.value.trim() || '';
  const password = document.getElementById('password')?.value.trim() || '';
  const confirmPassword = document.getElementById('confirmPassword')?.value.trim() || '';
 const companyName = 'valid';
  let isValid = true;
  if (!fullName) isValid = false;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) isValid = false;
  if (!password || password.length < 6) isValid = false;
  if (!confirmPassword || confirmPassword !== password) isValid = false;
 
  signupBtn.disabled = !isValid;
  return isValid;
}

function saveUserToLocalStorage(userData) {
  let users = JSON.parse(localStorage.getItem('users') || '[]');
  const existing = users.find(u => u.email === userData.email);
  if (existing) {
    showError('❌ This email is already registered. Please log in.');
    return false;
  }
  users.push(userData);
  localStorage.setItem('users', JSON.stringify(users));
  return true;
}

function setSession(email, role) {
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('currentUserEmail', email);
  localStorage.setItem('userRole', role);
}

function redirectBasedOnRole(role) {
  if (role === 'recruiter') {
    window.location.href = 'dashboard-recruiter.html';
  } else {
    window.location.href = 'dashboard-jobseeker.html';
  }
}

async function handleSignup(e) {
  e.preventDefault();
  if (!validateFormAndToggleButton()) return;
  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const confirmPassword = document.getElementById('confirmPassword').value.trim();
 let skills = null;
 
  if (password !== confirmPassword) {
    showError('Passwords do not match.');
    return;
  }
  btnText.textContent = 'Creating account';
  spinner.classList.remove('hidden');
  signupBtn.disabled = true;
  await new Promise(resolve => setTimeout(resolve, 1000));
  const user = {
  name: fullName,
  email,
  password,
  role: selectedRole
};
  const saved = saveUserToLocalStorage(user);
  if (!saved) {
    spinner.classList.add('hidden');
    signupBtn.disabled = false;
    btnText.textContent = 'Create account';
    return;
  }
  setSession(email, selectedRole);
  showToast('✅ Account created successfully! Redirecting...');
  setTimeout(() => redirectBasedOnRole(selectedRole), 1000);
}

function initRoleSwitcher() {
  const savedRole = sessionStorage.getItem('signupSelectedRole');
  if (savedRole && (savedRole === 'jobseeker' || savedRole === 'recruiter')) {
    selectedRole = savedRole;
    roleBtns.forEach(btn => {
      const role = btn.getAttribute('data-role');
      if (role === selectedRole) btn.classList.add('active');
      else btn.classList.remove('active');
    });
    renderFormFields();
  }
  roleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      roleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedRole = btn.getAttribute('data-role');
      sessionStorage.setItem('signupSelectedRole', selectedRole);
      renderFormFields();
      validateFormAndToggleButton();
    });
  });
}

function initMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => navLinks.classList.toggle('active'));
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('active'));
    });
  }
}

function checkAlreadyLoggedIn() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const role = localStorage.getItem('userRole');
  if (isLoggedIn && role) {
    if (role === 'recruiter') window.location.href = 'dashboard-recruiter.html';
    else window.location.href = 'dashboard-jobseeker.html';
    return true;
  }
  return false;
}

document.addEventListener('DOMContentLoaded', () => {
  if (checkAlreadyLoggedIn()) return;

  initMobileNav();
  initRoleSwitcher();

  // ✅ FORCE initial render (this is the missing piece)
  renderFormFields();

  signupForm.addEventListener('submit', handleSignup);
  setTimeout(() => validateFormAndToggleButton(), 50);
});