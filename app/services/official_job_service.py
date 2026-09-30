import os
import re
import serpapi

from difflib import SequenceMatcher
from urllib.parse import urlparse, urljoin

import requests
from dotenv import load_dotenv

load_dotenv()


ATS_DOMAINS = [
    "myworkdayjobs.com",
    "greenhouse.io",
    "lever.co",
    "ashbyhq.com",
    "smartrecruiters.com",
    "icims.com",
    "jobvite.com",
    "workable.com"
]


def get_official_careers_domain(company: str):
    client = serpapi.Client(
        api_key=os.getenv("SERPAPI_KEY")
    )

    results = client.search({
        "engine": "google",
        "q": f"{company} official careers",
        "location": "India"
    })

    organic_results = results.get("organic_results", [])

    for result in organic_results:
        link = result.get("link", "")
        title = result.get("title", "").lower()

        if not link:
            continue

        hostname = urlparse(link).hostname

        if not hostname:
            continue

        hostname = hostname.lower().removeprefix("www.")

        if company.lower() in title and "career" in title:
            return {
                "found": True,
                "url": link,
                "domain": hostname
            }

    return {
        "found": False,
        "url": None,
        "domain": None
    }


def discover_ats_domains(careers_url: str):
    if not careers_url:
        return []

    try:
        response = requests.get(
            careers_url,
            timeout=8,
            headers={
                "User-Agent": "Mozilla/5.0"
            }
        )

        if response.status_code >= 400:
            return []

        html = response.text

        links = re.findall(
            r'href=["\']([^"\']+)["\']',
            html,
            re.IGNORECASE
        )

        ats_domains = set()

        for link in links:
            absolute_url = urljoin(careers_url, link)

            hostname = urlparse(absolute_url).hostname

            if not hostname:
                continue

            hostname = hostname.lower().removeprefix("www.")

            for ats_domain in ATS_DOMAINS:
                if (
                    hostname == ats_domain
                    or hostname.endswith("." + ats_domain)
                ):
                    ats_domains.add(hostname)

        return list(ats_domains)

    except requests.RequestException:
        return []


def search_job_on_domain(
    job_title: str,
    domain: str
):
    client = serpapi.Client(
        api_key=os.getenv("SERPAPI_KEY")
    )

    results = client.search({
        "engine": "google",
        "q": f'site:{domain} "{job_title}"',
        "location": "India"
    })

    organic_results = results.get("organic_results", [])

    best_match = None
    best_score = 0

    for result in organic_results:
        link = result.get("link", "")
        title = result.get("title", "")
        snippet = result.get("snippet", "")

        if not link:
            continue

        hostname = urlparse(link).hostname

        if not hostname:
            continue

        hostname = hostname.lower().removeprefix("www.")

        if not (
            hostname == domain
            or hostname.endswith("." + domain)
        ):
            continue

        similarity = SequenceMatcher(
            None,
            job_title.lower(),
            title.lower()
        ).ratio()

        if job_title.lower() in snippet.lower():
            similarity = max(
                similarity,
                0.70
            )

        if similarity > best_score:
            best_score = similarity
            best_match = result

    if best_match and best_score >= 0.70:
        return {
            "found": True,
            "title": best_match.get("title"),
            "url": best_match.get("link"),
            "snippet": best_match.get("snippet"),
            "match_score": round(best_score, 2)
        }

    return {
        "found": False,
        "title": None,
        "url": None,
        "snippet": None,
        "match_score": round(best_score, 2)
    }


def search_job_on_official_site(
    company: str,
    job_title: str,
    careers_domain: str,
    careers_url: str
):
    job_title = job_title.strip()

    domains_to_search = [careers_domain]

    ats_domains = discover_ats_domains(careers_url)

    for ats_domain in ats_domains:
        if ats_domain not in domains_to_search:
            domains_to_search.append(ats_domain)

    best_result = None

    for domain in domains_to_search:
        result = search_job_on_domain(
            job_title,
            domain
        )

        if result["found"]:
            if (
                best_result is None
                or result["match_score"]
                > best_result["match_score"]
            ):
                best_result = result

    if best_result:
        return best_result

    return {
        "found": False,
        "title": None,
        "url": None,
        "snippet": None,
        "match_score": 0
    }


def search_official_job(
    company: str,
    job_title: str
):
    job_title = job_title.strip()

    careers = get_official_careers_domain(company)

    if not careers["found"]:
        return {
            "found": False,
            "careers_url": None,
            "careers_domain": None,
            "title": None,
            "url": None,
            "snippet": None,
            "match_score": 0
        }

    job = search_job_on_official_site(
        company,
        job_title,
        careers["domain"],
        careers["url"]
    )

    return {
        "found": job["found"],
        "careers_url": careers["url"],
        "careers_domain": careers["domain"],
        "title": job["title"],
        "url": job["url"],
        "snippet": job["snippet"],
        "match_score": job["match_score"]
    }