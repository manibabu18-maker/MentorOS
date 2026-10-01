import { Link } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-container">

        <Link to="/" className="logo">
          <div>
            <h2>🚀 MentorOS</h2>
            <span>Engineering Learning OS</span>
          </div>
        </Link>

        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/courses">Courses</Link>
          <Link to="/about">About</Link>
        </nav>

        <div className="nav-actions">
          <Link to="/login" className="login-link">
            Login
          </Link>

          <Link to="/signup" className="signup-btn">
            Get Started
          </Link>
        </div>

      </div>
    </header>
  );
}

export default Navbar;