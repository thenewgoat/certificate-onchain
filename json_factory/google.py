import os
import random
import json
from dotenv import load_dotenv

folder_path = "./ipfs_metadata/certificates/google/"
# Load environment variables
load_dotenv()

# List of Google certificates
courses = [
    "Google Data Analytics Professional Certificate",
    "Google IT Support Professional Certificate",
    "Google UX Design Professional Certificate",
    "Google Project Management Certificate",
    "Google Digital Marketing & E-commerce Certificate",
    "Google Cybersecurity Professional Certificate",
    "Google Cloud Associate Engineer Certificate",
    "Google Advanced Data Analytics Professional Certificate"
]

# Certificate issuer
issuer = "Google"

# Load names from .env
names = os.getenv("NAMES").split(",")

# Folder path
folder_path = "./ipfs_metadata/certificates/google/"
os.makedirs(folder_path, exist_ok=True)

certificate_id = 0

# Generate certificates
for name in names:
    num_certificates = random.randint(0, 3)
    selected_courses = random.sample(courses, num_certificates)

    for course in selected_courses:
        formatted_id = f"{certificate_id:04d}"

        certificate = {
            "name": f"{course} - CERT-{formatted_id}",
            "description": f"Awarded to {name} for completing {course}.",
            "type": "certificate",
            "attributes": [
                {"trait_type": "Student Name", "value": name},
                {"trait_type": "Issuer", "value": issuer},
                {"trait_type": "Date of Issue", "value": f"2025-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}"},
                {"trait_type": "Title", "value": course},
                {"trait_type": "Certificate ID", "value": f"CERT-{certificate_id:04d}"},
                {"trait_type": "Expiration Date", "value": f"2028-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}"},
                {"trait_type": "Country", "value": "Singapore"}
            ]
        }

    with open(os.path.join(folder_path, f"{certificate_id}.json"), 'w') as file:
        json.dump(certificate, file, indent=4)

    certificate_id += 1

print(f"Certificates generated in {folder_path}")
