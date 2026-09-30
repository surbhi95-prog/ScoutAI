import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [showSignup, setShowSignup] = useState(false);

  const [showLoginPassword,setShowLoginPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const handleLogin = async (e) =>{
    e.preventDefault();

    try{
      const response = await fetch("http://127.0.0.1:8000/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: loginEmail,
                password: loginPassword
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.detail || "Login failed");
            return;
        }

        localStorage.setItem("access_token",data.access_token);
        localStorage.setItem("user_name",data.name);
        localStorage.setItem("user_role",data.role);
        alert("Login successful!");

        if(data.role === "admin"){
          navigate("/admin/dashboard");
        }
        else{
          navigate("/");
        }
    }
    catch (error) {
        console.error("LOGIN ERROR:", error);
        alert("Unable to connect to the server");
    }
  };

  return (
    <div className="login-page">

      <div className={`login-card ${showSignup ? "show-signup" : ""}`}>

        {/* Left gradient section */}
        <div className="login-brand">
          <div className="brand-content">
            <p className="brand-small">Welcome back to</p>

            <h1>ScoutAI</h1>

            <p className="brand-description">
              Your intelligent companion for finding genuine
              opportunities and avoiding fake job offers.
            </p>
          </div>

          <p className="brand-bottom">
            Find opportunities. Stay protected.
          </p>
        </div>


        {/* Login form */}
        <div className="login-form-section auth-panel login-panel">

          <div className="login-form-container">

            <div className="login-icon">
              🔐
            </div>

            <h2>Welcome back</h2>

            <p className="login-subtitle">
              Login to continue your job search safely
            </p>

            <form onSubmit={handleLogin}>

              <label htmlFor="email">
                Your email<span>*</span>
              </label>

              <input
                value={loginEmail}
                onChange={(e)=>setLoginEmail(e.target.value)}
                type="email"
                id="email"
                placeholder="Enter your email"
                required
              />

              <div className="password-heading">

                <label htmlFor="password">
                  Password<span>*</span>
                </label>

                <button
                  type="button"
                  className="forgot-password"
                >
                  Forgot password?
                </button>

              </div>

              <div className='password-input-wrapper'>
                <input
                  value={loginPassword}
                  onChange={(e)=>setLoginPassword(e.target.value)}
                  type={showLoginPassword ? "text" : "password"}
                  id="password"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  aria-label={showLoginPassword ? "Hide password" : "Show password"}
                >
                  {showLoginPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>


              </div>

              <button
                type="submit"
                className="login-button"
              >
                Login
              </button>


            </form>


            <div className="divider">
              <span></span>
              <p>or continue with</p>
              <span></span>
            </div>


            <div className="social-buttons">
              <button type="button">G</button>
              <button type="button">f</button>
              <button type="button">in</button>
            </div>


            <p className="signup-text">
              Don’t have an account?{" "}

              <button
                type="button"
                onClick={() =>{
                  console.log("Signup clicked");
                  navigate("/signup");
                }}
              >
                Sign up
              </button>

            </p>

          </div>

        </div>


        {/* Signup form */}
        <div className="signup-form-section auth-panel signup-panel">

          <div className="signup-form-container">

            <div className="login-icon">
              🛡️
            </div>

            <h2>Create your account</h2>

            <form>

              <label htmlFor="name">
                Full name<span>*</span>
              </label>

              <input
                type="text"
                id="name"
                placeholder="Enter your full name"
                required
              />


              <label htmlFor="signup-email">
                Email address<span>*</span>
              </label>

              <input
                type="email"
                id="signup-email"
                placeholder="Enter your email"
                required
              />


              <label htmlFor="signup-password">
                Password<span>*</span>
              </label>

              <div className="password-input-wrapper">
                <input
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
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>


              <label htmlFor="confirm-password">
                Confirm password<span>*</span>
              </label>

              <div className="password-input-wrapper">
                <input
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
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>


              <label className="terms">
                <input
                  type="checkbox"
                  required
                />

                <span>
                  I agree to the terms and conditions
                </span>
              </label>


              <button
                type="submit"
                className="login-button"
              >
                Create Account
              </button>

            </form>


            <p className="signup-text">
              Already have an account?{" "}

              <button
                type="button"
                onClick={() => setShowSignup(false)}
              >
                Login
              </button>

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;