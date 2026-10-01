import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../styles/Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (email === "" || password === "") {
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

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Login successful");

    const userId = data.user.id;

    const { data: profile, error: profileError } = await supabase
      .from("student_profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError) {
      setMessage(profileError.message);
      return;
    }

    if (profile) {
      navigate("/dashboard");
    } else {
      navigate("/onboarding");
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-container">

        <div className="auth-left">
          <h2>🚀 MentorOS</h2>
          <p className="brand-subtitle">Engineering Learning OS</p>

          <div className="brand-content">
            <h3>Learn • Build • Get Hired</h3>
            <p>
              Master C, Python, SQL, Embedded Systems and AI with real-world projects.
            </p>
          </div>
        </div>

        <div className="auth-right">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">
            Continue your learning journey
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>

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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button className="btn-primary auth-button" type="submit">
              Login
            </button>

          </form>

          <p
            className={`auth-message ${
              message === "Login successful"
                ? "success-message"
                : "error-message"
            }`}
          >
            {message}
          </p>

          <p className="auth-footer">
            Don't have an account?{" "}
            <Link to="/signup">Create Account</Link>
          </p>

        </div>

      </div>
    </section>
  );
}

export default Login;