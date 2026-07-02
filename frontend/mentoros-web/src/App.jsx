import "./App.css";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import CourseCard from "./components/CourseCard";
import Features from "./components/Features";
import Footer from "./components/Footer";

function App() {
  return (
    <>
      <Navbar />
<Hero />

<section className="course-section">
  <h2 className="section-title">Popular Courses</h2>

  <div className="courses">
    <CourseCard
      title="🐍 Python"
      duration="30 Days"
      rating="4.9"
      students="1200+"
      level="Beginner"
    />

    <CourseCard
      title="💻 VLSI"
      duration="45 Days"
      rating="4.8"
      students="950+"
      level="Intermediate"
    />

    <CourseCard
      title="⚡ Embedded Systems"
      duration="60 Days"
      rating="4.9"
      students="800+"
      level="Intermediate"
    />

    <CourseCard
      title="⚙ Electrical Design"
      duration="40 Days"
      rating="4.7"
      students="700+"
      level="Beginner"
    />

    <CourseCard
      title="🤖 AI & Machine Learning"
      duration="90 Days"
      rating="5.0"
      students="1500+"
      level="Advanced"
    />

    <CourseCard
      title="🌐 Web Development"
      duration="75 Days"
      rating="4.8"
      students="1000+"
      level="Beginner"
    />
  </div>
</section>

<Features />
<Footer />
    </>
  );
}

export default App;