import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

function LessonDetails() {
  const { moduleId } = useParams();
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    const fetchLessons = async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("module_id", moduleId)
        .order("lesson_order");

      if (error) {
        console.error("Error fetching lessons:", error);
      } else {
        setLessons(data);
      }
    };

    fetchLessons();
  }, [moduleId]);

  return (
    <div style={{ padding: "40px" }}>
      <h1>Lessons</h1>

      {lessons.length === 0 ? (
        <p>No lessons found.</p>
      ) : (
        lessons.map((lesson) => (
          <div
            key={lesson.id}
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "8px",
            }}
          >
            <h3>
              Lesson {lesson.lesson_order}: {lesson.lesson_title}
            </h3>

            <p>
              <strong>Difficulty:</strong> {lesson.difficulty}
            </p>

            <p>
              <strong>Duration:</strong> {lesson.estimated_duration}
            </p>

            <p>{lesson.content}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default LessonDetails;