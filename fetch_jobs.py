import os
import requests
import mysql.connector
from dotenv import load_dotenv
from datetime import datetime
from etl.skill_extractor import extract_skills  # Import your skill extractor

# Load env variables
load_dotenv()

# MySQL connection
conn = mysql.connector.connect(
    host=os.getenv("MYSQL_HOST"),
    port=os.getenv("MYSQL_PORT", 3306),  # Default port if not set
    user=os.getenv("MYSQL_USER"),
    password=os.getenv("MYSQL_PASSWORD"),
    database=os.getenv("MYSQL_DB")
)

cursor = conn.cursor()

print("✅ Connected to MySQL")

# ---------------------------
# JOB API CONFIG
# ---------------------------
APP_ID = os.getenv("APP_ID")  # Moved to env for security
APP_KEY = os.getenv("APP_KEY")

API_URL = "https://api.adzuna.com/v1/api/jobs/in/search/1"

params = {
    "app_id": APP_ID,
    "app_key": APP_KEY,
    "results_per_page": 20,
    "what": "data analyst",
    "where": "india",
    "content-type": "application/json"
}

response = requests.get(API_URL, params=params)

if response.status_code != 200:
    print("❌ API failed:", response.text)
    exit()

data = response.json()
jobs = data.get("results", [])

print(f"📥 Fetched {len(jobs)} jobs")

# ---------------------------
# INSERT INTO DATABASE
# ---------------------------
insert_query = """
INSERT INTO jobs (job_title, company, location, salary, skills, source)
VALUES (%s, %s, %s, %s, %s, %s)
"""

for job in jobs:
    title = job.get("title")
    company = job.get("company", {}).get("display_name")
    location = job.get("location", {}).get("display_name")
    salary = f"{job.get('salary_min', 'N/A')} - {job.get('salary_max', 'N/A')}"
    
    # FIX: Extract skills from description using your extractor, then join as comma-separated string
    description = job.get("description", "")
    extracted_skills = extract_skills(description) if description else []
    skills = ", ".join(extracted_skills)  # Store as "python, sql" for skill_analysis.py to parse
    
    source = "Adzuna"

    cursor.execute(insert_query, (
        title,
        company,
        location,
        salary,
        skills,
        source
    ))

conn.commit()
cursor.close()
conn.close()

print("✅ Jobs inserted successfully")