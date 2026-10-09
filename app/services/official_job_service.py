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


NON_OFFICIAL_DOMAINS = [
    "indeed.com",
    "linkedin.com",
    "glassdoor.com",
    "naukri.com",
    "monster.com",
    "ziprecruiter.com",
    "simplyhired.com",
    "foundit.in",
    "ambitionbox.com",
    "wellfound.com",
    "instagram.com",
    "facebook.com",
    "twitter.com",
    "x.com",
    "youtube.com",
    "tiktok.com",
    "reddit.com"
]


def normalize_text(value: str):
    return re.sub(
        r"[^a-z0-9]",
        "",
        value.lower()
    )


def is_blocked_domain(hostname: str):
    hostname = hostname.lower().removeprefix("www.")

    return any(
        hostname == domain
        or hostname.endswith("." + domain)
        for domain in NON_OFFICIAL_DOMAINS
    )


def domain_matches_company(
    hostname: str,
    company: str
):
    # normalize hostname and company name
    normalized_hostname = normalize_text(hostname)
    normalized_company = normalize_text(company)

    # check if company name in hostname, if yes, true
    if (
        normalized_company
        and normalized_company in normalized_hostname
    ):
        return True

    # nahi tr ...
    # split the company name into tokens(strings)
    company_tokens = [
        token
        # find if any of token is in the hostname
        for token in re.findall(
            r"[a-zA-Z0-9]+",
            company.lower()
        )
        if len(token) >= 4
    ]

    if not company_tokens:
        return False

    # atleast one token should match, or atleast half of the tokens should match
    matched_tokens = sum(
        1
        for token in company_tokens
        if token in normalized_hostname
    )

    # return true if matched tokens are greater than or equal to 1
    return matched_tokens >= max(
        1,
        len(company_tokens) // 2
    )

def get_official_careers_domain(company: str):
    client = serpapi.Client(
        api_key=os.getenv("SERPAPI_KEY")
    )

    # search on google the query
    results = client.search({
        "engine": "google",
        "q": f"{company} careers jobs",
        "location": "India"
    })

    # return organic results
    organic_results = results.get(
        "organic_results",
        []
    )

    # print("\n--- SERPAPI CAREERS RESULTS ---")
    # for result in organic_results[:10]:
    #     print(
    #         "TITLE:", result.get("title"),
    #         "| LINK:", result.get("link"),
    #         "| SNIPPET:", result.get("snippet")
    #     )
    # print("--- END RESULTS ---\n")

    # normalize company_name
    company_normalized = normalize_text(company)

    best_candidate = None
    best_score = 0

    # find out link, title, snippet from the organic results for each company
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

        if is_blocked_domain(hostname):
            continue

        normalized_title = normalize_text(title)
        normalized_snippet = normalize_text(snippet)
        normalized_link = normalize_text(link)

        # check if company name in job title
        company_in_title = (
            company_normalized in normalized_title
        )

        # check if company name in snippet
        company_in_snippet = (
            company_normalized in normalized_snippet
        )

        # tokeninze the company name
        # extract hostname
        # check if company name present in host name for each token
        # min 1 token should have hostname 
        domain_matches = domain_matches_company(
            hostname,
            company
        )

        careers_word = (
            "career" in normalized_title
            or "jobs" in normalized_title
            or "job" in normalized_title
        )

        careers_in_link = (
            "career" in normalized_link
            or "jobs" in normalized_link
            or "job" in normalized_link
        )

        score = 0

        if company_in_title:
            score += 5

        if company_in_snippet:
            score += 2

        if domain_matches:
            score += 5

        if careers_word:
            score += 3

        if careers_in_link:
            score += 2

        if domain_matches and careers_word:
            score += 3

        if company_in_title and careers_word:
            score += 2

        if score > best_score:
            best_score = score

            best_candidate = {
                "found": True,
                "url": link,
                "domain": hostname
            }

    if best_candidate and best_score >= 8:
        return best_candidate

    return {
        "found": False,
        "url": None,
        "domain": None
    }

def discover_ats_domains(careers_url: str):
    if not careers_url:
        return []

    try:
        # finnd the career_urls from the req
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

        # find all <a> tags and extract href attributes
        links = re.findall(
            r'href=["\']([^"\']+)["\']',
            html,
            re.IGNORECASE
        )

        # returns unique URLs since it is a set
        # collect all urls as a set
        ats_domains = set()

        # joins extracted link with the base URL to form an absolute URL

        for link in links:
            absolute_url = urljoin(
                careers_url,
                link
            )

            # find the hostname of the abs url
            hostname = urlparse(
                absolute_url
            ).hostname

            if not hostname:
                continue

            hostname = hostname.lower().removeprefix("www.")

            for ats_domain in ATS_DOMAINS:
                if (
                    hostname == ats_domain
                    or hostname.endswith(
                        "." + ats_domain
                    )
                ):
                    ats_domains.add(hostname)

        return list(ats_domains)

    except requests.RequestException:
        return []

def search_job_on_domain(
        company:str,
    job_title: str,
    domain: str
):
    client = serpapi.Client(
        api_key=os.getenv("SERPAPI_KEY")
    )

    results = client.search({
        "engine": "google",
        "q": f'"{company}" "{job_title}" careers jobs',
        "location": "India"
    })

    organic_results = results.get(
        "organic_results",
        []
    )

    # print("\n--- SERPAPI JOB RESULTS ---")
    # for result in organic_results[:10]:
    #     print(
    #         "TITLE:", result.get("title"),
    #         "| LINK:", result.get("link"),
    #         "| SNIPPET:", result.get("snippet")
        # )
    # print("--- END JOB RESULTS ---\n")

    best_match = None
    best_score = 0

    requested_title = job_title.lower().strip()

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

        title_lower = title.lower()
        snippet_lower = snippet.lower()

        similarity = SequenceMatcher(
            None,
            requested_title,
            title_lower
        ).ratio()

        if requested_title in title_lower:
            similarity = 1.0

        if requested_title in snippet_lower:
            similarity = max(
                similarity,
                0.85
            )

        if similarity > best_score:
            best_score = similarity
            best_match = result

    if best_match and best_score >= 0.60:
        return {
            "found": True,
            "title": best_match.get("title"),
            "url": best_match.get("link"),
            "snippet": best_match.get("snippet"),
            "match_score": round(
                best_score,
                2
            )
        }

    return {
        "found": False,
        "title": None,
        "url": None,
        "snippet": None,
        "match_score": round(
            best_score,
            2
        )
    }

def search_job_on_official_site(
    company: str,
    job_title: str,
    careers_domain: str,
    careers_url: str
):
    job_title = job_title.strip()

    domains_to_search = [
        careers_domain
    ]

    ats_domains = discover_ats_domains(
        careers_url
    )

    for ats_domain in ats_domains:
        if ats_domain not in domains_to_search:
            domains_to_search.append(
                ats_domain
            )

    best_result = None

    for domain in domains_to_search:
        result = search_job_on_domain(
            company,job_title,
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

    # Used Serpapi and tokens
    careers = get_official_careers_domain(
        company
    )

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