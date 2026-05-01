// home.js - TalentTrack portal dynamic behaviour

// DOM elements
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initFiltersAndSearch();
  fetchJobsFromAPI();
  renderInternships();       // static premium data + fallback
  initChatbot();
  initRatingStars();
  initHeroButtons();
  initSaveBookmarkIcons();
  initViewMoreJobs();
});

// ----------------------------- NAVBAR MOBILE TOGGLE -------------------------
function initNavbar() {
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

// ----------------------------- SEARCH & CATEGORY FILTER ----------------------
let currentCategory = '';
let currentSearch = '';
let jobsDataGlobal = [];      // store latest job array from API or fallback

function initFiltersAndSearch() {
  const chips = document.querySelectorAll('.filter-chips span');
  const searchInput = document.getElementById('jobSearchInput');

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentCategory = chip.getAttribute('data-category') || chip.innerText.toLowerCase();
      filterJobsAndDisplay();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value.toLowerCase();
      filterJobsAndDisplay();
      filterInternships(currentSearch);
    });
  }
}

function filterJobsAndDisplay() {
  if (!jobsDataGlobal.length) return;
  let filtered = [...jobsDataGlobal];
  if (currentCategory) {
    filtered = filtered.filter(job => 
      job.category?.toLowerCase().includes(currentCategory) ||
      job.title?.toLowerCase().includes(currentCategory) ||
      job.company?.toLowerCase().includes(currentCategory)
    );
  }
  if (currentSearch) {
    filtered = filtered.filter(job => 
      job.title.toLowerCase().includes(currentSearch) ||
      job.company.toLowerCase().includes(currentSearch) ||
      (job.location && job.location.toLowerCase().includes(currentSearch))
    );
  }
  renderJobCards(filtered.slice(0, 6));
}

// ----------------------------- FETCH JOBS (Adzuna style with fallback) ------
async function fetchJobsFromAPI() {
  const jobsGrid = document.getElementById('jobsGrid');
  jobsGrid.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-pulse"></i> Fetching opportunities...</div>';
  
  try {
    // Using a free test API (Remotive.io - public job API, CORS friendly, real data)
    const response = await fetch('https://remotive.com/api/remote-jobs?limit=12');
    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    if (data.jobs && data.jobs.length) {
      const transformed = data.jobs.slice(0, 8).map(job => ({
        id: job.id,
        title: job.title,
        company: job.company_name,
        location: job.candidate_required_location || 'Remote / Worldwide',
        salary: job.salary || 'Competitive',
        url: job.url,
        category: job.category || 'software'
      }));
      jobsDataGlobal = transformed;
      renderJobCards(transformed.slice(0, 6));
    } else {
      useFallbackJobs();
    }
  } catch (error) {
    console.warn('API failed, using sample jobs', error);
    useFallbackJobs();
  }
}

function useFallbackJobs() {
  const fallback = [
    { id: 1, title: 'Senior Frontend Engineer', company: 'Stripe', location: 'San Francisco / Remote', salary: '$145k - $180k', url: '#', category: 'software' },
    { id: 2, title: 'Data Analyst', company: 'Netflix', location: 'Los Gatos, CA', salary: '$110k - $140k', url: '#', category: 'analytics' },
    { id: 3, title: 'Product Manager', company: 'Atlassian', location: 'New York / Hybrid', salary: '$130k - $165k', url: '#', category: 'project' },
    { id: 4, title: 'DevOps Engineer', company: 'Spotify', location: 'Stockholm / Remote EU', salary: '€90k - €120k', url: '#', category: 'software' },
    { id: 5, title: 'Banking Consultant', company: 'Goldman Sachs', location: 'London', salary: '£85k - £110k', url: '#', category: 'banking' },
    { id: 6, title: 'Sales Development Rep', company: 'Salesforce', location: 'Austin, TX', salary: '$70k + commission', url: '#', category: 'sales' }
  ];
  jobsDataGlobal = fallback;
  renderJobCards(fallback);
}


  function renderJobCards(jobs) {
  const grid = document.getElementById('jobsGrid');
  if (!grid) return;

  if (!jobs.length) {
    grid.innerHTML = '<div style="text-align:center">No matching jobs found. Try other filters.</div>';
    return;
  }

  grid.innerHTML = jobs.map(job => `
    <div class="job-card" data-job-id="${job.id}">
      <div class="job-header">
        <div class="job-title">${escapeHtml(job.title)}</div>
        <i class="far fa-bookmark save-icon" data-id="${job.id}"></i>
      </div>
      <div class="company"><i class="fas fa-building"></i> ${escapeHtml(job.company)}</div>
      <div class="location"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(job.location)}</div>
      <div class="salary"><i class="fas fa-dollar-sign"></i> ${escapeHtml(job.salary)}</div>
      <button class="apply-btn" data-url="${job.url || '#'}">Apply Now →</button>
    </div>
  `).join('');

  // 🔥 ADD THIS PART HERE
  const savedJobs = JSON.parse(localStorage.getItem('savedJobs')) || [];

  document.querySelectorAll('.save-icon').forEach(icon => {
    const id = icon.getAttribute('data-id');
    if (savedJobs.includes(id)) {
      icon.classList.remove('far');
      icon.classList.add('fas');
    }
  });


  attachApplyEvents();
  attachSaveEvents();
}

// ----------------------------- INTERNSHIPS SECTION (static curated with Paid/Unpaid) -----
  let internshipsGlobal = [];
function renderInternships() {
  const internships = [
    { title: 'Product Marketing Intern', company: 'Google', location: 'Mountain View', paid: 'Paid ($35/hr)', category: 'marketing' },
    { title: 'Software Dev Intern', company: 'Microsoft', location: 'Redmond', paid: 'Paid ($42/hr)', category: 'software' },
    { title: 'Data Science Intern', company: 'JP Morgan', location: 'New York', paid: 'Paid ($38/hr)', category: 'analytics' },
    { title: 'Graphic Design Intern', company: 'Airbnb', location: 'Remote', paid: 'Unpaid (Academic Credit)', category: 'design' },
    { title: 'Finance Intern', company: 'BlackRock', location: 'San Francisco', paid: 'Paid ($30/hr)', category: 'banking' }
  ];
    internshipsGlobal = internships;
  const container = document.getElementById('internshipsGrid');
  if (!container) return;
  container.innerHTML = internships.map(intern => `
    <div class="intern-card">
      <div class="intern-header">
        <div class="intern-title">${escapeHtml(intern.title)}</div>
        <i class="far fa-bookmark save-icon" data-intern="true"></i>
      </div>
      <div class="company">${escapeHtml(intern.company)}</div>
      <div class="location">📍 ${escapeHtml(intern.location)}</div>
      <span class="badge">${escapeHtml(intern.paid)}</span>
      <button class="apply-btn">Apply for Internship</button>
    </div>
  `).join('');
  attachSaveEvents(); 
}
function filterInternships(search) {
  const filtered = internshipsGlobal.filter(intern =>
    intern.title.toLowerCase().includes(search) ||
    intern.company.toLowerCase().includes(search)
  );

  renderFilteredInternships(filtered);
}

function renderFilteredInternships(data) {
  const container = document.getElementById('internshipsGrid');

  container.innerHTML = data.map(intern => `
    <div class="intern-card">
      <div class="intern-header">
        <div class="intern-title">${intern.title}</div>
      </div>
      <div class="company">${intern.company}</div>
      <div class="location">📍 ${intern.location}</div>
      <span class="badge">${intern.paid}</span>
    </div>
  `).join('');
}

// ----------------------------- CHATBOT (Keyword logic + career guidance) ----------
function initChatbot() {
  const icon = document.getElementById('chatbotIcon');
  const chatWin = document.getElementById('chatWindow');
  const closeBtn = document.getElementById('closeChat');
  const sendBtn = document.getElementById('sendChatMsg');
  const chatInput = document.getElementById('chatInput');
  const messagesDiv = document.getElementById('chatMessages');

  function toggleChat() {
    chatWin.classList.toggle('open');
  }
  icon.addEventListener('click', toggleChat);
  if (closeBtn) closeBtn.addEventListener('click', () => chatWin.classList.remove('open'));

  function addBotMessage(text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'bot-msg';
    msgDiv.innerText = text;
    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
  function addUserMessage(text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'user-msg';
    msgDiv.innerText = text;
    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  function getBotReply(userMsg) {
    const msg = userMsg.toLowerCase();
    if (msg.includes('job') || msg.includes('career')) return "Explore 'Featured Jobs' above! Use category filters to find your perfect role. Which field interests you? (Software, Banking, Marketing etc.)";
    if (msg.includes('internship')) return "We have paid internships at top firms like Google, Microsoft. Check the Internships section. Want tips to get selected?";
    if (msg.includes('resume') || msg.includes('cv')) return "Keep your resume ATS-friendly, highlight metrics. Would you like a template recommendation?";
    if (msg.includes('salary') || msg.includes('pay')) return "Salaries vary by role. Use our job cards to see salary ranges or apply directly to negotiate!";
    if (msg.includes('navigate') || msg.includes('help')) return "You can use top navbar, search jobs, or apply via cards. I'm here to guide!";
    if (msg.includes('thank')) return "You're welcome! Happy job hunting! 🚀";
    return "I can help you find jobs, internships, resume tips, and more. Try asking: 'software jobs', 'internship', or 'resume advice'.";
  }

  function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    addUserMessage(text);
    chatInput.value = '';
    setTimeout(() => {
      const reply = getBotReply(text);
      addBotMessage(reply);
    }, 300);
  }
  sendBtn.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
  addBotMessage("Hi! I'm CareerGuide. Ask about jobs, internships, resume building, or navigation.");
}

// ----------------------------- RATING STARS (feedback) --------------------------------
function initRatingStars() {
  const stars = document.querySelectorAll('#ratingStars i');
  const msgSpan = document.getElementById('ratingMessage');
  stars.forEach(star => {
    star.addEventListener('click', function() {
      const rating = parseInt(this.getAttribute('data-rating'));
      stars.forEach((s, idx) => {
        if (idx < rating) {
          s.classList.remove('far');
          s.classList.add('fas', 'active-star');
        } else {
          s.classList.remove('fas', 'active-star');
          s.classList.add('far');
        }
      });
      msgSpan.innerText = `⭐ Thanks for rating ${rating}/5! We appreciate you.`;
    });
  });
}

// helper: escape html & events
function escapeHtml(str) { return str.replace(/[&<>]/g, function(m){if(m==='&') return '&amp;'; if(m==='<') return '&lt;'; if(m==='>') return '&gt;'; return m;}); }

function attachApplyEvents() {
  document.querySelectorAll('.apply-btn').forEach(btn => {
    btn.removeEventListener('click', applyHandler);
    btn.addEventListener('click', applyHandler);
  });
}
function applyHandler(e) {
  const url = this.getAttribute('data-url');
  if (url && url !== '#') window.open(url, '_blank');
  else alert('Application link will be available soon!');
}
function attachSaveEvents() {
  document.querySelectorAll('.save-icon').forEach(icon => {
    icon.removeEventListener('click', saveHandler);
    icon.addEventListener('click', saveHandler);
  });
}
function saveHandler(e) {
  e.stopPropagation();

  const jobCard = this.closest('.job-card');
  const jobId = this.getAttribute('data-id') || jobCard?.getAttribute('data-job-id');

  let savedJobs = JSON.parse(localStorage.getItem('savedJobs')) || [];

  if (savedJobs.includes(jobId)) {
    savedJobs = savedJobs.filter(id => id !== jobId);
    this.classList.remove('fas');
    this.classList.add('far');
    alert('Removed from saved');
  } else {
    savedJobs.push(jobId);
    this.classList.remove('far');
    this.classList.add('fas');
    alert('Saved successfully!');
  }

  localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
}

function initHeroButtons() {
  const browse = document.getElementById('browseJobsBtn');
  const exploreIntern = document.getElementById('exploreInternshipsBtn');
  if(browse) browse.addEventListener('click', () => document.getElementById('featuredJobsSection')?.scrollIntoView({behavior: 'smooth'}));
  if(exploreIntern) exploreIntern.addEventListener('click', () => document.getElementById('internshipSection')?.scrollIntoView({behavior: 'smooth'}));
}
function initSaveBookmarkIcons() { } // already used
function initViewMoreJobs() {
  const btn = document.getElementById('viewMoreJobsBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    renderJobCards(jobsDataGlobal);
  });
}
window.addEventListener("load", () => {
  document.getElementById("loader").style.display = "none";
});

// Internet detection
if (!navigator.onLine) {
  alert("⚠️ You are offline. Some features may not work.");
}
function toggleDarkMode() {
  document.body.classList.toggle("dark");

  let isDark = document.body.classList.contains("dark");
  localStorage.setItem("theme", isDark);
}

// Load saved theme
window.onload = () => {
  if (localStorage.getItem("theme") === "true") {
    document.body.classList.add("dark");
  }
};