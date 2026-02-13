const API_BASE = "http://localhost:8000";

// DOM Elements
const landingPage = document.getElementById('landingPage');
const dashboardPage = document.getElementById('dashboardPage');
const uploadBox = document.getElementById('uploadBox');
const resumeInput = document.getElementById('resumeInput');
const selectFileBtn = document.getElementById('selectFileBtn');
const uploadStatus = document.getElementById('uploadStatus');
const analyzeBtn = document.getElementById('analyzeBtn');
const uploadNewBtn = document.getElementById('uploadNewBtn');
const searchBtn = document.getElementById('searchBtn');
const jobList = document.getElementById('jobList');
const loadingOverlay = document.getElementById('loadingOverlay');
const jobModal = document.getElementById('jobModal');
const modalClose = document.getElementById('modalClose');

// State
let resumeSkills = [];
let currentJobs = [];

// ===== FILE UPLOAD HANDLERS =====

selectFileBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent uploadBox click from firing
    resumeInput.click();
});

uploadBox.addEventListener('click', (e) => {
    // Only trigger if clicking the box itself, not the button
    if (e.target === uploadBox || e.target.closest('.upload-icon') || e.target.closest('h3') || e.target.closest('p:not(.file-support)')) {
        resumeInput.click();
    }
});

uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadBox.style.borderColor = 'var(--primary)';
    uploadBox.style.background = 'rgba(99, 102, 241, 0.05)';
});

uploadBox.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadBox.style.borderColor = '';
    uploadBox.style.background = '';
});

uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadBox.style.borderColor = '';
    uploadBox.style.background = '';
    
    const file = e.dataTransfer.files[0];
    if (file) {
        handleFileSelect(file);
    }
});

resumeInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleFileSelect(file);
    }
});

function handleFileSelect(file) {
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
        alert('Please upload a PDF or DOC file');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
    }
    
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('statusMessage').textContent = `${(file.size / 1024).toFixed(2)} KB • Ready to analyze`;
    uploadBox.style.display = 'none';
    uploadStatus.style.display = 'flex';
}

analyzeBtn.addEventListener('click', async () => {
    const file = resumeInput.files[0];
    if (!file) return;
    
    loadingOverlay.style.display = 'flex';
    
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${API_BASE}/analyze-resume`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.resume_skills && data.resume_skills.length > 0) {
            resumeSkills = data.resume_skills;
            
            document.getElementById('profileName').textContent = file.name.replace(/\.[^/.]+$/, "");
            document.getElementById('skillCount').textContent = `${data.count} skills detected`;
            
            await fetchJobs();
            
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
                landingPage.style.display = 'none';
                dashboardPage.style.display = 'block';
            }, 1000);
        } else {
            throw new Error('No skills detected');
        }
    } catch (error) {
        loadingOverlay.style.display = 'none';
        alert('Error analyzing resume');
        console.error(error);
    }
});

searchBtn.addEventListener('click', fetchJobs);

async function fetchJobs() {
    const query = document.getElementById('jobQuery').value || 'data analyst';
    const location = document.getElementById('location').value;
    
    jobList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Loading jobs...</p>';
    
    try {
        const response = await fetch(`${API_BASE}/jobs/adzuna?query=${encodeURIComponent(query)}&location=${location}`);
        const data = await response.json();
        currentJobs = data.jobs || [];
        
        updateStats(currentJobs);
        updateSkillsGap(currentJobs);
        renderJobs(currentJobs);
    } catch (error) {
        jobList.innerHTML = '<p style="text-align: center; color: var(--danger);">Error loading jobs</p>';
        console.error(error);
    }
}

function updateStats(jobs) {
    const totalJobs = jobs.length;
    const avgMatch = jobs.reduce((sum, job) => sum + job.match_percentage, 0) / totalJobs;
    
    // Update values
    document.getElementById('activeMatches').textContent = totalJobs;
    document.getElementById('avgScore').textContent = `${Math.round(avgMatch)}%`;
    
    // Update trends
    document.getElementById('matchesTrend').textContent = totalJobs > 15 ? '↑ High' : totalJobs > 10 ? '→ Good' : '↓ Low';
    document.getElementById('scoreTrend').textContent = avgMatch >= 80 ? '↑ Excellent' : avgMatch >= 60 ? '→ Good' : '↓ Needs work';
    
    // Color code trends
    document.getElementById('matchesTrend').style.color = totalJobs > 15 ? 'var(--secondary)' : totalJobs > 10 ? 'var(--accent)' : 'var(--danger)';
    document.getElementById('scoreTrend').style.color = avgMatch >= 80 ? 'var(--secondary)' : avgMatch >= 60 ? 'var(--accent)' : 'var(--danger)';
}

function updateSkillsGap(jobs) {
    const skillsGap = document.getElementById('skillsGap');
    
    // Count how many jobs need each skill
    const missingSkillsCount = {};
    
    jobs.forEach(job => {
        job.missing_skills.forEach(skill => {
            if (skill !== 'None') {
                missingSkillsCount[skill] = (missingSkillsCount[skill] || 0) + 1;
            }
        });
    });
    
    // Sort by frequency (most demanded first)
    const sortedSkills = Object.entries(missingSkillsCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10); // Top 10 missing skills
    
    if (sortedSkills.length === 0) {
        skillsGap.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🎉</div>
                <h3 style="margin-bottom: 0.5rem;">No skill gaps detected!</h3>
                <p style="color: var(--text-secondary);">You have all the skills employers are looking for</p>
            </div>
        `;
        return;
    }
    
    skillsGap.innerHTML = sortedSkills.map(([skill, count]) => {
        // Calculate what % of jobs need this skill
        const demandPercentage = Math.round((count / jobs.length) * 100);
        
        return `
            <div class="skill-item" style="animation: slideIn 0.3s ease-out;">
                <div class="skill-info" style="flex: 1;">
                    <div class="skill-name">${capitalizeWords(skill)}</div>
                    <div style="display: flex; align-items: center; gap: 1rem; margin-top: 0.5rem;">
                        <div style="flex: 1;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                                <small style="color: var(--text-muted);">Job Demand</small>
                                <small style="color: var(--primary); font-weight: 600;">${demandPercentage}%</small>
                            </div>
                            <div class="skill-bar">
                                <div class="skill-bar-fill" style="width: ${demandPercentage}%; background: linear-gradient(90deg, var(--primary), var(--primary-light));"></div>
                            </div>
                        </div>
                        <div style="color: var(--text-muted); font-size: 0.875rem;">
                            ${count} of ${jobs.length} jobs
                        </div>
                    </div>
                </div>
                <span class="skill-badge">${demandPercentage}% demand</span>
            </div>
        `;
    }).join('');
}

function renderJobs(jobs) {
    if (jobs.length === 0) {
        jobList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No jobs found</p>';
        return;
    }
    
    jobList.innerHTML = jobs.map((job, index) => {
        const matchColor = getMatchColor(job.match_percentage);
        const delay = index * 0.05;
        
        return `
            <div class="job-card" style="animation: slideIn 0.5s ease-out ${delay}s both;">
                <div class="job-header">
                    <h3 class="job-title">${job.title}</h3>
                    <p class="job-company">🏢 ${job.company}</p>
                    <p class="job-location">📍 ${job.location}</p>
                </div>
                <div class="job-match">
                    <div class="match-circle" style="background: ${matchColor};">${job.match_percentage}%</div>
                    <div>
                        <div style="font-weight: 600; margin-bottom: 0.25rem;">Match Score</div>
                        <div class="match-label">Based on your skills</div>
                    </div>
                </div>
                <div class="job-skills">
                    ${job.matched_skills[0] !== 'No matching skills' ? `
                        <div class="skills-section">
                            <h4>✅ Your Skills</h4>
                            <div class="skill-tags">
                                ${job.matched_skills.slice(0, 6).map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                                ${job.matched_skills.length > 6 ? `<span class="skill-tag">+${job.matched_skills.length - 6} more</span>` : ''}
                            </div>
                        </div>
                    ` : ''}
                    ${job.missing_skills[0] !== 'None' ? `
                        <div class="skills-section">
                            <h4>📚 Skills to Learn</h4>
                            <div class="skill-tags">
                                ${job.missing_skills.slice(0, 4).map(skill => `<span class="skill-tag missing">${skill}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
                <div class="job-actions">
                    <button class="btn-apply" onclick="window.open('${job.redirect_url}', '_blank')">Apply Now →</button>
                    <button class="btn-details" onclick="showJobDetails(${index})">Details</button>
                </div>
            </div>
        `;
    }).join('');
}

function showJobDetails(index) {
    const job = currentJobs[index];
    const matchColor = getMatchColor(job.match_percentage);
    
    document.getElementById('modalBody').innerHTML = `
        <div style="margin-bottom: 2rem;">
            <h2 style="font-size: 2rem; margin-bottom: 1rem;">${job.title}</h2>
            <div style="display: flex; gap: 2rem; margin-bottom: 2rem; color: var(--text-secondary);">
                <div>🏢 ${job.company}</div>
                <div>📍 ${job.location}</div>
            </div>
            <div style="display: inline-block; padding: 1rem 2rem; background: ${matchColor}; border-radius: var(--radius-lg); margin-bottom: 2rem;">
                <div style="font-size: 3rem; font-weight: 800;">${job.match_percentage}%</div>
                <div style="opacity: 0.9;">Match Score</div>
            </div>
        </div>
        <div style="margin-bottom: 2rem;">
            <h3 style="margin-bottom: 1rem;">✅ Your Matching Skills</h3>
            <div class="skill-tags">
                ${job.matched_skills[0] !== 'No matching skills' ? 
                    job.matched_skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('') :
                    '<p style="color: var(--text-secondary);">No matching skills</p>'}
            </div>
        </div>
        ${job.missing_skills[0] !== 'None' ? `
            <div style="margin-bottom: 2rem;">
                <h3 style="margin-bottom: 1rem;">📚 Skills to Develop</h3>
                <div class="skill-tags">
                    ${job.missing_skills.map(skill => `<span class="skill-tag missing">${skill}</span>`).join('')}
                </div>
            </div>
        ` : ''}
        <div style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid var(--border);">
            <button class="btn-apply" onclick="window.open('${job.redirect_url}', '_blank')" style="width: 100%; padding: 1rem;">
                Apply for this position →
            </button>
        </div>
    `;
    
    jobModal.classList.add('active');
}

modalClose.addEventListener('click', () => jobModal.classList.remove('active'));
jobModal.addEventListener('click', (e) => {
    if (e.target === jobModal) jobModal.classList.remove('active');
});

uploadNewBtn.addEventListener('click', () => {
    landingPage.style.display = 'block';
    dashboardPage.style.display = 'none';
    uploadBox.style.display = 'block';
    uploadStatus.style.display = 'none';
    resumeInput.value = '';
});

document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const view = btn.dataset.view;
        jobList.style.gridTemplateColumns = view === 'list' ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))';
    });
});

function getMatchColor(percentage) {
    if (percentage >= 80) return 'linear-gradient(135deg, #10b981, #059669)';
    if (percentage >= 60) return 'linear-gradient(135deg, #3b82f6, #2563eb)';
    if (percentage >= 40) return 'linear-gradient(135deg, #f59e0b, #d97706)';
    return 'linear-gradient(135deg, #ef4444, #dc2626)';
}

function capitalizeWords(str) {
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

window.showJobDetails = showJobDetails;