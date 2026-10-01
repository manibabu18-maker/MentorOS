import "../styles/CourseCard.css";

function CourseCard({
  title,
  duration,
  level,
  rating,
  students,
  onClick,
}) {

  const getEmoji = () => {
    const name = title.toLowerCase();

    if (name.includes("python")) return "🐍";
    if (name.includes("sql")) return "🗄️";
    if (name.includes("embedded")) return "🔧";
    if (name.includes("ai")) return "🤖";
    if (name.includes("c")) return "💻";

    return "📘";
  };

  return (
    <div className="course-card" onClick={onClick}>

      <div className="course-banner">
        <span>{getEmoji()}</span>
      </div>

      <div className="course-content">

        <h2>{title}</h2>

        <div className="course-meta">
          <span>⏱ {duration}</span>
          <span>📚 {level}</span>
        </div>

        <div className="course-bottom">
          <span>⭐ {rating}</span>
          <span>👨‍🎓 {students}</span>
        </div>

        <button>Start Learning →</button>

      </div>

    </div>
  );
}

export default CourseCard;