import { useNavigate } from "react-router-dom";

import CourseCard from "../components/CourseCard";
import "../styles/Courses.css";

function Courses() {
  const navigate = useNavigate();

  const courses = [
    {
      title: "C Programming",
      duration: "30 Days",
      rating: "4.9",
      students: "1200+",
      level: "Beginner",
    },
    {
      title: "Python",
      duration: "45 Days",
      rating: "4.9",
      students: "1500+",
      level: "Beginner",
    },
    {
      title: "SQL",
      duration: "25 Days",
      rating: "4.8",
      students: "980+",
      level: "Beginner",
    },
    {
      title: "Embedded Systems",
      duration: "60 Days",
      rating: "4.9",
      students: "820+",
      level: "Intermediate",
    },
    {
      title: "AI & Machine Learning",
      duration: "90 Days",
      rating: "5.0",
      students: "1600+",
      level: "Advanced",
    },
  ];

  return (
    <section className="courses-page">
      <div className="courses-hero">
        <h1>Explore Engineering Courses</h1>

        <p>
          Learn with structured roadmaps, real projects and interactive
          coding.
        </p>
      </div>

      <div className="courses-grid">
        {courses.map((course) => (
          <CourseCard
            key={course.title}
            title={course.title}
            duration={course.duration}
            level={course.level}
            rating={course.rating}
            students={course.students}
            onClick={() => navigate("/courses")}
          />
        ))}
      </div>
    </section>
  );
}

export default Courses;