import os
import random
import json
from dotenv import load_dotenv

folder_path = "./ipfs_metadata/cca/NUS_20232024/"
# Load environment variables from .env
load_dotenv()

# Define student names and universities
nus_students = os.getenv("NUS_STUDENTS").split(",")

universities = {student: "National University of Singapore" for student in nus_students}

# Possible CCA categories and clubs
cca_categories = {
    "Sports & Fitness": ["Basketball Club", "Soccer Club", "Tennis Club"],
    "Arts & Culture": ["Music Society", "Dance Club", "Drama Club", "Chinese Orchestra", "Astronomy Club"],
    "Community Service": ["Red Cross Society", "Volunteer Corps", "Environmental Club"],
    "Academic & Professional": ["Debate Club", "Entrepreneurship Society", "Tech Innovators", "Investment Banking Club", "International Trading Club"]
}

# Academic years
academic_years = ["2023-2024"]

# Generate CCA records
records = []
record_id = 0

for student in nus_students:
    num_records = random.randint(0, 2)

    selected_records = []
    for i in range(num_records):
        selected_records.append(random.choice(academic_years))
    
    for year in selected_records:
        category = random.choice(list(cca_categories.keys()))
        club = random.choice(cca_categories[category])
        membership_role = random.choice(["Member", "Vice President", "President", "Treasurer", "Secretary"])
        achievements = random.choice(["Participated", "Finalist", "Champion", "Outstanding Contribution Award"])
        
        formatted_id = f"CCA-{year.split('-')[0]}-{record_id:04d}"

        record = {
            "name": f"CCA Record #{record_id:04d}",
            "description": f"Awarded for participation in a {universities[student]} CCA for an academic year.",
            "attributes": [
                {"trait_type": "Student Name", "value": student},
                {"trait_type": "University", "value": universities[student]},
                {"trait_type": "CCA Category", "value": category},
                {"trait_type": "Club Name", "value": club},
                {"trait_type": "Academic Year", "value": year},
                {"trait_type": "Date of Issue", "value": f"{int(year.split('-')[1])}-06-30"},
                {"trait_type": "Membership Type/Role", "value": membership_role},
                {"trait_type": "Achievements", "value": achievements},
                {"trait_type": "Certificate ID", "value": formatted_id},
                {"trait_type": "Country", "value": "Singapore"}
            ]
        }

        with open(os.path.join(folder_path, f"{record_id}.json"), 'w') as file:
            json.dump(record, file, indent=4)

        records.append(record)
        record_id += 1