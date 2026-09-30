import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import {
//     LineChart,
//     Line,
//     PieChart,
//     Pie,
//     Cell,
//     XAxis,
//     YAxis,
//     CartesianGrid,
//     Tooltip,
//     Legend
// } from "recharts";

import Navbar from "../components/Navbar";
import { getHistory } from "../services/api";
import "./Dashboard.css";

function Dashboard() {
    const navigate = useNavigate();

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const data = await getHistory();
                setReports(data);
            } catch (error) {
                console.error(error);
                setError("Unable to load dashboard data.");
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    const genuineCount = reports.filter(
        report => report.verdict === "Likely Genuine"
    ).length;

    const suspiciousCount = reports.filter(
        report => report.verdict === "Suspicious"
    ).length;

    const manualReviewCount = reports.filter(
        report => report.verdict === "Needs Manual Review"
    ).length;

    const verdictData = [
        {
            name: "Likely Genuine",
            value: genuineCount
        },
        {
            name: "Suspicious",
            value: suspiciousCount
        },
        {
            name: "Manual Review",
            value: manualReviewCount
        }
    ];

    const activityMap = {};

    reports.forEach(report => {
        const date = new Date(report.created_at);

        const dateLabel = date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short"
        });

        activityMap[dateLabel] = (activityMap[dateLabel] || 0) + 1;
    });

    const activityData = Object.entries(activityMap)
        .reverse()
        .map(([date, count]) => ({
            date,
            count
        }));

    const recentReports = reports.slice(0, 5);

    return (
        <div className="dashboard-page">
            <Navbar />

            <main className="dashboard-container">

                <div className="dashboard-header">
                    <div>
                        <p className="dashboard-label">SCOUTAI DASHBOARD</p>

                        <h1>
                            Welcome back, {localStorage.getItem("user_name")}!
                        </h1>

                        <p>
                            Keep track of your job verification activity.
                        </p>
                    </div>

                    <button
                        className="dashboard-verify-button"
                        onClick={() => navigate("/verify")}
                    >
                        Verify a Job →
                    </button>
                </div>

                {loading ? (
                    <div className="dashboard-loading">
                        Loading dashboard...
                    </div>
                ) : error ? (
                    <div className="dashboard-error">
                        {error}
                    </div>
                ) : (
                    <>
                        <div className="dashboard-stats">

                            <div className="dashboard-stat-card">
                                <span>Total Reports</span>
                                <strong>{reports.length}</strong>
                            </div>

                            <div className="dashboard-stat-card">
                                <span>Likely Genuine</span>
                                <strong>{genuineCount}</strong>
                            </div>

                            <div className="dashboard-stat-card">
                                <span>Suspicious</span>
                                <strong>{suspiciousCount}</strong>
                            </div>

                            <div className="dashboard-stat-card">
                                <span>Manual Review</span>
                                <strong>{manualReviewCount}</strong>
                            </div>

                        </div>

                        <div className="dashboard-charts">
                            <div className="dashboard-chart-card">

                                {/* Verification Results donut chart -------------------------- */}
                                <div className="dashboard-section-heading">
                                    <p className="dashboard-label">OVERVIEW</p>
                                    <h2>Verification Results</h2>
                                </div>

                                {reports.length === 0 ? (
                                    <div className="chart-empty">
                                        No verification data yet.
                                    </div>
                                ) : (
                                    <div className="donut-container">
                                        <div
                                            className="donut-chart"
                                            style={{
                                                background: `conic-gradient(
                                                    #22c55e 0deg ${genuineCount / reports.length * 360}deg,
                                                    #ef4444 ${genuineCount / reports.length * 360}deg ${(genuineCount + suspiciousCount) / reports.length * 360}deg,
                                                    #f59e0b ${(genuineCount + suspiciousCount) / reports.length * 360}deg 360deg
                                                )`
                                            }}
                                        >
                                            <div className="donut-center">
                                                <strong>{reports.length}</strong>
                                                <span>Total</span>
                                            </div>
                                        </div>

                                        <div className="donut-legend">
                                            <div>
                                                <span className="legend-dot genuine"></span>
                                                Likely Genuine
                                                <strong>{genuineCount}</strong>
                                            </div>

                                            <div>
                                                <span className="legend-dot suspicious"></span>
                                                Suspicious
                                                <strong>{suspiciousCount}</strong>
                                            </div>

                                            <div>
                                                <span className="legend-dot manual"></span>
                                                Manual Review
                                                <strong>{manualReviewCount}</strong>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Second Verification Activity card ----------------------------------------- */}
                            <div className="dashboard-chart-card">
                                <div className="dashboard-section-heading">
                                    <p className="dashboard-label">ACTIVITY</p>
                                    <h2>Verification Activity</h2>
                                </div>

                                {reports.length === 0 ? (
                                    <div className="chart-empty">
                                        No verification activity yet.
                                    </div>
                                ) : (
                                    <div className="activity-chart">
                                        {activityData.map(item => (
                                            <div className="activity-column" key={item.date}>
                                                <div className="activity-bar-wrapper">
                                                    <div
                                                        className="activity-bar"
                                                        style={{
                                                            height: `${Math.max(
                                                                (item.count /
                                                                    Math.max(
                                                                        ...activityData.map(
                                                                            data => data.count
                                                                        )
                                                                    )) *
                                                                    180,
                                                                8
                                                            )}px`
                                                        }}
                                                    >
                                                        <span>{item.count}</span>
                                                    </div>
                                                </div>

                                                <span className="activity-date">
                                                    {item.date}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    {/* ---<div className="dashboard-charts">

                            <section className="dashboard-chart-card">

                                <div className="dashboard-section-heading">
                                    <p className="dashboard-label">
                                        OVERVIEW
                                    </p>

                                    <h2>
                                        Verification Results
                                    </h2>
                                </div>

                                {reports.length === 0 ? (
                                    <div className="chart-empty">
                                        No verification data yet.
                                    </div>
                                ) : (
                                    // <ResponsiveContainer
                                    //     width="100%"
                                    //     height={300}
                                    // >
                                        <PieChart width={400} height={300}>
                                            <Pie
                                                data={verdictData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={75}
                                                outerRadius={110}
                                                paddingAngle={3}
                                            >
                                                {verdictData.map(
                                                    (entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                        />
                                                    )
                                                )}
                                            </Pie>

                                            <Tooltip />

                                            <Legend />
                                        </PieChart>
                                    // </ResponsiveContainer>
                                )}

                            </section>

                            <section className="dashboard-chart-card">

                                <div className="dashboard-section-heading">
                                    <p className="dashboard-label">
                                        ACTIVITY
                                    </p>

                                    <h2>
                                        Verification Activity
                                    </h2>
                                </div>

                                {reports.length === 0 ? (
                                    <div className="chart-empty">
                                        No verification activity yet.
                                    </div>
                                ) : (
                                    // <ResponsiveContainer
                                    //     width="100%"
                                    //     height={300}
                                    // >
                                        <LineChart width={400} height={300} data={activityData}>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                            />

                                            <XAxis
                                                dataKey="date"
                                            />

                                            <YAxis
                                                allowDecimals={false}
                                            />

                                            <Tooltip />

                                            <Line
                                                type="monotone"
                                                dataKey="count"
                                                name="Verifications"
                                                strokeWidth={3}
                                                dot={{ r: 4 }}
                                            />
                                        </LineChart>
                                    // </ResponsiveContainer>
                                )}

                            </section>

                        </div> */}

                        <section className="dashboard-recent">

                            <div className="dashboard-section-heading">
                                <div>
                                    <p className="dashboard-label">
                                        ACTIVITY
                                    </p>

                                    <h2>
                                        Recent Verifications
                                    </h2>
                                </div>

                                {reports.length > 0 && (
                                    <button
                                        className="dashboard-history-button"
                                        onClick={() => navigate("/history")}
                                    >
                                        View All →
                                    </button>
                                )}
                            </div>

                            {recentReports.length === 0 ? (
                                <div className="dashboard-empty">
                                    <div className="dashboard-empty-icon">
                                        ✦
                                    </div>

                                    <h3>
                                        No verifications yet
                                    </h3>

                                    <p>
                                        Verify your first job offer to see
                                        your activity here.
                                    </p>

                                    <button
                                        className="dashboard-empty-button"
                                        onClick={() => navigate("/verify")}
                                    >
                                        Verify Your First Job
                                    </button>
                                </div>
                            ) : (
                                <div className="recent-reports-list">

                                    {recentReports.map(report => (
                                        <div
                                            className="recent-report"
                                            key={report.id}
                                            onClick={() =>
                                                navigate(
                                                    `/history/${report.id}`
                                                )
                                            }
                                        >
                                            <div className="recent-report-main">
                                                <h3>
                                                    {report.job_title}
                                                </h3>

                                                <p>
                                                    {report.company}
                                                </p>
                                            </div>

                                            <div className="recent-report-right">

                                                <span
                                                    className={`verdict-badge ${report.verdict
                                                        .toLowerCase()
                                                        .replaceAll(" ", "-")}`}
                                                >
                                                    {report.verdict}
                                                </span>

                                                <span className="recent-report-score">
                                                    {report.confidence_score}/100
                                                </span>

                                            </div>
                                        </div>
                                    ))}

                                </div>
                            )}

                        </section>

                    </>
                )}

            </main>
        </div>
    );
}

export default Dashboard;