import "../styles/Features.css";

function Features() {
  return (
    <section className="features">

      <h2>Why Choose MentorOS?</h2>

      <div className="feature-container">

        <div className="feature-card">
          <h3>🤖 AI Powered Learning</h3>
          <p>Learn with an AI mentor that guides you step by step.</p>
        </div>

        <div className="feature-card">
          <h3>💻 Hands-on Projects</h3>
          <p>Build real-world projects and improve your practical skills.</p>
        </div>

        <div className="feature-card">
          <h3>🏆 Certificates</h3>
          <p>Earn certificates after successfully completing each course.</p>
        </div>

        <div className="feature-card">
          <h3>📚 24/7 Mentor Support</h3>
          <p>Get guidance and support whenever you need it.</p>
        </div>

      </div>

    </section>
  );
}

export default Features;