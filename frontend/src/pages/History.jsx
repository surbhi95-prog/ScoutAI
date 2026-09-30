import Navbar from "../components/Navbar";
import "./History.css";
import { useState, useEffect } from "react";
import { getHistory,clearHistory,deleteReport } from "../services/api";
import { useNavigate } from "react-router-dom";

function History() {
    const navigate = useNavigate();

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm,setSearchTerm] = useState("");
    const [verdictFilter,setVerdictFilter] = useState("all");
    const [dateFilter,setDateFilter] = useState("all");
    const [sortOption,setSortOption] = useState("newest");

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const data = await getHistory();
                console.log("HISTORY DATA:", data);
                console.log("VERDICTS",data.map((report)=>report.verdict));
                setReports(data);
            } catch (error) {
                console.error("HISTORY ERROR:", error);
            } finally {
                setLoading(false);
            }
        };

        loadHistory();
    }, []);

    // to filter reports
    const filteredReports = reports.filter((report)=>{
        // search filter --------------------------
        const search = searchTerm.toLowerCase().trim(); // making it case-insensitive
        
        // verdict ----------------------------
        const matchSearch = 
        report.company.toLowerCase().includes(search) ||
        report.job_title.toLowerCase().includes(search)

        const matchVerdict =
            verdictFilter === "all" ||
            report.verdict.trim().toLowerCase() === verdictFilter.trim().toLowerCase();

        // date filter ----------------------------
        const reportDate = new Date(report.created_at); // report's date
        const now = new Date(); // today's date
    
        let matchDate = true;
        // ---- today -------------
        if(dateFilter === 'today')
        {
            matchDate = reportDate.toDateString() === now.toDateString();
        }
        // ----- week --------------
        if(dateFilter === 'week')
        {
            const startOfWeek = new Date(now); // 
            startOfWeek.setDate(now.getDate() - now.getDay()); // getDay return Sunday-> 0.....

            startOfWeek.setHours(0,0,0,0); // hr, mins, sec, millisec

            matchDate = reportDate >= startOfWeek;
        }
        // -------- month ---------
        if(dateFilter==='month')
        {
            matchDate=
                reportDate.getMonth() === now.getMonth() &&
                reportDate.getFullYear() === now.getFullYear();
        }

        return matchSearch && matchVerdict && matchDate;
        
    });

    // SORTING FILTER
        const sortedReports = [...filteredReports].sort((a,b)=>
        {
            if (sortOption === "newest") {
                return new Date(b.created_at) - new Date(a.created_at);
            }

            if (sortOption === "oldest") {
                return new Date(a.created_at) - new Date(b.created_at);
            }

            if (sortOption === "highest") {
                return b.confidence_score - a.confidence_score;
            }

            if (sortOption === "lowest") {
                return a.confidence_score - b.confidence_score;
            }
            return 0;
        });

    // Clear history 
    const handleClearHistory =  async () =>{
        const confirmed = window.confirm(
            "Are you sure you want to clear all verification history?"
        );

        if(!confirmed) return;
        try{
            await clearHistory();
            setReports([]);
        }catch(error){
            console.error("CLEAR HISTORY ERROR",error);
        }
    };

    // Deleting a single report
    const handleDelete = async(id) =>{
        const confirmed = window.confirm(
            "Are you sure you want to delete this report?"
        );

        if(!confirmed) { return; }

        try{
            await deleteReport(id);

            setReports( prevReports =>
                prevReports.filter(report => report.id !== id)
            );
        } catch(error){
            console.error(error);
            alert("Failed to delete report.");
        }
    };

    return (
        <div className="history-page">
            <Navbar />

            <main className="history-container">

                <div className="history-hero">

                    <div className="history-header">
                        <div>
                            <p className="history-label">SCOUTAI</p>

                            <h1>Verification History</h1>

                            <p>
                                Review your previous job verification reports.
                            </p>
                        </div>

                        <button 
                            className="clear-history-button"
                            onClick={handleClearHistory}>
                            Clear History
                        </button>
                    </div>

                    <div className="history-toolbar">

                        <input
                            type="text"
                            placeholder="Search company or job title..."
                            value={searchTerm}
                            onChange={(e)=> setSearchTerm(e.target.value)}
                        />

                        <select
                            defaultValue="all"
                            value={verdictFilter}
                            onChange={(e)=> setVerdictFilter(e.target.value)}
                            >
                            <option value="all">All Verdicts</option>
                            <option value="Likely Genuine">Likely Genuine</option>
                            <option value="Needs Manual Review">Needs Manual Review</option>
                            <option value="Suspicious">Suspicious</option>
                        </select>

                        <select 
                            defaultValue="all"
                            value={dateFilter}
                            onChange={(e)=>setDateFilter(e.target.value)}
                            >
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>

                        <select 
                            defaultValue="newest"
                            value={sortOption}
                            onChange={(e)=>setSortOption(e.target.value)}
                            >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="highest">Highest Score</option>
                            <option value="lowest">Lowest Score</option>
                        </select>

                    </div>

                </div>

                <div className="history-list">

                    {loading ? (
                        <div className="history-empty">
                            <h2>Loading history...</h2>
                        </div>

                    ) : filteredReports.length === 0 ? ( // if Filter returns nothing

                        <div className="history-empty">
                            <div className="history-empty-icon">✦</div>

                            <p className="history-label">
                                NO REPORTS YET
                            </p>

                            <h2>Your history is empty</h2>

                            <p>
                                Your previous job verification reports
                                will appear here.
                            </p>
                        </div>

                    ) : (

                        sortedReports.map((report) => (
                            <div
                                className="history-card"
                                key={report.id}
                                onClick={() =>
                                    navigate(`/history/${report.id}`)
                                }
                            >

                                <div className="history-card-main">

                                    <p className="history-card-company">
                                        {report.company}
                                    </p>

                                    <h2>
                                        {report.job_title}
                                    </h2>

                                    <p className="history-card-date">
                                        Verified{" "}
                                        {new Date(
                                            report.created_at
                                        ).toLocaleDateString()}
                                    </p>

                                </div>

                                <div className="history-card-result">

                                    <strong>
                                        {report.verdict}
                                    </strong>

                                    <span>
                                        {report.confidence_score}/100
                                    </span>

                                    <button
                                        className="delete-report-button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(report.id);
                                        }}
                                    >
                                        Delete
                                    </button>

                                </div>

                            </div>
                        ))

                    )}

                </div>

            </main>
        </div>
    );
}

export default History;