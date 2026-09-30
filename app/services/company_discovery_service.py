import requests


def discover_company_source(company_name: str):
    domain = company_name.lower().replace(" ", "") + ".com"

    url = f"https://{domain}"

    try:
        response = requests.get(
            url,
            timeout=5,
            allow_redirects=True
        )

        if response.status_code < 400:
            return {
                "domain": domain,
                "official_url": response.url,
                "source_type": "official"
            }

    except requests.RequestException:
        pass

    return None