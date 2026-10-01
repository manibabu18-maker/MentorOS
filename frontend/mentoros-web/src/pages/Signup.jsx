import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../styles/Auth.css";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = async (event) => {
    event.preventDefault();

    if (name === "" || email === "" || password === "") {
      setMessage("Please fill all fields");
      return;
    }

    if (!email.includes("@")) {
      setMessage("Please enter a valid email");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Account created successfully");
  };

  return (
    <section className="auth-page">
      <div className="auth-container">

        <div className="auth-left">
          <h2>🚀 MentorOS</h2>
          <p className="brand-subtitle">Engineering Learning OS</p>

          <div className="brand-content">
            <h3>Start Your Career Today</h3>
            <p>
              Join thousands of learners building coding and engineering skills.
            </p>
          </div>
        </div>

        <div className="auth-right">
          <h1 className="auth-title">Create Account</h1>

          <p className="auth-subtitle">
            Start your personalized learning journey
          </p>

          <form className="auth-form" onSubmit={handleSignup}>

            <div>
              <label>Full Name</label>
              <input
                className="input"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label>Email Address</label>
              <input
                className="input"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label>Password</label>
              <input
                className="input"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button className="btn-primary auth-button" type="submit">
              Create Account
            </button>

          </form>

          <p
            className={`auth-message ${
              message === "Account created successfully"
                ? "success-message"
                : "error-message"
            }`}
          >
            {message}
          </p>

          <p className="auth-footer">
            Already have an account?{" "}
            <Link to="/login">Login</Link>
          </p>

        </div>

      </div>
    </section>
  );
}

export default Signup;