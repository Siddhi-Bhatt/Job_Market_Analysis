from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import requests
import fitz  # PyMuPDF
import re
from typing import List
from html import unescape
from html.parser import HTMLParser

app = FastAPI(
    title="Job Market Resume Analyzer",
    version="5.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------
# HTML STRIPPER CLASS
# ----------------------------

class MLStripper(HTMLParser):
    def __init__(self):
        super().__init__()
        self.reset()
        self.strict = False
        self.convert_charrefs = True
        self.text = []
    
    def handle_data(self, d):
        self.text.append(d)
    
    def get_data(self):
        return ''.join(self.text)

def strip_tags(html):
    """Remove HTML tags completely"""
    if not html:
        return ""
    s = MLStripper()
    s.feed(html)
    return s.get_data()

# ----------------------------
# SKILL DATABASE
# ----------------------------

COMMON_SKILLS = [
    # Programming Languages
    "python", "r", "sql", "java", "javascript", "scala", "c++",
    
    # Data Tools
    "excel", "tableau", "power bi", "looker", "qlik", 
    
    # Python Libraries  
    "pandas", "numpy", "scipy", "scikit-learn", "matplotlib", 
    "seaborn", "plotly", "tensorflow", "pytorch",
    
    # Databases
    "mysql", "postgresql", "mongodb", "oracle", "snowflake", 
    "bigquery", "redshift",
    
    # Cloud
    "aws", "azure", "gcp",
    
    # Core Skills
    "machine learning", "deep learning", "data analysis", 
    "data analytics", "statistics", "statistical analysis",
    "data visualization", "data cleaning", "data mining",
    "etl", "dashboards", "kpi", "reporting", 
    "business intelligence", "analytics",
    
    # Soft Skills
    "communication", "presentation", "leadership", "teamwork"
]

# TYPICAL SKILLS FOR DATA ANALYST ROLES
# When job description is vague, assume these are needed
DATA_ANALYST_BASELINE = [
    "sql", "excel", "python", "data analysis", 
    "data visualization", "reporting", "analytics"
]

# Global storage for resume skills
resume_skills_storage = []

# ----------------------------
# UTILITY FUNCTIONS
# ----------------------------

def clean_text(text: str) -> str:
    """
    Aggressively clean text - remove HTML, special chars, normalize
    """
    if not text:
        return ""
    
    # Strip HTML tags
    text = strip_tags(text)
    
    # Decode HTML entities
    text = unescape(text)
    
    # Convert to lowercase
    text = text.lower()
    
    # Replace common separators with space
    text = re.sub(r'[|/\-_]+', ' ', text)
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove special characters but keep alphanumeric
    text = re.sub(r'[^\w\s]', ' ', text)
    
    return text.strip()

def extract_skills_from_text(text: str) -> list:
    """
    Extract skills from cleaned text using flexible matching
    """
    if not text:
        return []
    
    # Clean the text first
    clean = clean_text(text)
    
    found_skills = []
    
    for skill in COMMON_SKILLS:
        # Create flexible pattern for multi-word skills
        skill_words = skill.split()
        if len(skill_words) > 1:
            pattern = r'\b' + r'\s*'.join(re.escape(word) for word in skill_words) + r'\b'
        else:
            pattern = r'\b' + re.escape(skill) + r'\b'
        
        if re.search(pattern, clean, re.IGNORECASE):
            found_skills.append(skill)
    
    # Add skill aliases - if you have tableau/power bi, you have data visualization
    if ('tableau' in found_skills or 'power bi' in found_skills) and 'data visualization' not in found_skills:
        found_skills.append('data visualization')
    
    # Remove duplicates while preserving order
    return list(dict.fromkeys(found_skills))

def enhance_job_skills(job_skills: list, job_title: str) -> list:
    """
    If job description is too vague (< 3 skills), add baseline skills
    based on job title
    """
    if len(job_skills) >= 3:
        return job_skills
    
    # Check if it's a data analyst role
    title_lower = job_title.lower()
    if 'data analyst' in title_lower or 'data analytics' in title_lower:
        # Add baseline skills that aren't already there
        enhanced = job_skills.copy()
        for skill in DATA_ANALYST_BASELINE:
            if skill not in enhanced:
                enhanced.append(skill)
        return enhanced
    
    return job_skills

# ----------------------------
# ENDPOINTS
# ----------------------------

@app.get("/")
def root():
    return {"message": "Backend v5.0 is running 🚀 (Enhanced Matching)"}

@app.post("/analyze-resume")
async def analyze_resume(file: UploadFile = File(...)):
    global resume_skills_storage
    
    try:
        # Read PDF
        pdf_bytes = await file.read()
        pdf = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        # Extract all text
        text = ""
        for page in pdf:
            text += page.get_text()
        
        pdf.close()
        
        # Extract skills
        detected_skills = extract_skills_from_text(text)
        
        # Store globally
        resume_skills_storage = detected_skills
        
        # Debug output
        print("\n" + "="*60)
        print("📄 RESUME ANALYSIS")
        print("="*60)
        print(f"✅ Found {len(detected_skills)} skills:")
        for skill in detected_skills:
            print(f"   • {skill}")
        print("="*60 + "\n")
        
        return {
            "resume_skills": detected_skills,
            "count": len(detected_skills),
            "message": f"Resume analyzed! Found {len(detected_skills)} skills"
        }
    
    except Exception as e:
        print(f"❌ Error analyzing resume: {str(e)}")
        return {
            "resume_skills": [],
            "count": 0,
            "message": f"Error: {str(e)}"
        }

@app.get("/jobs/adzuna")
def get_jobs(query: str = "data analyst", location: str = "in"):
    """
    Fetch and match jobs from Adzuna API with enhanced skill detection
    """
    
    # API credentials
    APP_ID = "db58ca6b"
    APP_KEY = "b83e3e2b9c4f96335a0b113bbdb467fe"
    
    # Build URL
    url = f"https://api.adzuna.com/v1/api/jobs/{location}/search/1"
    
    params = {
        "app_id": APP_ID,
        "app_key": APP_KEY,
        "results_per_page": 20,
        "what": query,
        "content-type": "application/json"
    }
    
    # Fetch jobs
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
    except Exception as e:
        print(f"❌ API Error: {str(e)}")
        return {"jobs": [], "error": str(e)}
    
    # Get resume skills
    resume_skills = resume_skills_storage if resume_skills_storage else []
    
    print("\n" + "="*60)
    print(f"🔍 MATCHING JOBS (Resume has {len(resume_skills)} skills)")
    print("="*60)
    
    jobs = []
    
    for idx, job in enumerate(data.get("results", []), 1):
        # Get raw data
        title = job.get("title", "")
        description = job.get("description", "")
        
        # Combine and clean
        full_text = f"{title} {description}"
        
        # Extract skills from job description
        job_skills_detected = extract_skills_from_text(full_text)
        
        # ⭐ ENHANCEMENT: Add baseline skills if description is too vague
        job_skills = enhance_job_skills(job_skills_detected, title)
        
        # Find matches
        matched = [skill for skill in resume_skills if skill in job_skills]
        missing = [skill for skill in job_skills if skill not in resume_skills]
        
        # Calculate percentage
        if len(job_skills) > 0:
            match_pct = int((len(matched) / len(job_skills)) * 100)
        else:
            match_pct = 0
        
        # Debug output
        print(f"\n📊 Job {idx}: {title[:50]}")
        print(f"   Company: {job.get('company', {}).get('display_name', 'N/A')}")
        print(f"   Detected from desc: {len(job_skills_detected)} skills")
        print(f"   Enhanced to: {len(job_skills)} skills → {job_skills[:6]}")
        print(f"   You have: {len(matched)} matching → {matched[:5]}")
        print(f"   Missing: {len(missing)} skills → {missing[:4]}")
        print(f"   Match: {match_pct}%")
        
        jobs.append({
            "title": title,
            "company": job.get("company", {}).get("display_name", "N/A"),
            "location": job.get("location", {}).get("display_name", "N/A"),
            "matched_skills": matched if matched else ["No matching skills"],
            "missing_skills": missing[:8] if missing else ["None"],
            "match_percentage": match_pct,
            "redirect_url": job.get("redirect_url", "#"),
            "job_total_skills": len(job_skills)
        })
    
    # Sort by match percentage
    jobs.sort(key=lambda x: x["match_percentage"], reverse=True)
    
    print("="*60 + "\n")
    
    return {
        "jobs": jobs,
        "total": len(jobs),
        "resume_skills": resume_skills
    }

if __name__ == "__main__":
    print("🚀 Starting Job Market Analyzer v5.0 (Enhanced Matching)...")
    print("📊 Now using baseline skill expectations for vague job descriptions")
    print("📊 Debug logging enabled - check console for details")
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)