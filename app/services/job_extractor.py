import re
from gliner2 import AutoExtractor

extractor = AutoExtractor.from_pretrained(
    "fastino/gliner2.5-base-v1"
)

LABELS = {
    "company": "Company or employer organization",
    "job_title": "Job title, position, role, or designation being offered",
    "person": "Person involved in recruitment",
}

def extract_email(text: str):
    match = re.search(
        r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",
        text
    )
    return match.group(0) if match else None

def extract_url(text: str):
    match = re.search(
        r"https?://[^\s<>\"']+",
        text
    )
    return match.group(0).rstrip(".,)") if match else None

def extract_phone(text: str):
    match = re.search(
        r"(?<!\d)(?:\+?\d[\d\s().-]{8,}\d)(?!\d)",
        text
    )
    return match.group(0).strip() if match else None

def extract_job(text: str):
    result = extractor.extract_entities(
        text,
        LABELS
    )

    entities = result.get("entities", {})

    company = None
    job_title = None
    person = None

    if entities.get("company"):
        company = entities["company"][0]

    if entities.get("job_title"):
        job_title = entities["job_title"][0]

    if entities.get("person"):
        person = entities["person"][0]

    return {
        "company": company,
        "job_title": job_title,
        "recruiter_name": person,
        "recruiter_email": extract_email(text),
        "job_url": extract_url(text),
        "phone": extract_phone(text),
        "job_description": text.strip()
    }