# 
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

    # searcing for jobs on the Greenhouse API
    url = f'https://boards-api.greenhouse.io/v1/boards/{board}/jobs'

    # whatever api response we get is stored
    response = requests.get(url, timeout=10)

    if response.status_code != 200:
        return None
    # extracting the job values from the json response, if no jobs are found, an empty list is returned
    jobs = response.json().get('jobs', []) # return jobs or an empty list

    for job in jobs:
        # extracting all the job titles from the API response
        title = job.get('title', '').lower()

        if job_title.lower() in title: # checking it our job_title is there
            return {
                # returns its listed title and url
                'title': job.get('title'),
                'url': job.get('absolute_url')
            }

    return None
