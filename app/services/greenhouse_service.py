import requests

GREENHOUSE_BOARDS = {
    'airbnb': 'airbnb',
    'stripe': 'stripe',
    'google': 'google',
    'microsoft': 'microsoft',
    'facebook': 'facebook',
    'anthropic': 'anthropic',
    'technova':'technova',
}


def search_greenhouse_job(company: str, job_title: str):
    board = GREENHOUSE_BOARDS.get(company.lower())

    if not board:
        return None

    url = f'https://boards-api.greenhouse.io/v1/boards/{board}/jobs'

    response = requests.get(url, timeout=10)

    if response.status_code != 200:
        return None

    jobs = response.json().get('jobs', []) # return jobs or an empty list

    for job in jobs:
        title = job.get('title', '').lower()

        if job_title.lower() in title:
            return {
                'title': job.get('title'),
                'url': job.get('absolute_url')
            }

    return None