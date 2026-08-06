import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function LessonPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [allLessons, setAllLessons] = useState([]);
  const [completed, setCompleted] = useState(false);
   useEffect(() => {
    const fetchLesson = async () => {
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
        .limit(1);

      if (progress && progress.length > 0) {
        setCompleted(progress[0].completed);
      }
    };

    fetchLesson();
  }, [lessonId]);
     const markComplete = async () => {
    const { data: existing } = await supabase
      .from("lesson_progress")
      .select("id")
      .eq("lesson_id", lesson.id)
      .limit(1);

    if (existing && existing.length > 0) {
      setCompleted(true);
      return;
    }

    const { error } = await supabase
      .from("lesson_progress")
      .insert({
        lesson_id: lesson.id,
        completed: true,
      });

    if (error) {
      console.error(error);
      return;
    }

    setCompleted(true);
  };

  if (!lesson) {
    return <h2>Loading...</h2>;
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
    <div style={{ maxWidth: "900px", margin: "40px auto", padding: "20px" }}>
      <button onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h2>
        Lesson {currentLessonNumber} of {totalLessons}
      </h2>

      <div
        style={{
          width: "100%",
          height: "10px",
          background: "#ddd",
          marginBottom: "20px",
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
            background: "green",
          }}
        />
      </div>

      <h1>{lesson.lesson_title}</h1>

      <p>
        <b>Difficulty:</b> {lesson.difficulty}
      </p>

      <p>
        <b>Duration:</b> {lesson.estimated_duration}
      </p>

      <hr /> 
            {completed ? (
        <button disabled>
          ✅ Completed
        </button>
      ) : (
        <button onClick={markComplete}>
          Mark as Complete
        </button>
      )}

      <h2>Lesson Notes</h2>

      <p>{lesson.content}</p>

      <hr />

      <button
        disabled={!previousLesson}
        onClick={() => navigate(`/lesson/${previousLesson.id}`)}
      >
        ← Previous
      </button>

      <button
        disabled={!nextLesson}
        onClick={() => navigate(`/lesson/${nextLesson.id}`)}
      >
        Next →
      </button>
    </div>
  );
}

export default LessonPage;