import CourseCard from "../components/CourseCard";

function Courses() {
  return (
    <section className="course-section">
      <h1 className="section-title">All Courses</h1>

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
  );
}

export default Courses;