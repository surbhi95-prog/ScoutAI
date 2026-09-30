import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse

def extract_domain(job_url: str):

    hostname = urlparse(job_url).hostname

    if not hostname:
        return None

    if hostname.startswith("www."):
        hostname = hostname[4:]

    return hostname

def scrape_job_page(job_url: str):

    response = requests.get(
        job_url,
        timeout=10,
        headers={
            "User-Agent": "Mozilla/5.0"
        }
    )

    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    page_title = soup.title.get_text(" ", strip=True) if soup.title else None

    sections = {}

    target_sections = [
        "About the job",
        "Responsibilities",
        "Minimum qualifications",
        "Preferred qualifications"
    ]

    for heading in soup.find_all("h3"):
        heading_text = heading.get_text(" ", strip=True)

        if heading_text not in target_sections:
            continue

        content = []

        for sibling in heading.find_next_siblings():
            if sibling.name == "h3":
                break

            if sibling.name == "p":
                text = sibling.get_text(" ", strip=True)

                if text:
                    content.append(text)

            elif sibling.name == "ul":
                for item in sibling.find_all("li"):
                    text = item.get_text(" ", strip=True)

                    if text:
                        content.append(text)

        sections[heading_text] = " ".join(content)

    job_description = " ".join(
        sections.get(section, "")
        for section in target_sections
    ).strip()

    return {
        "page_title": page_title,
        "job_description": job_description
    }