import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../styles/LessonDetails.css";

function LessonDetails() {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  const [module, setModule] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLessonDetails = async () => {
      setLoading(true);
      setError("");

      try {
        // ==========================================
        // 1. GET MODULE
        // ==========================================

        const { data: moduleData, error: moduleError } = await supabase
          .from("roadmap_modules")
          .select("*")
          .eq("id", moduleId)
          .single();

        if (moduleError) {
          console.error("Module error:", moduleError);
          setError("Unable to load this module.");
          return;
        }

        setModule(moduleData);

        // ==========================================
        // 2. GET LESSONS
        // ==========================================

        const { data: lessonData, error: lessonError } = await supabase
          .from("lessons")
          .select(
            `
            id,
            module_id,
            lesson_order,
            lesson_title,
            difficulty,
            estimated_duration,
            lesson_type,
            is_active
            `
          )
          .eq("module_id", moduleId)
          .eq("is_active", true)
          .order("lesson_order", { ascending: true });

        if (lessonError) {
          console.error("Lessons error:", lessonError);
          setError("Unable to load lessons.");
          return;
        }

        const loadedLessons = lessonData || [];

        setLessons(loadedLessons);

        // ==========================================
        // 3. GET CURRENT USER
        // ==========================================

        const {
          data: { user },
        } = await supabase.auth.getUser();

        // ==========================================
        // 4. GET LESSON PROGRESS
        // ==========================================

        if (user && loadedLessons.length > 0) {
          const lessonIds = loadedLessons.map(
            (lesson) => lesson.id
          );

          const { data: progressData, error: progressError } =
            await supabase
              .from("lesson_progress")
              .select("lesson_id, completed")
              .eq("user_id", user.id)
              .in("lesson_id", lessonIds);

          if (progressError) {
            console.error(
              "Progress error:",
              progressError
            );
          } else {
            setProgress(progressData || []);
          }
        } else {
          setProgress([]);
        }
      } catch (err) {
        console.error("Lesson details error:", err);
        setError("Something went wrong while loading the lessons.");
      } finally {
        setLoading(false);
      }
    };

    fetchLessonDetails();
  }, [moduleId]);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="lesson-details-page">
        <div className="lesson-details-container">
          <div className="lesson-details-loading">
            <div className="lesson-loading-spinner"></div>
            <p>Loading lessons...</p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="lesson-details-page">
        <div className="lesson-details-container">
          <div className="lesson-details-error">
            <div className="error-icon">!</div>

            <h2>Unable to load module</h2>

            <p>{error}</p>

            <button
              className="lesson-details-back-main"
              onClick={() => navigate(-1)}
            >
              ← Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // PROGRESS HELPERS
  // ==========================================

  const completedLessonIds = new Set(
    progress
      .filter((item) => item.completed === true)
      .map((item) => item.lesson_id)
  );

  const completedLessons = lessons.filter((lesson) =>
    completedLessonIds.has(lesson.id)
  ).length;

  const totalLessons = lessons.length;

  const overallProgress =
    totalLessons > 0
      ? Math.round(
          (completedLessons / totalLessons) * 100
        )
      : 0;

  // ==========================================
  // LESSON STATUS
  // ==========================================

  const getLessonStatus = (lesson, index) => {
    if (completedLessonIds.has(lesson.id)) {
      return "completed";
    }

    if (
      index === 0 ||
      completedLessonIds.has(lessons[index - 1]?.id)
    ) {
      return "current";
    }

    return "not-started";
  };

  // ==========================================
  // LESSON TYPE LABEL
  // ==========================================

  const getLessonType = (type) => {
    switch (type) {
      case "theory":
        return "Theory";

      case "practice":
        return "Practice";

      case "debugging":
        return "Debugging";

      case "project":
        return "Mini Project";

      case "quiz":
        return "Quiz";

      default:
        return "Lesson";
    }
  };

  // ==========================================
  // OPEN LESSON
  // ==========================================

  const openLesson = (lesson) => {
    navigate(`/lessons/${moduleId}/${lesson.id}`);
  };

  // ==========================================
  // START / CONTINUE
  // ==========================================

  const handlePrimaryAction = () => {
    if (lessons.length === 0) return;

    const firstIncompleteLesson = lessons.find(
      (lesson) => !completedLessonIds.has(lesson.id)
    );

    const lessonToOpen =
      firstIncompleteLesson || lessons[0];

    openLesson(lessonToOpen);
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="lesson-details-page">
      <div className="lesson-details-container">

        {/* ==========================================
            TOP NAVIGATION
        ========================================== */}

        <div className="lesson-details-top">
          <button
            className="lesson-back-button"
            onClick={() => navigate(-1)}
          >
            ← Back to Modules
          </button>

          <span className="lesson-details-roadmap">
            LEARNING ROADMAP
          </span>
        </div>

        {/* ==========================================
            MODULE HEADER
        ========================================== */}

        <header className="lesson-details-header">

          <div className="lesson-details-header-main">

            <div className="lesson-module-number">
              MODULE{" "}
              {module?.module_order
                ? String(module.module_order).padStart(2, "0")
                : "01"}
            </div>

            <h1>
              {module?.module_name || "Module"}
            </h1>

            <p className="lesson-details-description">
              {module?.description ||
                "Learn the concepts, practice the skills and complete practical lessons."}
            </p>

          </div>

          <div className="lesson-details-header-meta">

            <div className="lesson-header-stat">
              <span className="stat-icon">📚</span>

              <div>
                <strong>{totalLessons}</strong>
                <span>Lessons</span>
              </div>
            </div>

            {module?.estimated_duration && (
              <div className="lesson-header-stat">
                <span className="stat-icon">⏱</span>

                <div>
                  <strong>
                    {module.estimated_duration}
                  </strong>
                  <span>Duration</span>
                </div>
              </div>
            )}

            {module?.total_projects > 0 && (
              <div className="lesson-header-stat">
                <span className="stat-icon">🚀</span>

                <div>
                  <strong>
                    {module.total_projects}
                  </strong>
                  <span>Projects</span>
                </div>
              </div>
            )}

          </div>

        </header>

        {/* ==========================================
            PROGRESS CARD
        ========================================== */}

        <section className="lesson-progress-card">

          <div className="lesson-progress-top">

            <div>
              <span className="lesson-progress-label">
                YOUR MODULE PROGRESS
              </span>

              <h2>
                {overallProgress}% Complete
              </h2>
            </div>

            <div className="lesson-progress-count">
              <strong>{completedLessons}</strong>
              <span>
                / {totalLessons} completed
              </span>
            </div>

          </div>

          <div className="lesson-progress-bar">
            <div
              className="lesson-progress-fill"
              style={{
                width: `${overallProgress}%`,
              }}
            ></div>
          </div>

          <div className="lesson-progress-bottom">

            <span>
              {overallProgress === 100
                ? "Module completed! 🎉"
                : overallProgress > 0
                ? "Keep going — you're making progress."
                : "Start your first lesson to begin."}
            </span>

            {lessons.length > 0 && (
              <button
                className="lesson-progress-action"
                onClick={handlePrimaryAction}
              >
                {overallProgress > 0
                  ? "Continue Learning →"
                  : "Start Learning →"}
              </button>
            )}

          </div>

        </section>

        {/* ==========================================
            LESSON LIST HEADER
        ========================================== */}

        <section className="lesson-list-section">

          <div className="lesson-list-heading">

            <div>
              <span className="lesson-section-label">
                MODULE CONTENT
              </span>

              <h2>
                Lessons
              </h2>

              <p>
                Follow the lessons in order and build
                your understanding step by step.
              </p>
            </div>

            <span className="lesson-list-count">
              {totalLessons} Lessons
            </span>

          </div>

          {/* ==========================================
              EMPTY STATE
          ========================================== */}

          {lessons.length === 0 ? (
            <div className="lesson-details-empty">

              <div className="empty-icon">
                📚
              </div>

              <h3>
                No lessons available
              </h3>

              <p>
                Lessons have not been added to this
                module yet.
              </p>

            </div>
          ) : (
            <div className="lesson-cards-layout">

              {lessons.map((lesson, index) => {

                const status = getLessonStatus(
                  lesson,
                  index
                );

                const isCompleted =
                  status === "completed";

                const isCurrent =
                  status === "current";

                return (
                  <article
                    key={lesson.id}
                    className={`lesson-item-card ${
                      isCompleted
                        ? "lesson-completed"
                        : ""
                    } ${
                      isCurrent
                        ? "lesson-current"
                        : ""
                    }`}
                    onClick={() =>
                      openLesson(lesson)
                    }
                  >

                    {/* NUMBER */}

                    <div className="lesson-item-number">
                      {isCompleted ? (
                        <span className="lesson-check">
                          ✓
                        </span>
                      ) : (
                        String(index + 1).padStart(
                          2,
                          "0"
                        )
                      )}
                    </div>

                    {/* CONTENT */}

                    <div className="lesson-item-content">

                      <div className="lesson-item-top">

                        <span className="lesson-type">
                          {getLessonType(
                            lesson.lesson_type
                          )}
                        </span>

                        {isCompleted && (
                          <span className="lesson-status completed">
                            Completed
                          </span>
                        )}

                        {isCurrent && (
                          <span className="lesson-status current">
                            Continue
                          </span>
                        )}

                        {!isCompleted &&
                          !isCurrent && (
                            <span className="lesson-status">
                              Not Started
                            </span>
                          )}

                      </div>

                      <h3>
                        {lesson.lesson_title}
                      </h3>

                      <div className="lesson-item-meta">

                        {lesson.difficulty && (
                          <span>
                            ◉ {lesson.difficulty}
                          </span>
                        )}

                        {lesson.estimated_duration && (
                          <span>
                            ⏱{" "}
                            {lesson.estimated_duration}
                          </span>
                        )}

                      </div>

                      <div className="lesson-item-footer">

                        <span>
                          Lesson {index + 1}
                        </span>

                        <button
                          className="lesson-open-button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openLesson(lesson);
                          }}
                        >
                          {isCompleted
                            ? "Review →"
                            : isCurrent
                            ? "Continue →"
                            : "Start →"}
                        </button>

                      </div>

                    </div>

                    <div className="lesson-open-arrow">
                      →
                    </div>

                  </article>
                );
              })}

            </div>
          )}

        </section>

      </div>
    </div>
  );
}

export default LessonDetails;