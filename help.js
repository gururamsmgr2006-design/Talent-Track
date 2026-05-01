// FAQ Data
const faqData = [
  {
    question: "How do I apply for a job?",
    answer: "Click on any job card, then press 'Apply Now'. You'll be redirected to the application form or company page to submit your details."
  },
  {
    question: "How do I save a job?",
    answer: "On any job or internship card, click the bookmark icon. Saved jobs will appear in your personal dashboard (coming soon!)."
  },
  {
    question: "Why am I not seeing any jobs?",
    answer: "Try adjusting your search filters (location, category) or clearing them. We constantly add new listings — check back later."
  },
  {
    question: "Is TalentTrack free to use?",
    answer: "Yes! TalentTrack is completely free for job seekers. No hidden fees or subscriptions."
  },
  {
    question: "How do I filter jobs?",
    answer: "Use the search bar and category chips on the Jobs page. You can filter by Remote, Full-time, Internship, location, and more."
  }
];

// Render FAQ accordion dynamically
function renderFAQ() {
  const faqList = document.getElementById('faqList');
  if (!faqList) return;
  
  faqList.innerHTML = faqData.map((item, index) => `
    <div class="faq-item" data-index="${index}">
      <div class="faq-question">
        <span>${escapeHtml(item.question)}</span>
        <i class="fas fa-chevron-down"></i>
      </div>
      <div class="faq-answer">
        <p>${escapeHtml(item.answer)}</p>
      </div>
    </div>
  `).join('');
  
  // Add click event to each FAQ item
  document.querySelectorAll('.faq-item').forEach(item => {
    const questionDiv = item.querySelector('.faq-question');
    questionDiv.addEventListener('click', () => {
      // Close other open items (optional but better UX)
      document.querySelectorAll('.faq-item').forEach(other => {
        if (other !== item && other.classList.contains('active')) {
          other.classList.remove('active');
        }
      });
      item.classList.toggle('active');
    });
  });
}

// Helper: escape HTML
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

// Contact form handling (UI only, no backend)
function initContactForm() {
  const form = document.getElementById('contactForm');
  const messageDiv = document.getElementById('formMessage');
  
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const message = document.getElementById('message').value.trim();
      
      if (name && email && message) {
        messageDiv.innerHTML = '<i class="fas fa-check-circle"></i> Thanks! Our team will reach out soon.';
        messageDiv.style.color = '#059669';
        form.reset();
        setTimeout(() => {
          messageDiv.innerHTML = '';
        }, 5000);
      } else {
        messageDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please fill all fields.';
        messageDiv.style.color = '#dc2626';
        setTimeout(() => {
          messageDiv.innerHTML = '';
        }, 3000);
      }
    });
  }
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

// Optional: Smooth scroll animations for section appearance
function initScrollReveal() {
  const sections = document.querySelectorAll('.faq-section, .support-categories, .quick-tips, .contact-support');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  sections.forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(section);
  });
}

// Initialize all
document.addEventListener('DOMContentLoaded', () => {
  renderFAQ();
  initContactForm();
  initMobileNav();
  initScrollReveal();
});