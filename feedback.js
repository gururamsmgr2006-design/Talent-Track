// DOM elements
const feedbackForm = document.getElementById('feedbackForm');
const formStatus = document.getElementById('formStatus');

// Target email address (simulated)
const DEV_EMAIL = 'gururamsmgr2006@gmail.com';

// Helper: display message with type
function showMessage(message, isSuccess = true) {
  formStatus.innerHTML = message;
  formStatus.style.color = isSuccess ? '#059669' : '#dc2626';
  formStatus.style.fontWeight = '500';
  
  // Clear message after 5 seconds
  setTimeout(() => {
    if (formStatus.innerHTML === message) {
      formStatus.innerHTML = '';
    }
  }, 5000);
}

// Simulate sending email (frontend only)
function simulateSendEmail(feedbackData) {
  // In a real app, you'd use an API endpoint.
  // Here we just log to console and show user message.
  console.log('📧 Feedback email simulation to:', DEV_EMAIL);
  console.log('Feedback data:', feedbackData);
  
  // Show success message with developer email
  showMessage(`✅ Thank you! Your feedback has been sent to the developer (${DEV_EMAIL}).`, true);
}

// Handle form submission
function handleFeedbackSubmit(event) {
  event.preventDefault();
  
  // Get form values
  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const feedbackType = document.getElementById('feedbackType').value;
  const message = document.getElementById('message').value.trim();
  
  // Basic validation
  if (!fullName || !email || !feedbackType || !message) {
    showMessage('❌ Please fill in all fields before submitting.', false);
    return;
  }
  
  // Email format validation (simple)
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    showMessage('❌ Please enter a valid email address.', false);
    return;
  }
  
  // Prepare feedback object
  const feedbackData = {
    fullName,
    email,
    feedbackType,
    message,
    submittedAt: new Date().toISOString()
  };
  
  // Simulate sending to developer email
  simulateSendEmail(feedbackData);
  
  // Reset form fields
  feedbackForm.reset();
  
  // Optional: clear any previous select default
  const selectEl = document.getElementById('feedbackType');
  selectEl.value = '';
}

// Mobile navbar toggle
function initMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('active'));
    });
  }
}

// Simple fade-in animation for form section
function initFadeIn() {
  const feedbackSection = document.querySelector('.feedback-section');
  if (feedbackSection) {
    feedbackSection.style.opacity = '0';
    feedbackSection.style.transform = 'translateY(15px)';
    feedbackSection.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    setTimeout(() => {
      feedbackSection.style.opacity = '1';
      feedbackSection.style.transform = 'translateY(0)';
    }, 100);
  }
}

// Initialize all
document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initFadeIn();
  
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', handleFeedbackSubmit);
  }
});