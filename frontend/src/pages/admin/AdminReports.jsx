import { useEffect, useState } from "react";
import { getAdminReports,deleteAdminReport } from "../../services/api";
import "./AdminReports.css";

function AdminReports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadReports();
    }, []);

    async function loadReports() {
        try {
            const data = await getAdminReports();
            setReports(data);
        } catch (err) {
            setError("Failed to load reports");
        } finally {
            setLoading(false);
        }
    }

    function getVerdictClass(verdict) {
        if (verdict === "Likely Genuine") {
            return "genuine";
        }

        if (verdict === "Needs Manual Review") {
            return "review";
        }

        return "suspicious";
    }

    if (loading) {
        return (
            <div className="admin-reports-page">
                <h1>Verification Reports</h1>
                <p>Loading reports...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-reports-page">
                <h1>Verification Reports</h1>
                <p className="error-message">{error}</p>
            </div>
        );
    }

    async function handleDelete(reportId) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this verification report?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await deleteAdminReport(reportId);

            setReports((currentReports) =>
                currentReports.filter(
                    (report) => report.id !== reportId
                )
            );
        } catch (err) {
            alert("Failed to delete report");
        }
    }

    return (
        <div className="admin-reports-page">
            <div className="reports-header">
                <div>
                    <h1>Verification Reports</h1>
                    <p>Review job verification activity across all users.</p>
                </div>

                <span className="report-count">
                    {reports.length} Reports
                </span>
            </div>

            {reports.length === 0 ? (
                <div className="empty-state">
                    <h3>No verification reports</h3>
                    <p>No users have submitted a job verification yet.</p>
                </div>
            ) : (
                <div className="reports-table-container">
                    <table className="reports-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>User ID</th>
                                <th>Company</th>
                                <th>Job Title</th>
                                <th>Verdict</th>
                                <th>Score</th>
                                <th>Official Job</th>
                                <th>Website</th>
                                <th>Email</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {reports.map((report) => (
                                <tr key={report.id}>
                                    <td>#{report.id}</td>

                                    <td>{report.user_id}</td>

                                    <td className="company-name">
                                        {report.company}
                                    </td>

                                    <td>{report.job_title}</td>

                                    <td>
                                        <span
                                            className={`verdict-badge ${getVerdictClass(
                                                report.verdict
                                            )}`}
                                        >
                                            {report.verdict}
                                        </span>
                                    </td>

                                    <td>
                                        <strong>
                                            {report.confidence_score}
                                        </strong>
                                    </td>

                                    <td>
                                        <span
                                            className={
                                                report.official_job_status ===
                                                "VERIFIED"
                                                    ? "status verified"
                                                    : report.official_job_status ===
                                                      "NOT_FOUND"
                                                    ? "status not-found"
                                                    : "status unable"
                                            }
                                        >
                                            {report.official_job_status ||
                                                "Unable"}
                                        </span>
                                    </td>

                                    <td>
                                        {report.website_exists
                                            ? "Yes"
                                            : "No"}
                                    </td>

                                    <td>
                                        {report.email_matches_domain === null
                                            ? "N/A"
                                            : report.email_matches_domain
                                            ? "Match"
                                            : "Mismatch"}
                                    </td>

                                    <td>
                                        {new Date(
                                            report.created_at
                                        ).toLocaleDateString()}
                                    </td>

                                    <td>
                                        <button
                                            type="button"
                                            className="delete-report-button"
                                            onClick={() => handleDelete(report.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default AdminReports;