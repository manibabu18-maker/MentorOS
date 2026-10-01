import { useNavigate } from "react-router-dom";

import CourseCard from "../components/CourseCard";
import "../styles/Courses.css";

function Courses() {
  const navigate = useNavigate();

  const courses = [
    {
      id: 17,
      title: "C Programming",
      duration: "20 Weeks",
      rating: "4.9",
      students: "1200+",
      level: "Beginner to Advanced",
    },
    {
      id: 16,
      title: "Python",
      duration: "16 Weeks",
      rating: "4.9",
      students: "1500+",
      level: "Beginner to Advanced",
    },
    {
      id: 18,
      title: "SQL",
      duration: "12 Weeks",
      rating: "4.8",
      students: "980+",
      level: "Beginner to Advanced",
    },
    {
      id: 1,
      title: "Embedded Systems",
      duration: "12 Weeks",
      rating: "4.9",
      students: "820+",
      level: "Beginner",
    },
    {
      id: 5,
      title: "AI & Machine Learning",
      duration: "18 Weeks",
      rating: "5.0",
      students: "1600+",
      level: "Beginner",
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
            key={course.id}
            title={course.title}
            duration={course.duration}
            level={course.level}
            rating={course.rating}
            students={course.students}
            onClick={() => navigate(`/modules/${course.id}`)}
          />
        ))}
      </div>
    </section>
  );
}

export default Courses;