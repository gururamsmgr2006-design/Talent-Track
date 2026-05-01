// DOM Elements
const roleBtns = document.querySelectorAll('.role-btn');
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const togglePassword = document.getElementById('togglePassword');
const loginBtn = document.getElementById('loginBtn');
const btnText = loginBtn.querySelector('.btn-text');
const spinner = loginBtn.querySelector('.spinner');
const errorDiv = document.getElementById('errorMessage');
const toast = document.getElementById('toast');

let selectedRole = 'jobseeker';

function showError(message) {
  errorDiv.textContent = message;
  setTimeout(() => {
    if (errorDiv.textContent === message) errorDiv.textContent = '';
  }, 3000);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 2500);
}

function validateForm() {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const isValid = email !== '' && password !== '';
  loginBtn.disabled = !isValid;
  return isValid;
}

function setLoading(loading) {
  if (loading) {
    btnText.textContent = 'Logging in';
    spinner.classList.remove('hidden');
    loginBtn.disabled = true;
  } else {
    btnText.textContent = 'Log in';
    spinner.classList.add('hidden');
    loginBtn.disabled = false;
  }
}

function redirectToDashboard(role) {
  if (role === 'recruiter') {
    window.location.href = 'dashboard-recruiter.html';
  } else {
    window.location.href = 'dashboard-jobseeker.html';
  }
}

function saveSession(role, email) {
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('userRole', role);
  localStorage.setItem('currentUserEmail', email);
}

function checkExistingSession() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const userRole = localStorage.getItem('userRole');
  if (isLoggedIn && userRole) {
    redirectToDashboard(userRole);
    return true;
  }
  return false;
}

function saveSelectedRoleToStorage(role) {
  sessionStorage.setItem('tempSelectedRole', role);
}

function loadStoredRole() {
  const storedRole = sessionStorage.getItem('tempSelectedRole');
  if (storedRole && (storedRole === 'jobseeker' || storedRole === 'recruiter')) {
    selectedRole = storedRole;
    roleBtns.forEach(btn => {
      const role = btn.getAttribute('data-role');
      if (role === selectedRole) btn.classList.add('active');
      else btn.classList.remove('active');
    });
  }
}

function initRoleSwitcher() {
  roleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      roleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedRole = btn.getAttribute('data-role');
      saveSelectedRoleToStorage(selectedRole);
      validateForm();
    });
  });
}

function initPasswordToggle() {
  togglePassword.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePassword.classList.toggle('fa-eye-slash');
    togglePassword.classList.toggle('fa-eye');
  });
}

function initForgotPassword() {
  const forgotLink = document.getElementById('forgotPassword');
  forgotLink.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('📧 Password reset link sent to your email');
  });
}

function initFormValidation() {
  emailInput.addEventListener('input', validateForm);
  passwordInput.addEventListener('input', validateForm);
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  if (!email || !password) {
    showError('❌ Email and password are required.');
    return;
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    showError('❌ Please enter a valid email address.');
    return;
  }
  setLoading(true);
  try {
    await new Promise(resolve => setTimeout(resolve, 800)); // simulate network
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const foundUser = users.find(u => u.email === email);
    if (!foundUser) {
      showError('User not found. Please sign up first.');
      setLoading(false);
      return;
    }
    if (foundUser.password !== password) {
      showError('Incorrect password.');
      setLoading(false);
      return;
    }
    const roleToUse = foundUser.role;
    // Ensure role matches selected? We'll trust stored role
    saveSession(roleToUse, email);
    showToast('✅ Login successful. Redirecting...');
    setTimeout(() => redirectToDashboard(roleToUse), 800);
  } catch (err) {
    showError('⚠️ Login failed. Please try again.');
    setLoading(false);
  }
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

document.addEventListener('DOMContentLoaded', () => {
  if (checkExistingSession()) return;
  initMobileNav();
  loadStoredRole();
  initRoleSwitcher();
  initPasswordToggle();
  initForgotPassword();
  initFormValidation();
  loginForm.addEventListener('submit', handleLoginSubmit);
  validateForm();
});