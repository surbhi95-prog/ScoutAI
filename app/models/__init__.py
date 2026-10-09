from app.models.verification import VerificationReport
from app.models.company import Company
from app.models.user import User
from app.models.scam_indicator import ScamIndicator
# SQLAlchemy creates tables only for models it knows about.
# Importing it makes sure it's registered with Base
