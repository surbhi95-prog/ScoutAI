import requests


def check_company_domain(
    company: str,
    discovered_domain: str | None = None
):
    if discovered_domain:
        candidates = [
            f"https://{discovered_domain}",
            f"https://www.{discovered_domain}"
        ]

    elif "." in company:
        candidates = [
            f"https://{company}",
            f"https://www.{company}"
        ]

    else:
        company_slug = company.lower().replace(" ", "")

        candidates = [
            f"https://{company_slug}.com",
            f"https://www.{company_slug}.com"
        ]

    for url in candidates:
        try:
            response = requests.get(
                url,
                timeout=5
            )

            if response.status_code < 400:
                return {
                    "exists": True,
                    "url": url,
                    "status_code": response.status_code
                }

        except requests.RequestException:
            continue

    return {
        "exists": False,
        "url": None,
        "status_code": None
    }