from urllib.parse import urlparse


def check_email_domain(email: str | None, website_url: str | None):
    if not email or not website_url:
        return {
            'match': None,
            'reason': 'Missing email or website'
        }

    email_domain = email.split('@')[-1].lower()

    website_domain = urlparse(website_url).netloc.lower()
    website_domain = website_domain.replace('www.', '')

    if (
        email_domain == website_domain or
        email_domain.endswith('.' + website_domain)
    ):
        return {
            'match': True,
            'reason': 'Email domain matches company website'
        }

    return {
        'match': False,
        'reason': 'Email domain does not match company website'
    }