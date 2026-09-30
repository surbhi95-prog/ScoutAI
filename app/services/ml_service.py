import joblib
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODEL_PATH = BASE_DIR / "jobshield_model.pkl"

model = joblib.load(MODEL_PATH)


def predict_scam_probability(job_text: str) -> float:
    probabilities = model.predict_proba([job_text])[0]

    classes = model.classes_

    fraudulent_index = list(classes).index(1)

    return float(probabilities[fraudulent_index])