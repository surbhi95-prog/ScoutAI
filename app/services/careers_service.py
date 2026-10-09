#
import requests

# it will only check if the url is reachable, it wont find if the actual job exists
def check_careers_page(careers_url: str | None):
    if not careers_url:
        return {
            "exists": False,
            "url": None
        }

    try:
        response = requests.get(
            careers_url,
            timeout=5
        )

        if response.status_code < 400:
            return {
                "exists": True,
                "url": careers_url
            }

    except requests.RequestException:
        pass

    return {
        "exists": False,
        "url": careers_url
    }