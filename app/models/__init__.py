from app.models.verification import VerificationReport
from app.models.company import Company
from app.models.user import User
# SQLAlchemy creates tables only for models it knows about.
# Importing it makes sure it's registered with Base
