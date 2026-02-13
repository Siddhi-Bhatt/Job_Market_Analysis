import re
from skills import SKILLS  # Changed from etl.skills to just skills

def extract_skills(text: str):
    """
    Extract skills from text using regex matching
    """
    text = text.lower()
    found = set()

    for skill in SKILLS:
        # Use word boundary to avoid partial matches
        pattern = r"\b" + re.escape(skill) + r"\b"
        if re.search(pattern, text):
            found.add(skill)

    return list(found)


# Test function
if __name__ == "__main__":
    sample_text = "Looking for a candidate with Python, SQL, and Excel skills"
    skills = extract_skills(sample_text)
    print(f"Found skills: {skills}")