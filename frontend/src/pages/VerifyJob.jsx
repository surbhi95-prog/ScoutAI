import { useState } from "react";
import Navbar from "../components/Navbar";
import "./VerifyJob.css";
import { verifyJob, extractJob } from "../services/api";
import { createWorker } from "tesseract.js";

function VerifyJob() {
    const [result, setResult] = useState(null);
    const [inputMode, setInputMode] = useState("manual");
    const [pastedMessage, setPastedMessage] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const [isReadingImage, setIsReadingImage] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        company: "",
        job_title: "",
        job_url: "",
        recruiter_email: "",
        job_description: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value,
        });
    };

    const handleModeChange = (mode) => {
        setInputMode(mode);
        setResult(null);
        setError("");
    };

    const populateForm = (extracted) => {
        setFormData({
            company: extracted.company || "",
            job_title: extracted.job_title || "",
            job_url: extracted.job_url || "",
            recruiter_email: extracted.recruiter_email || "",
            job_description: extracted.job_description || "",
        });
        setInputMode("manual");
    };

    const handleExtract = async () => {
        if (!pastedMessage.trim()) {
            return;
        }

        setIsExtracting(true);
        setError("");
        try {
            const extracted = await extractJob(pastedMessage);
            populateForm(extracted);
        } catch (requestError) {
            setError(requestError.message || "Could not extract job details.");
        } finally {
            setIsExtracting(false);
        }
    };

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];
        setError("");

        if (!file) {
            setImageFile(null);
            return;
        }

        if (!file.type.startsWith("image/")) {
            setImageFile(null);
            setError("Choose an image file, such as PNG, JPG, or WEBP.");
            event.target.value = "";
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setImageFile(null);
            setError("The image must be 10 MB or smaller.");
            event.target.value = "";
            return;
        }

        setImageFile(file);
    };

    const handleImageExtract = async () => {
        if (!imageFile) {
            return;
        }

        setIsReadingImage(true);
        setError("");
        let worker;

        try {
            worker = await createWorker("eng");
            const { data } = await worker.recognize(imageFile);
            const recognizedText = data.text.trim();

            if (!recognizedText) {
                throw new Error("No readable text was found in the image. Try a clearer image.");
            }

            setPastedMessage(recognizedText);
            const extracted = await extractJob(recognizedText);
            populateForm(extracted);
        } catch (requestError) {
            setError(requestError.message || "Could not read the uploaded image.");
        } finally {
            if (worker) {
                await worker.terminate();
            }
            setIsReadingImage(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const response = await verifyJob({
                ...formData,
                job_url: formData.job_url || null,
                recruiter_email: formData.recruiter_email || null,
                job_description: formData.job_description || null,
            });

            setResult(response);
        } catch (requestError) {
            setError(requestError.message || "Could not verify this job.");
        }
    };

    return (
        <div className="verify-page">
            <Navbar />

            <main className="verify-container">

                <div className="verify-header">
                    <h1>Verify Before You Trust</h1>
                    <p>Check a job offer for suspicious signals.</p>
                </div>

                <div className="verify-grid">

                    <div className="verify-card form-card">

                        <div className="card-heading">
                            <h2>Job Details</h2>
                            <p>Choose how you want to provide the job offer.</p>
                        </div>

                        <div className="input-mode">
                            <button
                                type="button"
                                className={`mode-button ${
                                    inputMode === "manual" ? "active" : ""
                                }`}
                                onClick={() => handleModeChange("manual")}
                            >
                                Fill Manually
                            </button>

                            <span className="mode-or">or</span>

                            <button
                                type="button"
                                className={`mode-button ${
                                    inputMode === "paste" ? "active" : ""
                                }`}
                                onClick={() => handleModeChange("paste")}
                            >
                                Paste Job Message
                            </button>

                            <span className="mode-or">or</span>

                            <button
                                type="button"
                                className={`mode-button ${
                                    inputMode === "image" ? "active" : ""
                                }`}
                                onClick={() => handleModeChange("image")}
                            >
                                Upload Image
                            </button>
                        </div>

                        {error && (
                            <p className="form-error" role="alert">
                                {error}
                            </p>
                        )}

                        {inputMode === "paste" ? (
                            <div className="paste-section">

                                <div className="form-group">
                                    <label htmlFor="pasted-message">
                                        Job Message
                                    </label>

                                    <textarea
                                        id="pasted-message"
                                        value={pastedMessage}
                                        onChange={(e) =>
                                            setPastedMessage(e.target.value)
                                        }
                                        placeholder="Paste the entire job offer message here..."
                                        rows="12"
                                    ></textarea>
                                </div>

                                <button
                                    type="button"
                                    className="extract-button"
                                    onClick={handleExtract}
                                    disabled={!pastedMessage.trim() || isExtracting}
                                >
                                    {isExtracting ? "Extracting details..." : "Extract Details →"}
                                </button>

                            </div>
                        ) : inputMode === "image" ? (
                            <div className="image-upload-section">
                                <div className="form-group">
                                    <label htmlFor="job-image">
                                        Job Offer Image
                                    </label>

                                    <input
                                        className="image-upload-input"
                                        id="job-image"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        disabled={isReadingImage}
                                    />

                                    <p className="image-upload-help">
                                        Upload a clear screenshot or photo (PNG, JPG, or WEBP; up to 10 MB).
                                    </p>

                                    {imageFile && (
                                        <p className="selected-image-name">
                                            Selected: {imageFile.name}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    className="extract-button"
                                    onClick={handleImageExtract}
                                    disabled={!imageFile || isReadingImage}
                                >
                                    {isReadingImage
                                        ? "Reading image and extracting details..."
                                        : "Read Image & Extract Details →"}
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>

                                <div className="form-group">
                                    <label htmlFor="company">
                                        Company Name
                                    </label>

                                    <input
                                        value={formData.company}
                                        onChange={handleChange}
                                        type="text"
                                        id="company"
                                        placeholder="Enter company name"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="job_title">
                                        Job Title
                                    </label>

                                    <input
                                        value={formData.job_title}
                                        onChange={handleChange}
                                        type="text"
                                        id="job_title"
                                        placeholder="Enter job title"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="job_url">
                                        Job URL <span>(Optional)</span>
                                    </label>

                                    <input
                                        value={formData.job_url}
                                        onChange={handleChange}
                                        type="url"
                                        id="job_url"
                                        placeholder="https://example.com/job"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="recruiter_email">
                                        Recruiter Email <span>(Optional)</span>
                                    </label>

                                    <input
                                        value={formData.recruiter_email}
                                        onChange={handleChange}
                                        type="email"
                                        id="recruiter_email"
                                        placeholder="recruiter@example.com"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="job_description">
                                        Job Description <span>(Optional)</span>
                                    </label>

                                    <input
                                        value={formData.job_description}
                                        onChange={handleChange}
                                        type="text"
                                        id="job_description"
                                        placeholder="Enter job description"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="verify-button"
                                >
                                    Verify Job →
                                </button>

                            </form>
                        )}

                    </div>

                    <div className="verify-card report-card">

                        {!result ? (
                            <div className="report-empty">

                                <div className="report-icon">✦</div>

                                <p className="report-label">
                                    SCOUTAI REPORT
                                </p>

                                <h2>Ready to verify</h2>

                                <p>
                                    Your verification report will appear here
                                    after you submit a job offer.
                                </p>

                            </div>
                        ) : (
                            <div className="verification-result">

                                <div
                                    className={`report-top ${
                                        result.verdict === "Likely Genuine"
                                            ? "genuine"
                                            : result.verdict === "Suspicious"
                                            ? "suspicious"
                                            : "manual-review"
                                    }`}
                                >
                                    <div>
                                        <p className="report-label">
                                            VERIFICATION RESULT
                                        </p>

                                        <h2>{result.verdict}</h2>
                                    </div>

                                    <div className="score">
                                        <span>
                                            {result.confidence_score}
                                        </span>

                                        <small>/100</small>
                                    </div>
                                </div>

                                <div className="signal-grid">

                                    <div className="signal-item">
                                        <span>Official Job</span>

                                        <strong>
                                            {result.official_job_status === "VERIFIED"
                                                ? "Found"
                                                : result.official_job_status === "NOT_FOUND"
                                                ? "Not Found"
                                                : "Unable to Verify"}
                                        </strong>
                                    </div>

                                    <div className="signal-item">
                                        <span>Website</span>

                                        <strong>
                                            {result.signals.website_exists
                                                ? "Found"
                                                : "Not Found"}
                                        </strong>
                                    </div>

                                    <div className="signal-item">
                                        <span>Official Careers Site</span>

                                        <strong>
                                            {result.signals.career_page_exists ? (
                                                <a
                                                    href={result.signals.career_page_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Visit Page →
                                                </a>
                                            ) : (
                                                "Not Found"
                                            )}
                                        </strong>
                                    </div>

                                    <div className="signal-item">
                                        <span>Recruiter Email</span>

                                        <strong>
                                            {result.signals.email_matches_domain === true
                                                ? "Matches"
                                                : result.signals.email_matches_domain === false
                                                ? "Mismatch"
                                                : "Unavailable"}
                                        </strong>
                                    </div>

                                    <div className="signal-item">
                                        <span>Scam Indicators</span>

                                        <strong>
                                            {result.signals.scam_indicators_detected
                                                ? "Detected"
                                                : "None"}
                                        </strong>
                                    </div>

                                </div>

                                <div className="recommendation">

                                    <p className="report-label">
                                        RECOMMENDATION
                                    </p>

                                    <p>
                                        {result.recommendation}
                                    </p>

                                </div>

                            </div>
                        )}

                    </div>

                </div>

            </main>
        </div>
    );
}

export default VerifyJob;