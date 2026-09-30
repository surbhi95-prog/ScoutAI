import re

SCAM_PATTERNS = [
    # Strong indicators
    (r'registration\s+fee', -40, 'strong'),
    (r'processing\s+fee', -40, 'strong'),
    (r'training\s+fee', -35, 'strong'),
    (r'pay\s+before\s+interview', -50, 'strong'),
    (r'security\s+deposit', -35, 'strong'),

    # Medium indicators
    (r'telegram\s+interview', -15, 'medium'),
    (r'whatsapp\s+interview', -15, 'medium'),

    # Weak indicators
    (r'urgent\s+(hiring|joining|joinee|joiner|requirement)', -5, 'weak'),
    (r'immediate\s+(joiner|joining|joinee)', -5, 'weak'),
    (r'limited\s+seats?', -5, 'weak'),
]
def detect_scam_keywords(text: str | None):
    if not text:
        return []

    text_lower = re.sub(r'[^a-z0-9\s]', ' ', text.lower())

    found = []

    for pattern, penalty, severity in SCAM_PATTERNS:
        match = re.search(pattern, text_lower)

        if match:
            found.append({
                'keyword': match.group(0),
                'penalty': penalty,
                'severity': severity
            })

    return found