import { useState } from "react";
import { Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
 const handleSubmit = (event) => {
  event.preventDefault();

  if (email === "" || password === "") {
    setMessage("Please fill all fields");
  } else if (!email.includes("@")) {
    setMessage("Please enter a valid email");
  } else if (password.length < 6) {
    setMessage("Password must be at least 6 characters");
  } else {
    setMessage("Login successful");
  }
};

  return (
    <section className="login-page">
      <div className="login-card">
        <h1>Login to MentorOS</h1>

        <p>Continue your learning journey</p>

        <form onSubmit={handleSubmit}>
          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <button type="submit">Login</button>
        </form>

        <p
  className={
    message === "Login successful"
      ? "success-message"
      : "error-message"
  }
>
  {message}
</p>

        <p className="signup-text">
  Don't have an account? <Link to="/signup">Sign Up</Link>
</p>
      </div>
    </section>
  );
}

export default Login;