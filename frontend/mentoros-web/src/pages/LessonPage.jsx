import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function LessonPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
const [allLessons, setAllLessons] = useState([]);
  useEffect(() => {
    console.log("Lesson ID:", lessonId);
    const fetchLesson = async () => {
  // Current lesson
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

  // All lessons of this module
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
};

    fetchLesson();
  }, [lessonId]);

  if (!lesson) {
  return (
    <div style={{ padding: "40px" }}>
      <h2>No lesson found</h2>
      <p>Lesson ID from URL: {lessonId}</p>
    </div>
  );
}
const currentIndex = allLessons.findIndex(
  (item) => item.id === lesson.id
);

const previousLesson =
  currentIndex > 0 ? allLessons[currentIndex - 1] : null;

const nextLesson =
  currentIndex < allLessons.length - 1
    ? allLessons[currentIndex + 1]
    : null;
  return (
    <div style={{ padding: "40px" }}>
      <Link to={`/modules/${lesson.module_id}`}>
        ← Back to Lessons
      </Link>

      <h1>{lesson.lesson_title}</h1>

      <p><strong>Difficulty:</strong> {lesson.difficulty}</p>

      <p><strong>Duration:</strong> {lesson.estimated_duration}</p>

      <hr />

      <p>{lesson.content}</p>
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