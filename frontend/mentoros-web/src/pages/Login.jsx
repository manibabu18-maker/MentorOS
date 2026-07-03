function Login() {
  return (
    <section className="login-page">
      <div className="login-card">
        <h1>Login to MentorOS</h1>

        <p>Continue your learning journey</p>

        <form>
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
          />

          <button type="submit">Login</button>
        </form>

        <p className="signup-text">
          Don't have an account? <span>Sign Up</span>
        </p>
      </div>
    </section>
  );
}

export default Login;