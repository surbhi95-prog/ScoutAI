import { useEffect, useState } from "react";
import { getAdminDashboard } from "../../services/api";
import "./AdminDashboard.css";

function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadDashboard();
    }, []);

    async function loadDashboard() {
        try {
            const data = await getAdminDashboard();
            setStats(data);
        } catch (err) {
            setError("Failed to load dashboard");
        } finally {
            setLoading(false);
        }
    }

    function getPercentage(value) {
        if (!stats || stats.total_reports === 0) {
            return 0;
        }

        return Math.round(
            (value / stats.total_reports) * 100
        );
    }

    if (loading) {
        return (
            <div className="admin-dashboard-page">
                <h1>Admin Dashboard</h1>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-dashboard-page">
                <h1>Admin Dashboard</h1>
                <p className="error-message">{error}</p>
            </div>
        );
    }

    return (
        <div className="admin-dashboard-page">
            <div className="dashboard-header">
                <div>
                    <h1>Admin Dashboard</h1>
                    <p>
                        Overview of ScoutAI activity and verification
                        trends.
                    </p>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <span className="stat-label">
                        Total Users
                    </span>

                    <strong className="stat-value">
                        {stats.total_users}
                    </strong>
                </div>

                <div className="stat-card">
                    <span className="stat-label">
                        Verification Reports
                    </span>

                    <strong className="stat-value">
                        {stats.total_reports}
                    </strong>
                </div>

                <div className="stat-card">
                    <span className="stat-label">
                        Suspicious Reports
                    </span>

                    <strong className="stat-value">
                        {stats.suspicious_reports}
                    </strong>
                </div>

                <div className="stat-card">
                    <span className="stat-label">
                        Manual Reviews
                    </span>

                    <strong className="stat-value">
                        {stats.manual_review_reports}
                    </strong>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <div className="card-header">
                        <div>
                            <h2>Verification Results</h2>
                            <p>
                                Distribution of all verification verdicts.
                            </p>
                        </div>
                    </div>

                    <div className="verdict-chart">
                        <div className="chart-bar-row">
                            <div className="chart-label">
                                <span>Likely Genuine</span>
                                <strong>
                                    {stats.genuine_reports}
                                </strong>
                            </div>

                            <div className="chart-track">
                                <div
                                    className="chart-bar genuine-bar"
                                    style={{
                                        width: `${getPercentage(
                                            stats.genuine_reports
                                        )}%`
                                    }}
                                />
                            </div>

                            <span className="chart-percentage">
                                {getPercentage(
                                    stats.genuine_reports
                                )}%
                            </span>
                        </div>

                        <div className="chart-bar-row">
                            <div className="chart-label">
                                <span>Manual Review</span>
                                <strong>
                                    {stats.manual_review_reports}
                                </strong>
                            </div>

                            <div className="chart-track">
                                <div
                                    className="chart-bar review-bar"
                                    style={{
                                        width: `${getPercentage(
                                            stats.manual_review_reports
                                        )}%`
                                    }}
                                />
                            </div>

                            <span className="chart-percentage">
                                {getPercentage(
                                    stats.manual_review_reports
                                )}%
                            </span>
                        </div>

                        <div className="chart-bar-row">
                            <div className="chart-label">
                                <span>Suspicious</span>
                                <strong>
                                    {stats.suspicious_reports}
                                </strong>
                            </div>

                            <div className="chart-track">
                                <div
                                    className="chart-bar suspicious-bar"
                                    style={{
                                        width: `${getPercentage(
                                            stats.suspicious_reports
                                        )}%`
                                    }}
                                />
                            </div>

                            <span className="chart-percentage">
                                {getPercentage(
                                    stats.suspicious_reports
                                )}%
                            </span>
                        </div>
                    </div>
                </div>

                <div className="dashboard-card">
                    <div className="card-header">
                        <div>
                            <h2>Verification Activity</h2>
                            <p>
                                Reports submitted during the last 7 days.
                            </p>
                        </div>
                    </div>

                    <div className="activity-chart">
                        {stats.activity.map((item) => {
                            const maxCount = Math.max(
                                ...stats.activity.map(
                                    (day) => day.count
                                ),
                                1
                            );

                            const height =
                                (item.count / maxCount) * 100;

                            const date = new Date(
                                `${item.date}T00:00:00`
                            );

                            return (
                                <div
                                    className="activity-column"
                                    key={item.date}
                                >
                                    <span className="activity-count">
                                        {item.count}
                                    </span>

                                    <div className="activity-bar-container">
                                        <div
                                            className="activity-bar"
                                            style={{
                                                height: `${Math.max(
                                                    height,
                                                    item.count > 0
                                                        ? 8
                                                        : 2
                                                )}%`
                                            }}
                                        />
                                    </div>

                                    <span className="activity-date">
                                        {date.toLocaleDateString(
                                            undefined,
                                            {
                                                weekday: "short"
                                            }
                                        )}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
