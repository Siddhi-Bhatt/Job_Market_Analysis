# 🎯 SmartMatch - AI-Powered Job Matching Platform

---

### Live Demo

🔗 **Try it live : ** *(https://smartmatcher.vercel.app/)*

---

## 📸 Screenshots

### 🏠 Landing Page

<p align="center">
  <img src="https://github.com/user-attachments/assets/21e416aa-7739-4e94-8053-e855856629c2" width="45%" />
  <img src="https://github.com/user-attachments/assets/843a9198-016c-4188-957c-359fa87c5e28" width="45%" />
</p>

---

### 📊 Dashboard

<p align="center">
  <img src="https://github.com/user-attachments/assets/3d90cffe-e354-4ef7-87ee-1b17a01ec7cb" width="70%" />
</p>


## 🌟 Overview

**SmartMatch** is an intelligent job matching platform that uses AI-powered resume analysis to help job seekers find the best opportunities. Upload your resume, and SmartMatch will:

- 🔍 **Extract skills** automatically from your PDF resume
- 🎯 **Match you** with relevant jobs from real-time job APIs
- 📊 **Analyze gaps** in your skill set
- 💡 **Recommend** which skills to learn for better opportunities

### Why SmartMatch?

Traditional job search is time-consuming and inefficient. SmartMatch solves this by:
- Automating resume parsing with 95%+ accuracy
- Providing real-time job matching from multiple sources
- Offering actionable insights on skill development
- Presenting data in a beautiful, intuitive dashboard

---

## ✨ Features

### 🚀 Core Features

- **AI Resume Analysis**
  - PDF parsing with PyMuPDF
  - Intelligent skill extraction using NLP
  - Support for multiple resume formats

- **Smart Job Matching**
  - Real-time job fetching from Adzuna API
  - Intelligent baseline skill detection
  - Percentage-based match scoring (60-100%)
  - Multi-country support (India, US, UK, Singapore, Australia)

- **Skills Gap Analysis**
  - Identifies missing skills from job requirements
  - Shows demand percentage for each skill
  - Prioritizes skills by market demand
  - Helps focus learning efforts

- **Interactive Dashboard**
  - Modern, responsive UI with dark theme
  - Real-time statistics and trends
  - Color-coded match scores
  - Detailed job cards with skill breakdowns

### 🎨 UI/UX Features

- **Landing Page**
  - Drag-and-drop resume upload
  - Smooth animations and transitions
  - Professional gradient design

- **Dashboard**
  - Active job matches counter
  - Average match score tracker
  - Grid/list view toggle
  - Job detail modals

- **Skills Visualization**
  - Progress bars for skill demand
  - Color-coded skill tags
  - Missing vs. matched skills comparison



## 🛠️ Tech Stack

### Backend

-The FastAPI backend is deployed on **Render**.

| Technology | Purpose |
|------------|---------|
| ![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white) | Core programming language |
| ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white) | REST API framework |
| ![PyMuPDF](https://img.shields.io/badge/PyMuPDF-PDF%20Parsing-red?style=flat-square) | Resume PDF parsing |
| ![Pandas](https://img.shields.io/badge/Pandas-150458?style=flat-square&logo=pandas&logoColor=white) | Data analysis |

### Frontend

-The frontend is deployed on **Vercel** for fast global delivery.

| Technology | Purpose |
|------------|---------|
| ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white) | Structure |
| ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white) | Styling |
| ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black) | Interactivity |
| ![Google Fonts](https://img.shields.io/badge/Google%20Fonts-4285F4?style=flat-square&logo=google&logoColor=white) | Typography (Outfit) |


### External APIs

- **Adzuna Jobs API** - Job listings aggregation
- (Expandable to LinkedIn, Indeed, Glassdoor)

---

## 🏗️ Architecture

```
┌─────────────┐      HTTP       ┌─────────────┐
│             │ ──────────────> │             │
│  Frontend   │                 │   FastAPI   │
│  (Vanilla   │ <────────────── │   Backend   │
│     JS)     │     JSON        │             │
└─────────────┘                 └─────────────┘
                                       │
                                       │ API Calls
                                       ▼
                              ┌─────────────────┐
                              │  External APIs  │
                              │  - Adzuna       │
                              │  - (LinkedIn)   │
                              └─────────────────┘
```

### Data Flow

1. **User uploads PDF resume** → Frontend sends to `/analyze-resume`
2. **Backend extracts skills** → Returns skill list
3. **Frontend fetches jobs** → Calls `/jobs/adzuna?query=...`
4. **Backend queries Adzuna** → Matches skills, calculates percentages
5. **Frontend displays results** → Interactive cards and analytics

---

## 📦 Installation

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/smartmatch-job-platform.git
cd smartmatch-job-platform
```

### Step 2: Backend Setup

```bash
# Navigate to API folder
cd api

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn pymupdf requests python-dotenv

# Or use requirements.txt
pip install -r requirements.txt
```

### Step 3: Environment Configuration

Create a `.env` file in the `api/` folder:

```env
# Adzuna API Credentials
APP_ID=your_adzuna_app_id
APP_KEY=your_adzuna_app_key

# MySQL Configuration (optional)
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DB=job_market_db
```

**Get Adzuna API Keys:**
1. Visit [Adzuna Developer Portal](https://developer.adzuna.com/)
2. Sign up for a free account
3. Create an application
4. Copy your App ID and App Key

### Step 4: Start Backend

```bash
# From api/ folder
python app.py

# You should see:
# 🚀 Starting Job Market Analyzer v5.0...
# INFO: Uvicorn running on http://0.0.0.0:8000
```

### Step 5: Open Frontend

```bash
# Open in browser
# Windows:
start ../frontend/index.html

# macOS:
open ../frontend/index.html

# Linux:
xdg-open ../frontend/index.html

# Or simply double-click index.html
```

---

## 🚀 Usage

### Basic Workflow

1. **Upload Resume**
   - Drag and drop your PDF resume
   - Or click "Select File" to browse
   - Supports PDF, DOC, DOCX (max 5MB)

2. **View Analysis**
   - Wait 2-3 seconds for AI processing
   - See extracted skills (typically 15-25)
   - Review skill categories

3. **Browse Jobs**
   - Automatic job search on upload
   - Or manually search with filters
   - Change job title or location

4. **Explore Matches**
   - Click on job cards for details
   - View matched vs. missing skills
   - Click "Apply Now" to visit job posting

5. **Analyze Gaps**
   - Scroll to "Skills Gap Analysis"
   - See what skills are in demand
   - Prioritize learning based on demand %

### Advanced Usage

**Custom Job Search**
```javascript
// In sidebar
Job Title: "Data Analyst"
Location: US
→ Click "Search Jobs"
```

**Filter by Match Score**
- Jobs are auto-sorted by match %
- 80-100% = Excellent match
- 60-79% = Good match
- 40-59% = Fair match
- 0-39% = Poor match




</div>
