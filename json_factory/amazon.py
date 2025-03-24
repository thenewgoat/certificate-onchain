import os
import random
import json
from dotenv import load_dotenv


folder_path = "./ipfs_metadata/certificates/amazon/"
# Load environment variables from .env file
load_dotenv()

# Get names from .env file and split into a list
names = os.getenv("NAMES").split(",")

# Possible Amazon certificates
amazon_certificates = [
    "AWS Cloud Practitioner Essentials",
    "AWS Solutions Architect Training",
    "Amazon Machine Learning Specialization",
    "AWS Security Fundamentals",
    "AWS DevOps Engineer Professional",
    "AWS Data Analytics",
    "AWS Certified Developer Associate",
    "AWS Certified Database Specialty"
]

# Certificate issuer
issuer = "Amazon Web Services (AWS)"

# Generate certificates
certificates = []
certificate_id = 0  # Starting ID for certificates
formatted_id = f"{certificate_id:04d}"

for name in names:
    num_certificates = random.randint(0, 3)  # Each person gets 0-3 certificates
    selected_courses = random.sample(amazon_certificates, num_certificates)

    for course in selected_courses:
        certificate = {
            "name": f"{course} - CERT-{formatted_id}",
            "description": f"Awarded to {name} for completing {course}.",
            "type": "certificate",
            "attributes": [
                {"trait_type": "Student Name", "value": name},
                {"trait_type": "Issuer", "value": issuer},
                {"trait_type": "Date of Issue", "value": f"2025-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}"},
                {"trait_type": "Title", "value": course},
                {"trait_type": "Certificate ID", "value": f"CERT-{formatted_id}"},
                {"trait_type": "Expiration Date", "value": f"2028-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}"},
                {"trait_type": "Country", "value": "Singapore"}
            ]
        }

        # Save individual certificates to separate JSON files
        file_name = str(certificate_id)+".json"
        file_path = os.path.join(folder_path, file_name)
        with open(file_path, 'w') as file:
            json.dump(certificate, file, indent=4)

        certificates.append(certificate)
        certificate_id += 1
