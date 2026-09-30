import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css";

function Signup() {
    // console.log("SIGNUP COMPONENT LOADED");
    const navigate = useNavigate();
    const [showSignUpPassword, setShowSignUpPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // SignUp form states
    const [name,setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [termsAccepted, setTermsAccepted] = useState(false);

    const handleSignup = async (e) =>{
        e.preventDefault();
        console.log("SIGNUP SUBMITTED");
        console.log("Password:", password);
        console.log("Confirm Password:", confirmPassword);

        if(password!== confirmPassword){
            alert("Passwords do not match");
            return;
        }
        if(!termsAccepted){
            alert("Please accept the terms and conditions");
            return;
        }

        try{
            const response = await fetch("http://127.0.0.1:8000/auth/signup",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body: JSON.stringify({
                    name,
                    email,
                    password
                })
            });

            const data = await response.json();

            if(!response.ok){
                alert(data.detail || "Signup failed");
                return;
            }

            alert("Account created successfully!");

            navigate("/login");
        }
        catch(error){
            console.log("SIGNUP ERROR:",error);
            alert("Unable to connect to the server");
        }
    };
    return (
        <div className="signup-page">

            <div className="signup-card">

                {/* Top branding */}
                <div className="signup-header">
                    <div className="signup-logo">🛡️</div>

                    <div>
                        <p className="signup-brand">ScoutAI</p>
                        <p className="signup-tagline">
                            Find opportunities. Stay protected.
                        </p>
                    </div>
                </div>

                {/* Heading */}
                <div className="signup-heading">
                    <h1>Create your account</h1>
                    <p>
                        Join ScoutAI and stay protected from fake job offers.
                    </p>
                </div>


                {/* Form */}
                <form className="signup-form" onSubmit={handleSignup}>

                    <div className="name-field">
                        <label htmlFor="name">
                            Full name<span>*</span>
                        </label>

                        <input
                            value={name}
                            onChange={(e)=>setName(e.target.value)}
                            type="text"
                            id="name"
                            placeholder="Enter your full name"
                            required
                        />
                    </div>

                    <div className="email-field">
                        <label htmlFor="signup-email">
                            Email address<span>*</span>
                        </label>

                        <input
                            value={email}
                            onChange={(e)=>setEmail(e.target.value)}
                            type="email"
                            id="signup-email"
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="password-fields">

                        <div>
                            <label htmlFor="signup-password">
                                Password<span>*</span>
                            </label>

                            <div className="password-input-wrapper">
                                <input
                                    value={password}
                                    onChange={(e)=>setPassword(e.target.value)}
                                    type={showSignUpPassword ? "text" : "password"}
                                    id="signup-password"
                                    placeholder="Create a password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                                    aria-label={showSignUpPassword ? "Hide password" : "Show password"}
                                >
                                    {showSignUpPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            <div>
                                <label htmlFor="confirm-password">
                                    Confirm password<span>*</span>
                                </label>

                                <div className="password-input-wrapper">
                                    <input
                                        value={confirmPassword}
                                        onChange={(e)=>setConfirmPassword(e.target.value)}
                                        type={showConfirmPassword ? "text" : "password"}
                                        id="confirm-password"
                                        placeholder="Confirm your password"
                                        required
                                    />

                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                    >
                                        {showConfirmPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                        </div>

                        <label className="terms">
                            <input 
                                type="checkbox"
                                checked={termsAccepted}
                                onChange={(e)=>setTermsAccepted(e.target.checked)}
                                required 
                            />
                            <span>
                                I agree to the terms and conditions
                            </span>
                        </label>

                        <button type="submit" className="signup-button">
                            Create Account
                        </button>
                    </div>
                </form>

                {/* Login link */}
                <p className="login-text">
                    Already have an account?{" "}
                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                    >
                        Login
                    </button>
                </p>

            </div>

        </div>
    );
}

export default Signup;