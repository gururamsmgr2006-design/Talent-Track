// DOM Elements
let allJobs = [];           // full job list from API
let displayedJobs = [];     // currently rendered subset (for load more)
let currentPage = 1;
const JOBS_PER_PAGE = 10;
let isLoading = false;

// DOM refs
const jobsGrid = document.getElementById('jobsGrid');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const jobsCountSpan = document.getElementById('jobsCount');
const searchKeyword = document.getElementById('searchKeyword');
const locationFilter = document.getElementById('locationFilter');
const categoryFilter = document.getElementById('categoryFilter');
const jobTypeFilter = document.getElementById('jobTypeFilter');
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

// Format salary from text
function formatSalary(job) {
  if (job.salary) return job.salary;
  if (job.min_salary && job.max_salary) return `$${job.min_salary/1000}k - $${job.max_salary/1000}k`;
  return 'Competitive';
}

// Map category from job title / tags (simplified)
function inferCategory(job) {
  const title = job.title.toLowerCase();
  if (title.includes('software') || title.includes('developer') || title.includes('engineer')) return 'software';
  if (title.includes('finance') || title.includes('bank') || title.includes('account')) return 'finance';
  if (title.includes('market') || title.includes('sales') || title.includes('growth')) return 'marketing';
  if (title.includes('design') || title.includes('ui') || title.includes('ux')) return 'design';
  if (title.includes('data') || title.includes('analyst')) return 'data';
  if (title.includes('project') || title.includes('product')) return 'project';
  return 'software';
}

// Infer job type from location / title
function inferJobType(job) {
  const loc = job.candidate_required_location?.toLowerCase() || '';
  if (loc.includes('remote')) return 'remote';
  if (job.title?.toLowerCase().includes('intern')) return 'internship';
  return 'fulltime';
}

// Fetch from Remotive API
async function fetchJobsFromAPI() {
  jobsGrid.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-pulse"></i> Fetching live jobs...</div>';
  try {
    const response = await fetch('https://remotive.com/api/remote-jobs?limit=50');
    if (!response.ok) throw new Error('API response error');
    const data = await response.json();
    if (data.jobs && data.jobs.length) {
      allJobs = data.jobs.map(job => ({
        id: job.id,
        title: job.title,
        company: job.company_name,
        location: job.candidate_required_location || 'Remote / Anywhere',
        salary: job.salary || (job.min_salary ? `$${job.min_salary/1000}k - $${job.max_salary/1000}k` : 'Not specified'),
        url: job.url,
        category: inferCategory(job),
        jobType: inferJobType(job),
        description: job.description?.substring(0, 100) || ''
      }));
      applyFiltersAndReset();
    } else {
      useFallbackJobs();
    }
  } catch (error) {
    console.warn('API failed, using fallback data', error);
    jobsGrid.innerHTML = `
    <div class="error-message">
      ⚠️ Unable to load live jobs. Showing sample jobs instead.
    </div>
  `;
    useFallbackJobs();
  }
}

// Fallback job data (realistic sample)
function useFallbackJobs() {
  allJobs = [
    { id: 1, title: "Senior Frontend Engineer", company: "Stripe", location: "Remote (US)", salary: "$150k - $185k", url: "#", category: "software", jobType: "remote" },
    { id: 2, title: "Data Analyst", company: "Netflix", location: "Los Gatos, CA", salary: "$110k - $140k", url: "#", category: "data", jobType: "fulltime" },
    { id: 3, title: "Product Marketing Manager", company: "HubSpot", location: "Remote", salary: "$120k - $150k", url: "#", category: "marketing", jobType: "remote" },
    { id: 4, title: "Software Engineer Intern", company: "Microsoft", location: "Redmond, WA", salary: "$45/hr", url: "#", category: "software", jobType: "internship" },
    { id: 5, title: "Finance Analyst", company: "Goldman Sachs", location: "New York, NY", salary: "$95k - $120k", url: "#", category: "finance", jobType: "fulltime" },
    { id: 6, title: "UI/UX Designer", company: "Airbnb", location: "San Francisco, CA", salary: "$130k - $165k", url: "#", category: "design", jobType: "fulltime" },
    { id: 7, title: "DevOps Engineer", company: "Spotify", location: "Remote EU", salary: "€85k - €110k", url: "#", category: "software", jobType: "remote" },
    { id: 8, title: "Project Manager", company: "Atlassian", location: "Sydney / Remote", salary: "$140k - $170k", url: "#", category: "project", jobType: "fulltime" },
    { id: 9, title: "Sales Development Rep", company: "Salesforce", location: "Austin, TX", salary: "$70k + commission", url: "#", category: "marketing", jobType: "fulltime" },
    { id: 10, title: "Backend Engineer", company: "Twilio", location: "Remote US", salary: "$155k - $190k", url: "#", category: "software", jobType: "remote" },
    { id: 11, title: "Marketing Intern", company: "Google", location: "Mountain View, CA", salary: "$35/hr", url: "#", category: "marketing", jobType: "internship" },
    { id: 12, title: "Quantitative Analyst", company: "Jane Street", location: "New York", salary: "$180k - $220k", url: "#", category: "finance", jobType: "fulltime" }
  ];
  applyFiltersAndReset();
}

// Filter jobs based on search, location, category, job type
function filterJobs() {
  const keyword = searchKeyword.value.trim().toLowerCase();
  const location = locationFilter.value.trim().toLowerCase();
  const category = categoryFilter.value;
  const jobType = jobTypeFilter.value;

  let filtered = allJobs.filter(job => {
    // keyword search (title, company)
    if (keyword && !job.title.toLowerCase().includes(keyword) && !job.company.toLowerCase().includes(keyword)) return false;
    // location
    if (location && !job.location.toLowerCase().includes(location)) return false;
    // category
    if (category && job.category !== category) return false;
    // job type
    if (jobType && job.jobType !== jobType) return false;
    return true;
  });
  return filtered;
}

// Render current page of jobs (using displayedJobs slice)
function renderJobs() {
  if (!displayedJobs.length) {
    jobsGrid.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-circle"></i> No jobs match your filters. Try adjusting criteria.</div>';
    jobsCountSpan.innerText = '0';
    loadMoreBtn.style.display = 'none';
    return;
  }

  const start = 0;
  const end = currentPage * JOBS_PER_PAGE;
  const jobsToShow = displayedJobs.slice(0, end);
  
  if (jobsToShow.length === 0) {
    jobsGrid.innerHTML = '<div class="error-message">No jobs loaded.</div>';
    return;
  }

  // retrieve saved jobs from localStorage
  const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');

  jobsGrid.innerHTML = jobsToShow.map(job => `
    <div class="job-card" data-job-id="${job.id}">
      <div class="card-header">
        <div class="job-title">${escapeHtml(job.title)}</div>
        <i class="far fa-bookmark save-icon ${savedJobs.includes(job.id) ? 'saved fas' : 'far'}" data-id="${job.id}"></i>
      </div>
      <div class="company"><i class="fas fa-building"></i> ${escapeHtml(job.company)}</div>
      <div class="job-details">
        <span><i class="fas fa-map-marker-alt"></i> ${escapeHtml(job.location)}</span>
        <span class="salary"><i class="fas fa-dollar-sign"></i> ${escapeHtml(formatSalary(job))}</span>
      </div>
      <button class="apply-btn" data-url="${job.url}">Apply Now →</button>
    </div>
  `).join('');

  jobsCountSpan.innerText = displayedJobs.length;
  // show/hide load more button
  if (displayedJobs.length <= currentPage * JOBS_PER_PAGE) {
    loadMoreBtn.style.display = 'none';
  } else {
    loadMoreBtn.style.display = 'inline-block';
  }

  // attach event listeners for apply and save
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
    alert('Application link will be available soon on the company career page.');
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
  const jobId = parseInt(this.getAttribute('data-id'));
  let savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
  if (savedJobs.includes(jobId)) {
    savedJobs = savedJobs.filter(id => id !== jobId);
    this.classList.remove('fas', 'saved');
    this.classList.add('far');
    showToast('Removed from saved jobs');
  } else {
    savedJobs.push(jobId);
    this.classList.remove('far');
    this.classList.add('fas', 'saved');
    showToast('Job saved!');
  }
  localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
}

// simple toast (if you want a small non-intrusive feedback)
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

// Reset filters and reload display
function applyFiltersAndReset() {
  const filtered = filterJobs();
  displayedJobs = [...filtered];
  currentPage = 1;
  renderJobs();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Load more jobs (increment page)
function loadMoreJobs() {
  if (displayedJobs.length > currentPage * JOBS_PER_PAGE) {
    currentPage++;
    renderJobs();  // re-render with new page range
  } else {
    loadMoreBtn.style.display = 'none';
  }
}

// Attach filter event listeners
function initEventListeners() {
  searchKeyword.addEventListener('input', () => applyFiltersAndReset());
  locationFilter.addEventListener('input', () => applyFiltersAndReset());
  categoryFilter.addEventListener('change', () => applyFiltersAndReset());
  jobTypeFilter.addEventListener('change', () => applyFiltersAndReset());
  resetFiltersBtn.addEventListener('click', () => {
    searchKeyword.value = '';
    locationFilter.value = '';
    categoryFilter.value = '';
    jobTypeFilter.value = '';
    applyFiltersAndReset();
  });
  loadMoreBtn.addEventListener('click', loadMoreJobs);
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
  fetchJobsFromAPI();
}

// Start
init();