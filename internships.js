// DOM Elements
let allInternships = [];
let displayedInternships = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 9;  // 9 internships initially, load more adds next 9

// DOM refs
const internshipsGrid = document.getElementById('internshipsGrid');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const countSpan = document.getElementById('internshipsCount');
const searchKeyword = document.getElementById('searchKeyword');
const locationFilter = document.getElementById('locationFilter');
const categoryFilter = document.getElementById('categoryFilter');
const typeFilter = document.getElementById('typeFilter');
const resetFiltersBtn = document.getElementById('resetFiltersBtn');

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

// Helper: format duration (if missing, default)
function formatDuration(intern) {
  if (intern.duration) return intern.duration;
  return "3-6 months";
}

// Category mapping based on title/company
function inferCategory(title, company) {
  const text = (title + " " + company).toLowerCase();
  if (text.includes('software') || text.includes('developer') || text.includes('engineering')) return 'software';
  if (text.includes('market') || text.includes('sales') || text.includes('growth')) return 'marketing';
  if (text.includes('finance') || text.includes('bank') || text.includes('account')) return 'finance';
  if (text.includes('design') || text.includes('ui') || text.includes('ux')) return 'design';
  if (text.includes('data') || text.includes('analytics')) return 'data';
  return 'software';
}

// Infer type from location string
function inferType(location) {
  const loc = location.toLowerCase();
  if (loc.includes('remote')) return 'remote';
  if (loc.includes('hybrid')) return 'hybrid';
  return 'onsite';
}

// Fetch internships from API (Remotive with fallback)
async function fetchInternshipsFromAPI() {
  internshipsGrid.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-pulse"></i> Fetching internships...</div>';
  try {
    // Remotive API has remote jobs; we'll filter for internship keywords or mix with fallback
    const response = await fetch('https://remotive.com/api/remote-jobs?limit=40');
    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    if (data.jobs && data.jobs.length) {
      // Filter jobs that contain "intern" or "trainee" in title, otherwise use fallback to ensure internship relevance
      const internshipJobs = data.jobs.filter(job => 
        job.title.toLowerCase().includes('intern') || 
        job.title.toLowerCase().includes('trainee') ||
        job.category?.toLowerCase().includes('intern')
      );
      if (internshipJobs.length >= 6) {
        allInternships = internshipJobs.slice(0, 30).map(job => ({
          id: job.id,
          title: job.title,
          company: job.company_name,
          location: job.candidate_required_location || 'Remote',
          paid: job.salary ? 'Paid' : 'Unpaid',
          salaryInfo: job.salary || 'Not specified',
          duration: '3-6 months',
          url: job.url,
          category: inferCategory(job.title, job.company_name),
          type: inferType(job.candidate_required_location || '')
        }));
      } else {
        useFallbackInternships();
      }
    } else {
      useFallbackInternships();
    }
  } catch (error) {
    console.warn('API failed, using curated fallback internships', error);
    useFallbackInternships();
  }
  applyFiltersAndReset();
}

// Rich fallback data with realistic internships (Google, Microsoft, etc.)
function useFallbackInternships() {
  allInternships = [
    { id: 1, title: "Software Engineering Intern", company: "Google", location: "Mountain View, CA (Hybrid)", paid: "Paid", salaryInfo: "$45/hr", duration: "12 weeks", url: "#", category: "software", type: "hybrid" },
    { id: 2, title: "Product Marketing Intern", company: "Microsoft", location: "Redmond, WA (Remote)", paid: "Paid", salaryInfo: "$38/hr", duration: "10 weeks", url: "#", category: "marketing", type: "remote" },
    { id: 3, title: "Finance Analyst Intern", company: "Goldman Sachs", location: "New York, NY (On-site)", paid: "Paid", salaryInfo: "$42/hr", duration: "8 weeks", url: "#", category: "finance", type: "onsite" },
    { id: 4, title: "UI/UX Design Intern", company: "Airbnb", location: "San Francisco, CA (Hybrid)", paid: "Paid", salaryInfo: "$40/hr", duration: "12 weeks", url: "#", category: "design", type: "hybrid" },
    { id: 5, title: "Data Science Intern", company: "Netflix", location: "Los Gatos, CA (Remote)", paid: "Paid", salaryInfo: "$50/hr", duration: "12 weeks", url: "#", category: "data", type: "remote" },
    { id: 6, title: "Business Development Intern", company: "Salesforce", location: "Austin, TX (On-site)", paid: "Paid", salaryInfo: "$35/hr", duration: "10 weeks", url: "#", category: "marketing", type: "onsite" },
    { id: 7, title: "Frontend Intern", company: "Stripe", location: "Remote (US)", paid: "Paid", salaryInfo: "$44/hr", duration: "12 weeks", url: "#", category: "software", type: "remote" },
    { id: 8, title: "Digital Marketing Intern", company: "HubSpot", location: "Remote", paid: "Unpaid (Academic Credit)", salaryInfo: "Expenses covered", duration: "3 months", url: "#", category: "marketing", type: "remote" },
    { id: 9, title: "Investment Banking Intern", company: "JPMorgan Chase", location: "New York, NY", paid: "Paid", salaryInfo: "$48/hr", duration: "10 weeks", url: "#", category: "finance", type: "onsite" },
    { id: 10, title: "Graphic Design Intern", company: "Spotify", location: "Remote", paid: "Paid", salaryInfo: "$32/hr", duration: "6 months", url: "#", category: "design", type: "remote" },
    { id: 11, title: "Data Analytics Intern", company: "Amazon", location: "Seattle, WA (Hybrid)", paid: "Paid", salaryInfo: "$46/hr", duration: "12 weeks", url: "#", category: "data", type: "hybrid" },
    { id: 12, title: "Marketing Intern", company: "Apple", location: "Cupertino, CA", paid: "Paid", salaryInfo: "$42/hr", duration: "10 weeks", url: "#", category: "marketing", type: "onsite" },
    { id: 13, title: "Software Engineer Intern", company: "Meta", location: "Menlo Park, CA (Remote)", paid: "Paid", salaryInfo: "$52/hr", duration: "12 weeks", url: "#", category: "software", type: "remote" },
    { id: 14, title: "Product Design Intern", company: "Adobe", location: "San Jose, CA", paid: "Paid", salaryInfo: "$39/hr", duration: "12 weeks", url: "#", category: "design", type: "onsite" }
  ];
}

// Filter internships based on search, location, category, type
function filterInternships() {
  const keyword = searchKeyword.value.trim().toLowerCase();
  const location = locationFilter.value.trim().toLowerCase();
  const category = categoryFilter.value;
  const type = typeFilter.value;

  let filtered = allInternships.filter(intern => {
    if (keyword && !intern.title.toLowerCase().includes(keyword) && !intern.company.toLowerCase().includes(keyword)) return false;
    if (location && !intern.location.toLowerCase().includes(location)) return false;
    if (category && intern.category !== category) return false;
    if (type && intern.type !== type) return false;
    return true;
  });
  return filtered;
}

// Render internships with current page slice (using displayedInternships)
function renderInternships() {
  if (!displayedInternships.length) {
    internshipsGrid.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-circle"></i> No internships match your filters. Try adjusting criteria.</div>';
    countSpan.innerText = '0';
    loadMoreBtn.style.display = 'none';
    return;
  }

  const start = 0;
  const end = currentPage * ITEMS_PER_PAGE;
  const itemsToShow = displayedInternships.slice(0, end);
  
  if (itemsToShow.length === 0) {
    internshipsGrid.innerHTML = '<div class="error-message">No internships loaded.</div>';
    return;
  }

  // Retrieve saved internships from localStorage
  const savedInterns = JSON.parse(localStorage.getItem('savedInternships') || '[]');

  internshipsGrid.innerHTML = itemsToShow.map(intern => `
    <div class="intern-card" data-id="${intern.id}">
      <div class="card-header">
        <div class="intern-title">${escapeHtml(intern.title)}</div>
        <i class="far fa-bookmark save-icon ${savedInterns.includes(intern.id) ? 'saved fas' : 'far'}" data-id="${intern.id}"></i>
      </div>
      <div class="company"><i class="fas fa-building"></i> ${escapeHtml(intern.company)}</div>
      <div class="intern-details">
        <span><i class="fas fa-map-marker-alt"></i> ${escapeHtml(intern.location)}</span>
        <span class="${intern.paid === 'Paid' ? 'paid-badge' : 'unpaid-badge'}">${intern.paid === 'Paid' ? '💰 Paid' : '📘 Unpaid'}</span>
        <span class="duration"><i class="far fa-calendar-alt"></i> ${escapeHtml(formatDuration(intern))}</span>
      </div>
      ${intern.salaryInfo && intern.paid === 'Paid' ? `<div class="salary-info" style="font-size:0.8rem; color:#059669;"><i class="fas fa-dollar-sign"></i> ${escapeHtml(intern.salaryInfo)}</div>` : ''}
      <button class="apply-btn" data-url="${intern.url}">Apply Now →</button>
    </div>
  `).join('');

  countSpan.innerText = displayedInternships.length;
  
  if (displayedInternships.length <= currentPage * ITEMS_PER_PAGE) {
    loadMoreBtn.style.display = 'none';
  } else {
    loadMoreBtn.style.display = 'inline-block';
  }

  attachApplyButtons();
  attachSaveEvents();
}

function attachApplyButtons() {
  document.querySelectorAll('.apply-btn').forEach(btn => {
    btn.removeEventListener('click', applyHandler);
    btn.addEventListener('click', applyHandler);
  });
}

function applyHandler(e) {
  const url = this.getAttribute('data-url');
  if (url && url !== '#') {
    window.open(url, '_blank');
  } else {
    alert('Application link will be shared by the employer. Check company career page.');
  }
}

function attachSaveEvents() {
  document.querySelectorAll('.save-icon').forEach(icon => {
    icon.removeEventListener('click', saveHandler);
    icon.addEventListener('click', saveHandler);
  });
}

function saveHandler(e) {
  e.stopPropagation();
  const internId = parseInt(this.getAttribute('data-id'));
  let savedInterns = JSON.parse(localStorage.getItem('savedInternships') || '[]');
  if (savedInterns.includes(internId)) {
    savedInterns = savedInterns.filter(id => id !== internId);
    this.classList.remove('fas', 'saved');
    this.classList.add('far');
    showToast('Removed from saved internships');
  } else {
    savedInterns.push(internId);
    this.classList.remove('far');
    this.classList.add('fas', 'saved');
    showToast('Internship saved!');
  }
  localStorage.setItem('savedInternships', JSON.stringify(savedInterns));
}

function showToast(msg) {
  let toast = document.querySelector('.custom-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = '#1f2937';
    toast.style.color = 'white';
    toast.style.padding = '0.5rem 1rem';
    toast.style.borderRadius = '40px';
    toast.style.fontSize = '0.85rem';
    toast.style.zIndex = '9999';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.2s';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  setTimeout(() => { toast.style.opacity = '0'; }, 2000);
}

// Reset filters and re-render
function applyFiltersAndReset() {
  const filtered = filterInternships();
  displayedInternships = [...filtered];
  currentPage = 1;
  renderInternships();
}

// Load more internships (increase page)
function loadMoreInternships() {
  if (displayedInternships.length > currentPage * ITEMS_PER_PAGE) {
    currentPage++;
    renderInternships();
  } else {
    loadMoreBtn.style.display = 'none';
  }
}

// Event listeners for filters
function initEventListeners() {
  searchKeyword.addEventListener('input', () => applyFiltersAndReset());
  locationFilter.addEventListener('input', () => applyFiltersAndReset());
  categoryFilter.addEventListener('change', () => applyFiltersAndReset());
  typeFilter.addEventListener('change', () => applyFiltersAndReset());
  resetFiltersBtn.addEventListener('click', () => {
    searchKeyword.value = '';
    locationFilter.value = '';
    categoryFilter.value = '';
    typeFilter.value = '';
    applyFiltersAndReset();
  });
  loadMoreBtn.addEventListener('click', loadMoreInternships);
}

// Mobile navbar toggle
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

// Initialize page
function init() {
  initMobileNav();
  initEventListeners();
  fetchInternshipsFromAPI();
}

init();