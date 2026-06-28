import "../styles/Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">

      <h2 className="logo">🚀 MentorOS</h2>

      <div className="nav-links">

        <a href="#">Home</a>

        <a href="#">Courses</a>

        <a href="#">About</a>

        <a href="#">Login</a>

      </div>

    </nav>
  );
}

export default Navbar;