import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = async (event) => {
  event.preventDefault();

  if (name === "" || email === "" || password === "") {
    setMessage("Please fill all fields");
  } else if (!email.includes("@")) {
    setMessage("Please enter a valid email");
  } else if (password.length < 6) {
    setMessage("Password must be at least 6 characters");
  } else {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          name: name,
        },
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Account created successfully");
      console.log(data);
    }
  }
};

  return (
    <section className="login-page">
      <div className="login-card">
        <h1>Create Account</h1>

        <p>Start your personalized learning journey</p>

        <form onSubmit={handleSignup}>
          <label>Name</label>

          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

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
            placeholder="Create a password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <button type="submit">Create Account</button>
        </form>

        <p
          className={
            message === "Account created successfully"
              ? "success-message"
              : "error-message"
          }
        >
          {message}
        </p>
       <p className="signup-text">
  Already have an account? <Link to="/login">Login</Link>
</p> 
      </div>
    </section>
  );
}

export default Signup;