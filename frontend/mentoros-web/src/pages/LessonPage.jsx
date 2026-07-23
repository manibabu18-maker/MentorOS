import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function LessonPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [allLessons, setAllLessons] = useState([]);
  const [completed, setCompleted] = useState(false);
    useEffect(() => {
    const fetchLesson = async () => {
      // Current Lesson
      const { data: lessonData, error: lessonError } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", Number(lessonId))
        .single();

      if (lessonError) {
        console.error(lessonError);
        return;
      }

      setLesson(lessonData);

      // Module Lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from("lessons")
        .select("*")
        .eq("module_id", lessonData.module_id)
        .order("lesson_order");

      if (lessonsError) {
        console.error(lessonsError);
        return;
      }

      setAllLessons(lessonsData);
      const { data: progress } = await supabase
  .from("lesson_progress")
  .select("*")
  .eq("lesson_id", lessonData.id)
  .single();

if (progress) {
  setCompleted(progress.completed);
}
    };

    fetchLesson();
  }, [lessonId]);
  const markComplete = async () => {
  const { error } = await supabase
  .from("lesson_progress")
  .insert({
    lesson_id: lesson.id,
    completed: true,
  });

if (error) {
  console.error(error);
} else {
  setCompleted(true);
}

  if (!error) {
    setCompleted(true);
  }
};
    if (!lesson) {
    return (
      <div style={{ padding: "40px" }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  const currentIndex = allLessons.findIndex(
    (item) => item.id === lesson.id
  );

  const totalLessons = allLessons.length;

  const currentLessonNumber = currentIndex + 1;

  const previousLesson =
    currentIndex > 0 ? allLessons[currentIndex - 1] : null;

  const nextLesson =
    currentIndex < allLessons.length - 1
      ? allLessons[currentIndex + 1]
      : null;
 return (
  <div
    style={{
      maxWidth: "900px",
      margin: "40px auto",
      padding: "20px",
    }}
  >
    <button onClick={() => navigate(-1)}>
  ← Back
</button>

    <div
      style={{
        background: "#f4f4f4",
        padding: "12px",
        borderRadius: "8px",
        marginTop: "20px",
        marginBottom: "20px",
      }}
    >
      <strong>
        Lesson {currentLessonNumber} of {totalLessons}
      </strong>
    </div>

    {/* Progress Bar */}
    <div
      style={{
        width: "100%",
        height: "12px",
        background: "#ddd",
        borderRadius: "10px",
        overflow: "hidden",
        marginBottom: "25px",
      }}
    >
      <div
        style={{
          width: `${
  totalLessons
    ? (currentLessonNumber / totalLessons) * 100
    : 0
}%`,
          height: "100%",
          background: "#4CAF50",
        }}
      />
    </div>

    <h1>{lesson.lesson_title}</h1>

    <p>📘 Lesson {currentLessonNumber}</p>

    <p>
      ⭐ <strong>Difficulty:</strong> {lesson.difficulty}
    </p>

    <p>
      ⏱ <strong>Duration:</strong> {lesson.estimated_duration}
    </p>

    <hr />
    <div style={{ marginTop: "20px", marginBottom: "20px" }}>
  {completed ? (
    <button
      style={{
        background: "green",
        color: "white",
        padding: "10px 20px",
      }}
    >
      ✅ Completed
    </button>
  ) : (
    <button
      onClick={markComplete}
      style={{
        background: "#007bff",
        color: "white",
        padding: "10px 20px",
      }}
    >
      Mark as Complete
    </button>
  )}
</div>

    <h2>Lesson Notes</h2>

    <p style={{ lineHeight: "1.8" }}>
      {lesson.content}
    </p>

    <hr />

    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: "30px",
      }}
    >
      <button
        disabled={!previousLesson}
        onClick={() =>
          navigate(`/lesson/${previousLesson.id}`)
        }
      >
        ← Previous
      </button>

      <button
        disabled={!nextLesson}
        onClick={() =>
          navigate(`/lesson/${nextLesson.id}`)
        }
      >
        Next →
      </button>
    </div>
  </div>
);
}
export default LessonPage;     