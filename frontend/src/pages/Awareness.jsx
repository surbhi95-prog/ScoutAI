import React from "react";
import Navbar from "../components/Navbar";
import "./Awareness.css";

const redFlags = [
    {
        icon: "💰",
        title: "They ask you to pay money",
        text: "Never pay registration fees, security deposits, training fees, equipment charges, or any other upfront payment to get a job."
    },
    {
        icon: "🌐",
        title: "The job isn't on the official website",
        text: "Check the company's official website and careers page. If you cannot independently verify the opening, stop and investigate before applying."
    },
    {
        icon: "📧",
        title: "Suspicious recruiter email",
        text: "Be careful when a recruiter uses Gmail, Yahoo, or another personal email instead of a verifiable company domain."
    },
    {
        icon: "⚡",
        title: "They pressure you to act immediately",
        text: "Messages like 'accept now', 'limited seats', or 'offer expires today' are warning signs. Legitimate employers generally give candidates reasonable time to consider an offer."
    },
    {
        icon: "💸",
        title: "Unusually high pay for very little work",
        text: "Be cautious of offers promising unusually high salaries, easy money, or guaranteed income without matching experience or responsibilities."
    },
    {
        icon: "🔐",
        title: "They ask for sensitive information too early",
        text: "Do not share banking details, passwords, OTPs, identity documents, or other sensitive information before independently verifying the employer and hiring process."
    },
    {
        icon: "📱",
        title: "Only WhatsApp or Telegram communication",
        text: "Unexpected job offers through WhatsApp, Telegram, or social media deserve extra scrutiny, especially when there is no verifiable company hiring process."
    },
    {
        icon: "👤",
        title: "The recruiter cannot be verified",
        text: "Check whether the recruiter has a credible professional presence and whether their role can be connected to the company. A missing or suspicious profile is a warning sign, not automatic proof of fraud."
    },
    {
        icon: "🏦",
        title: "They ask you to move money",
        text: "Never use your personal bank account to receive or transfer money for an unknown employer. A legitimate job should not turn you into a middleman for financial transactions."
    }
];

const verificationSteps = [
    {
        number: "01",
        title: "Find the real company website",
        text: "Search for the company independently instead of trusting the link or contact information sent by the recruiter."
    },
    {
        number: "02",
        title: "Check the careers page",
        text: "Look for the exact job title, location, and job description on the company's official careers page."
    },
    {
        number: "03",
        title: "Verify the recruiter",
        text: "Check the recruiter's name, professional profile, company affiliation, and email domain. Do not rely only on information provided in the message."
    },
    {
        number: "04",
        title: "Research the offer",
        text: "Search the company and recruiter name together with words such as 'scam', 'fraud', 'complaint', or 'review'."
    },
    {
        number: "05",
        title: "Check the URL carefully",
        text: "Look for misspellings, unusual domains, or websites pretending to be the real company. A small change in a domain can be a major warning sign."
    },
    {
        number: "06",
        title: "Stop if money is involved",
        text: "If someone asks you to pay before getting the job, send money back, buy gift cards, deposit a check, or transfer funds, walk away."
    }
];

function Awareness() {
    return (
        <div className="awareness-page">
            <Navbar />
            <section className="awareness-hero">
                <div className="awareness-badge">🛡️ JOB SCAM AWARENESS</div>

                <h1>
                    Don't let a fake job
                    <span> become a real loss.</span>
                </h1>

                <p>
                    Fake job offers can look surprisingly professional.
                    Learn the warning signs, verify the opportunity independently,
                    and protect your money and personal information.
                </p>

                <div className="hero-warning">
                    <strong>Remember:</strong> One red flag does not automatically
                    prove a job is fake. Multiple warning signs together should
                    make you stop and verify.
                </div>
            </section>

            <section className="awareness-section">
                <div className="section-heading">
                    <span>01</span>
                    <div>
                        <h2>Red flags to watch for</h2>
                        <p>
                            If an opportunity shows several of these signs,
                            slow down before sharing information or accepting it.
                        </p>
                    </div>
                </div>

                <div className="red-flags-grid">
                    {redFlags.map((flag, index) => (
                        <div className="red-flag-card" key={index}>
                            <div className="flag-icon">{flag.icon}</div>
                            <h3>{flag.title}</h3>
                            <p>{flag.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="awareness-section verify-section">
                <div className="section-heading">
                    <span>02</span>
                    <div>
                        <h2>How to verify a job</h2>
                        <p>
                            Don't trust the message alone. Verify the opportunity
                            using information you find independently.
                        </p>
                    </div>
                </div>

                <div className="verification-list">
                    {verificationSteps.map((step) => (
                        <div className="verification-step" key={step.number}>
                            <div className="step-number">{step.number}</div>

                            <div>
                                <h3>{step.title}</h3>
                                <p>{step.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="stop-section">
                <div className="stop-icon">🚨</div>

                <div>
                    <h2>When in doubt, stop.</h2>
                    <p>
                        Don't send money. Don't share sensitive information.
                        Don't let someone else's urgency become your emergency.
                        Verify the company and job through official channels first.
                    </p>
                </div>
            </section>

            <section className="awareness-section">
                <div className="section-heading">
                    <span>03</span>
                    <div>
                        <h2>Before you accept an offer</h2>
                        <p>Use this quick checklist.</p>
                    </div>
                </div>

                <div className="checklist-card">
                    <div className="check-item">
                        <span>✓</span>
                        <p>I found the company's official website independently.</p>
                    </div>

                    <div className="check-item">
                        <span>✓</span>
                        <p>I checked whether the job exists on the official careers page.</p>
                    </div>

                    <div className="check-item">
                        <span>✓</span>
                        <p>I can verify the recruiter's identity and company affiliation.</p>
                    </div>

                    <div className="check-item">
                        <span>✓</span>
                        <p>I am not being asked to pay money to get the job.</p>
                    </div>

                    <div className="check-item">
                        <span>✓</span>
                        <p>I have not been pressured into accepting immediately.</p>
                    </div>

                    <div className="check-item">
                        <span>✓</span>
                        <p>I have not been asked for sensitive information unnecessarily.</p>
                    </div>
                </div>
            </section>

            <section className="awareness-cta">
                <div>
                    <span className="cta-label">NOT SURE ABOUT AN OFFER?</span>
                    <h2>Verify before you apply.</h2>
                    <p>
                        Let ScoutAI analyze the job details and help you identify
                        potential warning signs.
                    </p>
                </div>

                <a href="/verify" className="awareness-cta-btn">
                    Verify a Job →
                </a>
            </section>

            <footer className="awareness-source">
                <p>
                    Awareness guidance based on recommendations from the
                    U.S. Federal Trade Commission and FBI.
                </p>
            </footer>

        </div>
    );
}

export default Awareness;