import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function LessonPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [lessonContent, setLessonContent] = useState(null);
  const [allLessons, setAllLessons] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);

      // 1. Get lesson
      const { data: lessonData, error: lessonError } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", Number(lessonId))
        .single();

      if (lessonError) {
        console.error("Lesson error:", lessonError);
        setLoading(false);
        return;
      }

      setLesson(lessonData);

      // 2. Get latest published lesson template
      const { data: templateData, error: templateError } = await supabase
        .from("lesson_templates")
        .select("content, version")
        .eq("lesson_id", lessonData.id)
        .eq("is_published", true)
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle();
      console.log("PUBLISHED TEMPLATE: ", templateData);
      console.log("TEMPLATE ERROR:", templateError);
      console.log("CURRENT LESSON ID:", lessonData.id);
console.log("CURRENT LESSON TITLE:", lessonData.lesson_title);
console.log("TEMPLATE VERSION:", templateData?.version);
console.log("TEMPLATE CONTENT:", templateData?.content);
      if (templateError) {
        console.error("Lesson template error:", templateError);
      } else if (templateData) {
        setLessonContent(templateData.content);
      }

      // 3. Get all lessons in this module
      const { data: lessonsData, error: lessonsError } = await supabase
        .from("lessons")
        .select("*")
        .eq("module_id", lessonData.module_id)
        .eq("is_active", true)
        .order("lesson_order");

      if (lessonsError) {
        console.error("Lessons error:", lessonsError);
      } else {
        setAllLessons(lessonsData || []);
      }

      // 4. Get current user's progress
      const {
        data: {
          user,
        },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: progress, error: progressError } = await supabase
          .from("lesson_progress")
          .select("*")
          .eq("lesson_id", lessonData.id)
          .eq("user_id", user.id)
          .limit(1);

        if (progressError) {
          console.error("Progress error:", progressError);
        } else if (progress && progress.length > 0) {
          setCompleted(progress[0].completed);
        }
      }

      setLoading(false);
    };

    fetchLesson();
  }, [lessonId]);

  const markComplete = async () => {
    if (!lesson) return;

    const {
      data: {
        user,
      },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login to save your progress.");
      return;
    }

    const { data: existing, error: existingError } = await supabase
      .from("lesson_progress")
      .select("id, completed")
      .eq("lesson_id", lesson.id)
      .eq("user_id", user.id)
      .limit(1);

    if (existingError) {
      console.error(existingError);
      return;
    }

    if (existing && existing.length > 0) {
      const { error } = await supabase
        .from("lesson_progress")
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq("id", existing[0].id);

      if (error) {
        console.error(error);
        return;
      }

      setCompleted(true);
      return;
    }

    const { error } = await supabase
      .from("lesson_progress")
      .insert({
        lesson_id: lesson.id,
        user_id: user.id,
        completed: true,
        completed_at: new Date().toISOString(),
      });

    if (error) {
      console.error(error);
      return;
    }

    setCompleted(true);
  };

  if (loading) {
    return (
      <div style={{ maxWidth: "900px", margin: "40px auto", padding: "20px" }}>
        <h2>Loading lesson...</h2>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div style={{ maxWidth: "900px", margin: "40px auto", padding: "20px" }}>
        <h2>Lesson not found.</h2>
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
        lineHeight: "1.7",
      }}
    >
      <button onClick={() => navigate(-1)}>← Back</button>

      <h2>
        Lesson {currentLessonNumber} of {totalLessons}
      </h2>

      {/* Progress bar */}
      <div
        style={{
          width: "100%",
          height: "10px",
          background: "#ddd",
          marginBottom: "25px",
          borderRadius: "5px",
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
            borderRadius: "5px",
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

      {/* WHY LEARN */}
      {lessonContent?.why_learn && (
        <>
          <h2>Why Learn C?</h2>

          <ul>
            {lessonContent.why_learn.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </>
      )}

      {/* THEORY */}
      <h2>What You Will Learn</h2>

      <p>
        {lessonContent?.theory || lesson.content}
      </p>

      {/* CAREER PATHS */}
      {lessonContent?.career_paths && (
        <>
          <h2>Where Can C Take You?</h2>

          <ul>
            {lessonContent.career_paths.map((path, index) => (
              <li key={index}>{path}</li>
            ))}
          </ul>
        </>
      )}

      {/* LEARNING OBJECTIVES */}
      {lessonContent?.learning_objectives && (
        <>
          <h2>Learning Objectives</h2>

          <ul>
            {lessonContent.learning_objectives.map((objective, index) => (
              <li key={index}>{objective}</li>
            ))}
          </ul>
        </>
      )}

      {/* EXECUTION FLOW */}
      {lessonContent?.execution_flow && (
        <>
          <h2>How a C Program Runs</h2>

          <ol>
            {lessonContent.execution_flow.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </>
      )}

      {/* EXAMPLE PROGRAM */}
      {lessonContent?.example_program && (
        <>
          <h2>{lessonContent.example_program.title}</h2>

          <pre
            style={{
              background: "#1e1e1e",
              color: "#fff",
              padding: "20px",
              borderRadius: "8px",
              overflowX: "auto",
            }}
          >
            <code>{lessonContent.example_program.code}</code>
          </pre>

          <p>{lessonContent.example_program.explanation}</p>
        </>
      )}

      {/* MICRO PROGRAMS */}
      {lessonContent?.micro_programs && (
        <>
          <h2>Practice Tasks</h2>

          {lessonContent.micro_programs.map((program, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ddd",
                padding: "15px",
                marginBottom: "15px",
                borderRadius: "8px",
              }}
            >
              <h3>{program.title}</h3>

              <p>{program.task}</p>

              <details>
                <summary>Need a hint?</summary>

                <p>{program.hint_1}</p>

                <p>{program.hint_2}</p>
              </details>
            </div>
          ))}
        </>
      )}

      {/* CHALLENGE */}
      {lessonContent?.challenge && (
        <>
          <h2>Challenge</h2>

          <div
            style={{
              border: "2px solid #ddd",
              padding: "20px",
              borderRadius: "10px",
            }}
          >
            <h3>{lessonContent.challenge.title}</h3>

            <p>{lessonContent.challenge.description}</p>

            <h4>Rules</h4>

            <ul>
              {lessonContent.challenge.rules?.map((rule, index) => (
                <li key={index}>{rule}</li>
              ))}
            </ul>

            <details>
              <summary>Need a hint?</summary>

              <p>{lessonContent.challenge.hint_1}</p>
              <p>{lessonContent.challenge.hint_2}</p>
              <p>{lessonContent.challenge.hint_3}</p>
            </details>
          </div>
        </>
      )}

      {/* COMMON MISTAKES */}
      {lessonContent?.common_mistakes && (
        <>
          <h2>Common Mistakes</h2>

          <ul>
            {lessonContent.common_mistakes.map((mistake, index) => (
              <li key={index}>{mistake}</li>
            ))}
          </ul>
        </>
      )}

      {/* REAL WORLD */}
      {lessonContent?.real_world_examples && (
        <>
          <h2>Real-World Applications</h2>

          <ul>
            {lessonContent.real_world_examples.map((example, index) => (
              <li key={index}>{example}</li>
            ))}
          </ul>
        </>
      )}

      {/* INTERVIEW QUESTIONS */}
      {lessonContent?.interview_questions && (
        <>
          <h2>Interview Questions</h2>

          <ol>
            {lessonContent.interview_questions.map((question, index) => (
              <li key={index}>{question}</li>
            ))}
          </ol>
        </>
      )}

      {/* MINI PROJECT */}
      {lessonContent?.mini_project && (
        <>
          <h2>Mini Project</h2>

          <div
            style={{
              border: "1px solid #ddd",
              padding: "20px",
              borderRadius: "10px",
            }}
          >
            <h3>{lessonContent.mini_project.title}</h3>

            <p>{lessonContent.mini_project.description}</p>

            {lessonContent.mini_project.skills && (
              <>
                <h4>Skills Learned</h4>

                <ul>
                  {lessonContent.mini_project.skills.map((skill, index) => (
                    <li key={index}>{skill}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </>
      )}

      <hr />

      {/* COMPLETE */}
      {completed ? (
        <button disabled>✅ Completed</button>
      ) : (
        <button onClick={markComplete}>Mark as Complete</button>
      )}

      <hr />

      {/* NAVIGATION */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "10px",
        }}
      >
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
    </div>
  );
}

export default LessonPage;