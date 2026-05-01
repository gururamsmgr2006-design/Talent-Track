// Sample company data
const companiesData = [
  {
    id: 1,
    name: "Google",
    location: "Mountain View, CA & Global",
    description: "Innovative tech giant shaping the future of search, cloud, and AI.",
    logoInitial: "G"
  },
  {
    id: 2,
    name: "Microsoft",
    location: "Redmond, WA & Worldwide",
    description: "Empowering every person and organization on the planet.",
    logoInitial: "M"
  },
  {
    id: 3,
    name: "Amazon",
    location: "Seattle, WA & Global",
    description: "E-commerce, cloud computing, and digital streaming leader.",
    logoInitial: "A"
  },
  {
    id: 4,
    name: "Infosys",
    location: "Bengaluru, India & Global",
    description: "Consulting and IT services powerhouse.",
    logoInitial: "I"
  },
  {
    id: 5,
    name: "TCS",
    location: "Mumbai, India & Worldwide",
    description: "Global IT services and consulting firm.",
    logoInitial: "T"
  },
  {
    id: 6,
    name: "Apple",
    location: "Cupertino, CA",
    description: "Design, develop, and sell consumer electronics and software.",
    logoInitial: "A"
  },
  {
    id: 7,
    name: "Meta",
    location: "Menlo Park, CA & Remote",
    description: "Building the future of social connection and metaverse.",
    logoInitial: "M"
  },
  {
    id: 8,
    name: "Netflix",
    location: "Los Gatos, CA & Global",
    description: "Leading streaming entertainment service.",
    logoInitial: "N"
  },
  {
    id: 9,
    name: "Adobe",
    location: "San Jose, CA",
    description: "Creative and digital marketing software leader.",
    logoInitial: "A"
  },
  {
    id: 10,
    name: "Salesforce",
    location: "San Francisco, CA & Remote",
    description: "Customer relationship management platform.",
    logoInitial: "S"
  }
];

// DOM elements
const companiesGrid = document.getElementById('companiesGrid');
const searchInput = document.getElementById('companySearch');

// Render companies based on search term
function renderCompanies(filterText = '') {
  const filteredCompanies = companiesData.filter(company =>
    company.name.toLowerCase().includes(filterText.toLowerCase())
  );

  if (filteredCompanies.length === 0) {
    companiesGrid.innerHTML = `<div class="no-results"><i class="fas fa-building"></i> No companies match "${escapeHtml(filterText)}". Try another name.</div>`;
    return;
  }

  companiesGrid.innerHTML = filteredCompanies.map(company => `
    <div class="company-card" data-id="${company.id}">
      <div class="company-logo">${escapeHtml(company.logoInitial)}</div>
      <div class="company-name">${escapeHtml(company.name)}</div>
      <div class="company-location"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(company.location)}</div>
      <div class="company-description">${escapeHtml(company.description)}</div>
      <button class="view-jobs-btn" data-name="${escapeHtml(company.name)}">View Jobs</button>
    </div>
  `).join('');

  // Attach event listeners to "View Jobs" buttons
  document.querySelectorAll('.view-jobs-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const companyName = btn.getAttribute('data-name');
      // Save selected company to localStorage
      localStorage.setItem('selectedCompany', companyName);
      // Redirect to jobs page (relative path – adjust if needed)
      window.location.href = 'jobs.html';
    });
  });
}

// Helper: escape HTML to prevent injection
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

// Live search handler
function initSearch() {
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderCompanies(e.target.value);
    });
  }
}

// Mobile navbar toggle (consistent with other pages)
function initMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
    // Close mobile menu when a link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('active'));
    });
  }
}

// Initialize page
function init() {
  initMobileNav();
  initSearch();
  renderCompanies(); // initial render with no filter
}

init();