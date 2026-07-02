import "../styles/CourseCard.css";
function CourseCard({
  title,
  duration,
  level,
  students,
  rating
}) {
  return (
    <div className="course-card">
      <h2>{title}</h2>

      <p>Duration: {duration}</p>
      <p>⭐ {rating}</p>

<p>👨‍🎓 {students}</p>

<p>📚 {level}</p>

      <button>Enroll Now</button>
    </div>
  );
}

export default CourseCard;