import mysql.connector
import os
from dotenv import load_dotenv
import pandas as pd
from collections import Counter

load_dotenv()

# Connect to MySQL
conn = mysql.connector.connect(
    host=os.getenv("MYSQL_HOST"),
    user=os.getenv("MYSQL_USER"),
    password=os.getenv("MYSQL_PASSWORD"),
    database=os.getenv("MYSQL_DB")
)

query = """
SELECT skills
FROM jobs
WHERE skills IS NOT NULL AND skills != '';
"""

df = pd.read_sql(query, conn)
conn.close()

# Split skills and clean
all_skills = []

for skill_row in df["skills"]:
    skills = skill_row.lower().replace("|", ",").split(",")
    skills = [s.strip() for s in skills if s.strip()]
    all_skills.extend(skills)

# Count frequency
skill_counts = Counter(all_skills)

# Convert to DataFrame
skills_df = pd.DataFrame(
    skill_counts.items(),
    columns=["skill", "count"]
).sort_values(by="count", ascending=False)

# Save for frontend / dashboard
os.makedirs("output", exist_ok=True)
skills_df.to_csv("output/top_skills.csv", index=False)

print("🔥 Top 10 Skills Right Now:")
print(skills_df.head(10))
