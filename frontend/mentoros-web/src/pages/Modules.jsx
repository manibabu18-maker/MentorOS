import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/Modules.css";

function Modules() {
  const { roadmapId } = useParams();
  const navigate = useNavigate();

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModules = async () => {
      setLoading(true);

      try {
        // ==========================================
        // 1. SHARED MODULE MAPPING
        // ==========================================

        const { data: mappings, error: mappingError } = await supabase
          .from("roadmap_module_map")
          .select("module_id")
          .eq("roadmap_id", roadmapId);

        if (mappingError) {
          console.error("Mapping error:", mappingError);
          setLoading(false);
          return;
        }

        const mappedModuleIds = (mappings || []).map(
          (item) => item.module_id
        );

        // ==========================================
        // 2. DIRECT MODULES
        // ==========================================

        const { data: directModules, error: directError } = await supabase
          .from("roadmap_modules")
          .select("*")
          .eq("roadmap_id", roadmapId)
          .order("module_order");

        if (directError) {
          console.error("Direct module error:", directError);
          setLoading(false);
          return;
        }

        // ==========================================
        // 3. SHARED MODULES
        // ==========================================

        let sharedModules = [];

        if (mappedModuleIds.length > 0) {
          const { data, error } = await supabase
            .from("roadmap_modules")
            .select("*")
            .in("id", mappedModuleIds);

          if (error) {
            console.error("Shared module error:", error);
            setLoading(false);
            return;
          }

          sharedModules = data || [];
        }

        // ==========================================
        // 4. COMBINE WITHOUT DUPLICATES
        // ==========================================

        const combinedModules = [
          ...(directModules || []),
          ...sharedModules.filter(
            (shared) =>
              !(directModules || []).some(
                (direct) => direct.id === shared.id
              )
          ),
        ].sort((a, b) => a.module_order - b.module_order);

        // ==========================================
        // 5. GET LESSON COUNTS
        // ==========================================

        const moduleIds = combinedModules.map((module) => module.id);

        let lessons = [];

        if (moduleIds.length > 0) {
          const { data, error } = await supabase
            .from("lessons")
            .select("id, module_id, lesson_order, is_active")
            .in("module_id", moduleIds)
            .eq("is_active", true)
            .order("lesson_order");

          if (error) {
            console.error("Lessons error:", error);
          } else {
            lessons = data || [];
          }
        }

        // ==========================================
        // 6. GET CURRENT USER
        // ==========================================

        const {
          data: { user },
        } = await supabase.auth.getUser();

        let progress = [];

        if (user && lessons.length > 0) {
          const lessonIds = lessons.map((lesson) => lesson.id);

          const { data, error } = await supabase
            .from("lesson_progress")
            .select("lesson_id, completed")
            .eq("user_id", user.id)
            .in("lesson_id", lessonIds);

          if (error) {
            console.error("Progress error:", error);
          } else {
            progress = data || [];
          }
        }

        // ==========================================
        // 7. PREPARE MODULE DATA
        // ==========================================

        const completedLessonIds = new Set(
          progress
            .filter((item) => item.completed === true)
            .map((item) => item.lesson_id)
        );

        const preparedModules = combinedModules.map((module) => {
          const moduleLessons = lessons.filter(
            (lesson) => lesson.module_id === module.id
          );

          const completedCount = moduleLessons.filter((lesson) =>
            completedLessonIds.has(lesson.id)
          ).length;

          const totalLessons = moduleLessons.length;

          const percentage =
            totalLessons > 0
              ? Math.round((completedCount / totalLessons) * 100)
              : 0;

          return {
            ...module,
            totalLessons,
            completedLessons: completedCount,
            progress: percentage,
          };
        });

        setModules(preparedModules);
      } catch (error) {
        console.error("Modules loading error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [roadmapId]);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="modules-page">
        <div className="modules-container">
          <div className="modules-loading">
            <div className="loading-spinner"></div>
            <p>Loading modules...</p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // OVERALL PROGRESS
  // ==========================================

  const totalLessons = modules.reduce(
    (sum, module) => sum + module.totalLessons,
    0
  );

  const completedLessons = modules.reduce(
    (sum, module) => sum + module.completedLessons,
    0
  );

  const overallProgress =
    totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

  // ==========================================
  // OPEN MODULE
  // ==========================================

  const openModule = (module) => {
    navigate(`/lessons/${module.id}`);
  };

  return (
    <div className="modules-page">
      <div className="modules-container">

        {/* ==========================================
            HEADER
        ========================================== */}

        <header className="modules-header">
          <button
            className="back-button"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

          <div className="modules-title-area">
            <span className="modules-label">LEARNING ROADMAP</span>

            <h1>Modules</h1>

            <p>
              Complete each module step by step and build your
              skills through practical learning.
            </p>
          </div>
        </header>

        {/* ==========================================
            OVERALL PROGRESS
        ========================================== */}

        {modules.length > 0 && (
          <section className="overall-progress-card">

            <div className="overall-progress-top">

              <div>
                <span className="progress-label">
                  YOUR PROGRESS
                </span>

                <h2>{overallProgress}% Complete</h2>
              </div>

              <div className="progress-stats">
                <strong>{completedLessons}</strong>
                <span>/ {totalLessons} lessons</span>
              </div>

            </div>

            <div className="overall-progress-bar">
              <div
                className="overall-progress-fill"
                style={{
                  width: `${overallProgress}%`,
                }}
              ></div>
            </div>

          </section>
        )}

        {/* ==========================================
            MODULE LIST
        ========================================== */}

        <section className="modules-section">

          <div className="section-heading">
            <div>
              <span className="section-label">
                COURSE CONTENT
              </span>

              <h2>Learning Modules</h2>
            </div>

            <span className="module-count">
              {modules.length} Modules
            </span>
          </div>

          {modules.length === 0 ? (
            <div className="empty-state">
              <h3>No modules available</h3>
              <p>
                No modules have been added to this roadmap yet.
              </p>
            </div>
          ) : (
            <div className="modules-grid">

              {modules.map((module, index) => {

                const isCompleted = module.progress === 100;

                return (
                  <article
                    key={module.id}
                    className={`module-card ${
                      isCompleted ? "module-completed" : ""
                    }`}
                    onClick={() => openModule(module)}
                  >

                    {/* Number */}

                    <div className="module-number">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    {/* Main Content */}

                    <div className="module-content">

                      <div className="module-top">

                        <span className="module-badge">
                          MODULE {index + 1}
                        </span>

                        {isCompleted && (
                          <span className="completed-badge">
                            ✓ Completed
                          </span>
                        )}

                      </div>

                      <h3>{module.module_name}</h3>

                      <p className="module-description">
                        {module.description ||
                          "Learn the concepts, practice the skills and complete practical lessons."}
                      </p>

                      {/* Lesson Info */}

                      <div className="module-meta">

                        <span>
                          📚 {module.totalLessons} Lessons
                        </span>

                        {module.estimated_duration && (
                          <span>
                            ⏱ {module.estimated_duration}
                          </span>
                        )}

                      </div>

                      {/* Progress */}

                      <div className="module-progress-area">

                        <div className="module-progress-info">
                          <span>Progress</span>

                          <strong>
                            {module.progress}%
                          </strong>
                        </div>

                        <div className="module-progress-bar">
                          <div
                            className="module-progress-fill"
                            style={{
                              width: `${module.progress}%`,
                            }}
                          ></div>
                        </div>

                      </div>

                      {/* Button */}

                      <button
                        className="module-button"
                        onClick={(event) => {
                          event.stopPropagation();
                          openModule(module);
                        }}
                      >
                        {module.progress > 0
                          ? "Continue Learning →"
                          : "Start Module →"}
                      </button>

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

export default Modules;