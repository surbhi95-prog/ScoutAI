import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getReportById } from "../services/api";
import "./ReportDetails.css";

function ReportDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadReport = async () => {
            try {
                const data = await getReportById(id);
                setReport(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        loadReport();
    }, [id]);

    if (loading) {
        return (
            <div className="report-details-page">
                <Navbar />
                <main className="report-details-container">
                    <p>Loading report...</p>
                </main>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="report-details-page">
                <Navbar />
                <main className="report-details-container">
                    <h2>Report not found</h2>
                    <button onClick={() => navigate("/history")}>
                        Back to History
                    </button>
                </main>
            </div>
        );
    }

    return (
    <div className="report-details-page">
        <Navbar />

        <main className="report-details-container">

            <button
                className="back-button"
                onClick={() => navigate("/history")}
            >
                ← Back to History
            </button>

            <div className="detail-header">

                <div>
                    <p className="history-label">
                        VERIFICATION REPORT
                    </p>

                    <h1>{report.company}</h1>

                    <p className="detail-job-title">
                        {report.job_title}
                    </p>

                    <p className="detail-date">
                        Verified{" "}
                        {new Date(report.created_at).toLocaleString()}
                    </p>
                </div>

                <div className="detail-score">
                    <span>{report.confidence_score}</span>
                    <small>/100</small>
                </div>

            </div>

            <div className="detail-grid">

                <div className="detail-card verdict-card">
                    <p className="history-label">VERDICT</p>
                    <h2>{report.verdict}</h2>
                </div>

                <div className="detail-card">
                    <p className="history-label">
                        VERIFICATION SIGNALS
                    </p>

                    <div className="detail-signals">

                        <div>
                            <span>Official Job</span>
                            <strong>
                                {report.official_job_status === "VERIFIED"
                                    ? "Found"
                                    : report.official_job_status === "NOT_FOUND"
                                    ? "Not Found"
                                    : "Unable to Verify"
                                    }
                            </strong>
                        </div>

                        <div>
                            <span>Company Website</span>
                            <strong>
                                {report.website_exists
                                    ? "Reachable"
                                    : "Not Reachable"}
                            </strong>
                        </div>

                        <div>
                            <span>Recruiter Email</span>
                            <strong>
                                {report.email_matches_domain === true
                                    ? "Matches"
                                    : report.email_matches_domain === false
                                    ? "Mismatch"
                                    : "Unavailable"}
                            </strong>
                        </div>

                    </div>
                </div>

                <div className="detail-card reasons-card">

                    <p className="history-label">
                        REASONS
                    </p>

                    <div className="reason-list">
                        {report.reasons
                            ?.split(" | ")
                            .map((reason, index) => (
                                <div className="reason-item" key={index}>
                                    <span>✓</span>
                                    <p>{reason}</p>
                                </div>
                            ))}
                    </div>

                </div>

                <div className="detail-card links-card">

                    <p className="history-label">
                        VERIFIED SOURCES
                    </p>

                    <div className="source-row">
                        <span>Company Website</span>

                        {report.website_url ? (
                            <a
                                href={report.website_url}
                                target="_blank"
                                rel="noreferrer"
                            >
                                Visit ↗
                            </a>
                        ) : (
                            <span>Unavailable</span>
                        )}
                    </div>

                    <div className="source-row">
                        <span>Official Job</span>

                        {report.official_job_url ? (
                            <a
                                href={report.official_job_url}
                                target="_blank"
                                rel="noreferrer"
                            >
                                View Job ↗
                            </a>
                        ) : (
                            <span>Not Found</span>
                        )}
                    </div>

                </div>

                <div className="detail-card ml-card">

                    <p className="history-label">
                        AI ANALYSIS
                    </p>

                    <div className="ml-value">
                        {report.ml_scam_probability !== null
                            ? `${Math.round(
                                report.ml_scam_probability * 100
                            )}%`
                            : "Unavailable"}
                    </div>

                    <p>
                        Estimated scam probability from the
                        machine learning model.
                    </p>

                </div>

            </div>

        </main>
    </div>
);
}

export default ReportDetails;