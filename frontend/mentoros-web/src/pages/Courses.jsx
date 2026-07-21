import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import CourseCard from "../components/CourseCard";
import { useNavigate } from "react-router-dom";
function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase
        .from("roadmaps")
        .select("*");

      if (error) {
        console.error("Error fetching roadmaps:", error);
      } else {
        console.log(data);
        setCourses(data);
      }
    };

    fetchCourses();
  }, []);
console.log("Courses component rendered");
  return (
    <section className="course-section">
      <h1 className="section-title">All Courses</h1>

      <div className="courses">
        {/* Hardcoded cards for now */}
       {courses.map((course) => (
  <div
    key={course.id}
    onClick={() => navigate(`/modules/${course.id}`)}
    style={{ cursor: "pointer" }}
  >
    <CourseCard
      title={course.roadmap_name}
      duration={course.estimated_duration}
      level={course.level}
      rating="4.9"
      students="100+"
    />
  </div>
))}
      </div>
    </section>
  );
}

export default Courses;