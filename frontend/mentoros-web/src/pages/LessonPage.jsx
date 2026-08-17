import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

// --------------------------------
// CONTENT FORMAT HELPERS
// --------------------------------
// Supabase may store code/output with escaped newline characters.
// These helpers convert them back when rendering.
const formatText = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value !== "string") return String(value);
  return value
    .replace(/\\\\n/g, "\\n")
    .replace(/\\n/g, "\n")
    .replace(/\\"/g, '"');
};

const formatCode = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value !== "string") return String(value);

  let code = value
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\\"/g, '"');

  let result = "";
  let insideString = false;

  for (let i = 0; i < code.length; i++) {
    const char = code[i];

    if (char === '"' && (i === 0 || code[i - 1] !== "\\")) {
      insideString = !insideString;
      result += char;
      continue;
    }

    if (char === "\\" && code[i + 1] === "n") {
      if (insideString) {
        result += "\\n";
      } else {
        result += "\n";
      }
      i++;
      continue;
    }

    result += char;
  }

  return result.trim();
};

const formatOutput = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value !== "string") return String(value);
  return value
    .replace(/\\\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\"/g, '"');
};


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

      // Important:
      // Clear old lesson content while loading the new lesson.
      setLesson(null);
      setLessonContent(null);
      setCompleted(false);
      setAllLessons([]);

      // --------------------------------
      // 1. CURRENT LESSON
      // --------------------------------

      const { data: lessonData, error: lessonError } =
        await supabase
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

      // --------------------------------
      // 2. PUBLISHED TEMPLATE
      // --------------------------------

      const { data: templateData, error: templateError } =
        await supabase
          .from("lesson_templates")
          .select("content, version")
          .eq("lesson_id", lessonData.id)
          .eq("is_published", true)
          .order("version", { ascending: false })
          .limit(1)
          .maybeSingle();

      console.log("PUBLISHED TEMPLATE:", templateData);
      console.log("TEMPLATE ERROR:", templateError);
      console.log("CURRENT LESSON ID:", lessonData.id);
      console.log(
        "CURRENT LESSON TITLE:",
        lessonData.lesson_title
      );
      console.log(
        "TEMPLATE VERSION:",
        templateData?.version
      );
      console.log(
        "TEMPLATE CONTENT:",
        templateData?.content
      );

      if (templateError) {
        console.error(
          "Lesson template error:",
          templateError
        );
      } else if (templateData?.content) {
        setLessonContent(templateData.content);
      }

      // --------------------------------
      // 3. ALL LESSONS IN MODULE
      // --------------------------------

      const { data: lessonsData, error: lessonsError } =
        await supabase
          .from("lessons")
          .select("*")
          .eq("module_id", lessonData.module_id)
          .eq("is_active", true)
          .order("lesson_order");

      if (lessonsError) {
        console.error(
          "Lessons error:",
          lessonsError
        );
      } else {
        setAllLessons(lessonsData || []);
      }

      // --------------------------------
      // 4. CURRENT USER PROGRESS
      // --------------------------------

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const {
          data: progress,
          error: progressError,
        } = await supabase
          .from("lesson_progress")
          .select("*")
          .eq("lesson_id", lessonData.id)
          .eq("user_id", user.id)
          .limit(1);

        if (progressError) {
          console.error(
            "Progress error:",
            progressError
          );
        } else if (
          progress &&
          progress.length > 0
        ) {
          setCompleted(
            progress[0].completed === true
          );
        }
      }

      setLoading(false);
    };

    fetchLesson();
  }, [lessonId]);

  // --------------------------------
  // MARK COMPLETE
  // --------------------------------

  const markComplete = async () => {
    if (!lesson) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login to save your progress.");
      return;
    }

    const {
      data: existing,
      error: existingError,
    } = await supabase
      .from("lesson_progress")
      .select("id, completed")
      .eq("lesson_id", lesson.id)
      .eq("user_id", user.id)
      .limit(1);

    if (existingError) {
      console.error(
        "Existing progress error:",
        existingError
      );
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
        console.error(
          "Progress update error:",
          error
        );
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
      console.error(
        "Progress insert error:",
        error
      );
      return;
    }

    setCompleted(true);
  };

  // --------------------------------
  // LOADING
  // --------------------------------

  if (loading) {
    return (
      <div className="lesson-page">
        <div className="lesson-container">
          <h2>Loading lesson...</h2>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="lesson-page">
        <div className="lesson-container">
          <h2>Lesson not found.</h2>
        </div>
      </div>
    );
  }

  // --------------------------------
  // NAVIGATION
  // --------------------------------

  const currentIndex = allLessons.findIndex(
    (item) => item.id === lesson.id
  );

  const totalLessons = allLessons.length;

  const currentLessonNumber =
    currentIndex >= 0
      ? currentIndex + 1
      : 1;

  const previousLesson =
    currentIndex > 0
      ? allLessons[currentIndex - 1]
      : null;

  const nextLesson =
    currentIndex >= 0 &&
    currentIndex < allLessons.length - 1
      ? allLessons[currentIndex + 1]
      : null;

  const content = lessonContent || {};

  return (
    <div className="lesson-page">
      <div className="lesson-container">

        {/* ==============================
            BACK
        =============================== */}

        <button
          className="lesson-back-button"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        {/* ==============================
            HEADER
        =============================== */}

        <div className="lesson-progress-header">
          <span>
            Lesson {currentLessonNumber} of{" "}
            {totalLessons}
          </span>

          <span>
            {lesson.difficulty}
          </span>
        </div>

        <div className="lesson-progress-bar">
          <div
            className="lesson-progress-fill"
            style={{
              width: `${
                totalLessons
                  ? (currentLessonNumber /
                      totalLessons) *
                    100
                  : 0
              }%`,
            }}
          />
        </div>

        <header className="lesson-header">
          <p className="lesson-label">
            LESSON {currentLessonNumber}
          </p>

          <h1>
            {content.title ||
              lesson.lesson_title}
          </h1>

          <p className="lesson-intro">
            {content.what_is_c?.explanation ||
              content.start_here?.explanation ||
              "Start learning C programming from the fundamentals."}
          </p>

          <div className="lesson-meta">
            <span>
              Difficulty: {lesson.difficulty}
            </span>

            <span>
              Duration:{" "}
              {lesson.estimated_duration}
            </span>
          </div>
        </header>

        {/* ==============================
            WHY LEARN
        =============================== */}

        {content.why_learn?.length > 0 && (
          <section className="lesson-section highlight-section">
            <span className="section-kicker">
              WHY THIS MATTERS
            </span>

            <h2>Why Learn C?</h2>

            <ul>
              {content.why_learn.map(
                (item, index) => (
                  <li key={index}>
                    {item}
                  </li>
                )
              )}
            </ul>
          </section>
        )}

        {/* ==============================
            START HERE
        =============================== */}

        {content.start_here && (
          <section className="lesson-section">
            <span className="section-kicker">
              START HERE
            </span>

            <h2>
              {content.start_here.title}
            </h2>

            <p>
              {content.start_here.explanation}
            </p>

            {content.start_here.example && (
              <div className="concept-card">
                <h3>
                  Example:{" "}
                  {
                    content.start_here
                      .example.problem
                  }
                </h3>

                <ol>
                  {content.start_here.example.steps?.map(
                    (step, index) => (
                      <li key={index}>
                        {step}
                      </li>
                    )
                  )}
                </ol>
              </div>
            )}

            {content.start_here.key_idea && (
              <div className="key-idea">
                <strong>
                  Key Idea:
                </strong>{" "}
                {content.start_here.key_idea}
              </div>
            )}
          </section>
        )}

        {/* ==============================
            WHAT IS C
        =============================== */}

        {content.what_is_c && (
          <section className="lesson-section">
            <span className="section-kicker">
              UNDERSTAND
            </span>

            <h2>
              {content.what_is_c.title}
            </h2>

            <p>
              {content.what_is_c.explanation}
            </p>

            {content.what_is_c.important_idea && (
              <div className="key-idea">
                <strong>
                  Important:
                </strong>{" "}
                {
                  content.what_is_c
                    .important_idea
                }
              </div>
            )}
          </section>
        )}

        {/* ==============================
            REAL WORLD C
        =============================== */}

        {content.where_c_is_used?.length > 0 && (
          <section className="lesson-section">
            <span className="section-kicker">
              REAL-WORLD CONNECTION
            </span>

            <h2>
              Where Is C Actually Used?
            </h2>

            <div className="card-grid">
              {content.where_c_is_used.map(
                (area, index) => (
                  <div
                    className="concept-card"
                    key={index}
                  >
                    <h3>
                      {area.area}
                    </h3>

                    <ul>
                      {area.examples?.map(
                        (
                          example,
                          exampleIndex
                        ) => (
                          <li
                            key={
                              exampleIndex
                            }
                          >
                            {example}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )
              )}
            </div>
          </section>
        )}

        {/* ==============================
            LEARNING OBJECTIVES
        =============================== */}

        {content.learning_objectives?.length > 0 && (
          <section className="lesson-section">
            <span className="section-kicker">
              LEARNING GOALS
            </span>

            <h2>
              What You Will Be Able To Do
            </h2>

            <ul>
              {content.learning_objectives.map(
                (objective, index) => (
                  <li key={index}>
                    {objective}
                  </li>
                )
              )}
            </ul>
          </section>
        )}

        {/* ==============================
            PROGRAM EXECUTION
        =============================== */}

        {content.program_execution && (
          <section className="lesson-section">
            <span className="section-kicker">
              HOW IT WORKS
            </span>

            <h2>
              {content.program_execution.title}
            </h2>

            <div className="flow-list">
              {content.program_execution.steps?.map(
                (step, index) => (
                  <div
                    className="flow-item"
                    key={index}
                  >
                    <span>
                      {index + 1}
                    </span>

                    <p>{step}</p>
                  </div>
                )
              )}
            </div>

            {content.program_execution
              .why_this_matters && (
              <div className="key-idea">
                <strong>
                  Why this matters:
                </strong>{" "}
                {
                  content.program_execution
                    .why_this_matters
                }
              </div>
            )}
          </section>
        )}

        {/* ==============================
            CORE CONCEPTS
        =============================== */}

        {content.concepts?.length > 0 && (
          <section className="lesson-section">
            <span className="section-kicker">
              CORE CONCEPTS
            </span>

            <h2>
              Understand the Building Blocks
            </h2>

            {content.concepts.map(
              (concept, index) => (
                <div
                  className="concept-card"
                  key={index}
                >
                  <h3>
                    {concept.title}
                  </h3>

                  <p>
                    {concept.explanation}
                  </p>

                  {concept.mental_model && (
                    <div className="key-idea">
                      <strong>
                        Think of it like this:
                      </strong>{" "}
                      {
                        concept.mental_model
                      }
                    </div>
                  )}

                  {concept.parts?.length > 0 && (
                    <ul>
                      {concept.parts.map(
                        (
                          part,
                          partIndex
                        ) => (
                          <li
                            key={
                              partIndex
                            }
                          >
                            {part}
                          </li>
                        )
                      )}
                    </ul>
                  )}
                </div>
              )
            )}
          </section>
        )}

        {/* ==============================
            EXAMPLES
        =============================== */}

        {content.examples?.length > 0 && (
          <section className="lesson-section">
            <span className="section-kicker">
              LEARN BY EXAMPLE
            </span>

            <h2>Examples</h2>

            {content.examples.map(
              (example, index) => (
                <div
                  className="example-card"
                  key={index}
                >
                  <h3>
                    {example.title}
                  </h3>

                  <p>
                    <strong>
                      Purpose:
                    </strong>{" "}
                    {example.purpose}
                  </p>

                  <pre className="code-block">
                    <code>
                      {formatCode(example.code)}
                    </code>
                  </pre>

                  {example.output && (
                    <>
                      <h4>Output</h4>

                      <pre className="output-block">
                        <code>
                          {formatOutput(example.output)}
                        </code>
                      </pre>
                    </>
                  )}

                  {example.explanation?.length > 0 && (
                    <ul>
                      {example.explanation.map(
                        (
                          item,
                          explanationIndex
                        ) => (
                          <li
                            key={
                              explanationIndex
                            }
                          >
                            {item}
                          </li>
                        )
                      )}
                    </ul>
                  )}

                  {example.key_concept && (
                    <div className="key-idea">
                      <strong>
                        Key Concept:
                      </strong>{" "}
                      {
                        example.key_concept
                      }
                    </div>
                  )}
                </div>
              )
            )}
          </section>
        )}

        {/* ==============================
            OUTPUT PREDICTION
        =============================== */}

        {content.output_prediction && (
          <section className="lesson-section practice-section">
            <span className="section-kicker">
              THINK BEFORE YOU RUN
            </span>

            <h2>
              {
                content.output_prediction
                  .title
              }
            </h2>

            <pre className="code-block">
              <code>
                {
                  formatCode(content.output_prediction
                    .code)
                }
              </code>
            </pre>

            <p>
              {
                content.output_prediction
                  .task
              }
            </p>

            <details className="hint-box">
              <summary>
                Show expected output
              </summary>

              <pre className="output-block">
                <code>
                  {
                    formatOutput(content.output_prediction
                      .expected_output)
                  }
                </code>
              </pre>
            </details>

            <p className="small-note">
              {
                content.output_prediction
                  .learning_goal
              }
            </p>
          </section>
        )}

        {/* ==============================
            GUIDED PRACTICE
        =============================== */}

        {content.guided_practice?.length > 0 && (
          <section className="lesson-section">
            <span className="section-kicker">
              YOUR TURN
            </span>

            <h2>Guided Practice</h2>

            {content.guided_practice.map(
              (practice, index) => (
                <div
                  className="practice-card"
                  key={index}
                >
                  <h3>
                    {practice.title}
                  </h3>

                  <p>
                    {practice.task}
                  </p>

                  {practice.hints?.length > 0 && (
                    <details className="hint-box">
                      <summary>
                        Need a hint?
                      </summary>

                      <ol>
                        {practice.hints.map(
                          (
                            hint,
                            hintIndex
                          ) => (
                            <li
                              key={
                                hintIndex
                              }
                            >
                              {hint}
                            </li>
                          )
                        )}
                      </ol>
                    </details>
                  )}
                </div>
              )
            )}
          </section>
        )}

        {/* ==============================
            DEBUGGING
        =============================== */}

        {content.debugging_activity && (
          <section className="lesson-section debugging-section">
            <span className="section-kicker">
              DEBUGGING
            </span>

            <h2>
              {
                content
                  .debugging_activity
                  .title
              }
            </h2>

            <pre className="code-block">
              <code>
                {
                  formatCode(content
                    .debugging_activity
                    .code)
                }
              </code>
            </pre>

            <p>
              {
                content
                  .debugging_activity
                  .task
              }
            </p>

            {content.debugging_activity.hints?.length > 0 && (
              <details className="hint-box">
                <summary>
                  Need a debugging hint?
                </summary>

                <ol>
                  {content.debugging_activity.hints.map(
                    (hint, index) => (
                      <li key={index}>
                        {hint}
                      </li>
                    )
                  )}
                </ol>
              </details>
            )}

            <div className="key-idea">
              <strong>
                Goal:
              </strong>{" "}
              {
                content
                  .debugging_activity
                  .learning_goal
              }
            </div>
          </section>
        )}

        {/* ==============================
            CHALLENGE
        =============================== */}

        {content.challenge && (
          <section className="lesson-section challenge-section">
            <span className="section-kicker">
              CHALLENGE
            </span>

            <h2>
              {content.challenge.title}
            </h2>

            <p>
              {content.challenge.description}
            </p>

            {content.challenge.requirements?.length > 0 && (
              <>
                <h3>
                  Requirements
                </h3>

                <ul>
                  {content.challenge.requirements.map(
                    (
                      requirement,
                      index
                    ) => (
                      <li key={index}>
                        {requirement}
                      </li>
                    )
                  )}
                </ul>
              </>
            )}

            {content.challenge.expected_format && (
              <>
                <h3>
                  Expected Format
                </h3>

                <pre className="output-block">
                  <code>
                    {
                      formatOutput(content.challenge
                        .expected_format)
                    }
                  </code>
                </pre>
              </>
            )}

            {content.challenge.rules?.length > 0 && (
              <>
                <h3>Rules</h3>

                <ul>
                  {content.challenge.rules.map(
                    (rule, index) => (
                      <li key={index}>
                        {rule}
                      </li>
                    )
                  )}
                </ul>
              </>
            )}

            {content.challenge.hint_levels?.length > 0 && (
              <details className="hint-box">
                <summary>
                  Need a hint?
                </summary>

                <ol>
                  {content.challenge.hint_levels.map(
                    (hint, index) => (
                      <li key={index}>
                        {hint}
                      </li>
                    )
                  )}
                </ol>
              </details>
            )}
          </section>
        )}

        {/* ==============================
            COMPILER
        =============================== */}

        {content.compiler_activity?.enabled && (
          <section className="lesson-section tool-section">
            <span className="section-kicker">
              PRACTICAL LAB
            </span>

            <h2>
              {
                content.compiler_activity
                  .title
              }
            </h2>

            <p>
              {
                content.compiler_activity
                  .description
              }
            </p>

            <div className="tool-placeholder">
              <div className="tool-icon">
                💻
              </div>

              <h3>
                C Online Compiler
              </h3>

              <p>
                The C compiler will be
                integrated here. You
                will write, run, test
                and debug your program
                without leaving the
                lesson.
              </p>

              <button disabled>
                Compiler Integration
                Coming Next
              </button>
            </div>

            <div className="flow-list">
              {content.compiler_activity.workflow?.map(
                (step, index) => (
                  <div
                    className="flow-item"
                    key={index}
                  >
                    <span>
                      {index + 1}
                    </span>

                    <p>{step}</p>
                  </div>
                )
              )}
            </div>
          </section>
        )}

        {/* ==============================
            AI MENTOR
        =============================== */}

        {content.ai_mentor?.enabled && (
          <section className="lesson-section ai-mentor-section">
            <span className="section-kicker">
              AI MENTOR
            </span>

            <h2>
              🤖 Learn With Your AI Mentor
            </h2>

            <p>
              Your AI Mentor is designed
              to guide your thinking
              instead of simply giving
              you the complete answer.
            </p>

            {content.ai_mentor.hint_levels?.length > 0 && (
              <div className="mentor-rules">
                {content.ai_mentor.hint_levels.map(
                  (level, index) => (
                    <div
                      className="mentor-step"
                      key={index}
                    >
                      <span>
                        {index + 1}
                      </span>

                      <div>
                        <strong>
                          Hint {index + 1}
                        </strong>

                        <p>{level}</p>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {content.ai_mentor.example_interaction && (
              <div className="mentor-example">
                <p>
                  <strong>
                    Student:
                  </strong>{" "}
                  {
                    content.ai_mentor
                      .example_interaction
                      .student
                  }
                </p>

                <p>
                  <strong>
                    AI Mentor:
                  </strong>{" "}
                  {
                    content.ai_mentor
                      .example_interaction
                      .hint_1
                  }
                </p>

                <p>
                  <strong>
                    Next Hint:
                  </strong>{" "}
                  {
                    content.ai_mentor
                      .example_interaction
                      .hint_2
                  }
                </p>

                <p>
                  <strong>
                    Next Step:
                  </strong>{" "}
                  {
                    content.ai_mentor
                      .example_interaction
                      .next_step
                  }
                </p>
              </div>
            )}

            {content.ai_mentor.rules?.length > 0 && (
              <ul>
                {content.ai_mentor.rules.map(
                  (rule, index) => (
                    <li key={index}>
                      {rule}
                    </li>
                  )
                )}
              </ul>
            )}

            <button disabled>
              AI Mentor Integration
              Coming Next
            </button>
          </section>
        )}

        {/* ==============================
            UNSEEN CHALLENGE
        =============================== */}

        {content.unseen_challenge && (
          <section className="lesson-section challenge-section">
            <span className="section-kicker">
              TEST YOUR UNDERSTANDING
            </span>

            <h2>
              {
                content.unseen_challenge
                  .title
              }
            </h2>

            <p>
              {
                content.unseen_challenge
                  .task
              }
            </p>

            {content.unseen_challenge.requirements?.length > 0 && (
              <>
                <h3>
                  Requirements
                </h3>

                <ul>
                  {content.unseen_challenge.requirements.map(
                    (
                      requirement,
                      index
                    ) => (
                      <li key={index}>
                        {requirement}
                      </li>
                    )
                  )}
                </ul>
              </>
            )}

            {content.unseen_challenge.rules?.length > 0 && (
              <>
                <h3>Rules</h3>

                <ul>
                  {content.unseen_challenge.rules.map(
                    (rule, index) => (
                      <li key={index}>
                        {rule}
                      </li>
                    )
                  )}
                </ul>
              </>
            )}

            {content.unseen_challenge.ai_support && (
              <div className="key-idea">
                <strong>
                  AI Mentor:
                </strong>{" "}
                {
                  content.unseen_challenge
                    .ai_support
                }
              </div>
            )}
          </section>
        )}

        {/* ==============================
            REAL WORLD APPLICATIONS
        =============================== */}

        {content.real_world_applications?.length > 0 && (
          <section className="lesson-section">
            <span className="section-kicker">
              REAL WORLD
            </span>

            <h2>
              Where Will You See This?
            </h2>

            <ul>
              {content.real_world_applications.map(
                (application, index) => (
                  <li key={index}>
                    {application}
                  </li>
                )
              )}
            </ul>
          </section>
        )}

        {/* ==============================
            PROGRAMMER MINDSET
        =============================== */}

        {content.think_like_a_programmer && (
          <section className="lesson-section">
            <span className="section-kicker">
              PROGRAMMER MINDSET
            </span>

            <h2>
              {
                content
                  .think_like_a_programmer
                  .title
              }
            </h2>

            <p>
              <strong>
                Problem:
              </strong>{" "}
              {
                content
                  .think_like_a_programmer
                  .problem
              }
            </p>

            <div className="flow-list">
              {content.think_like_a_programmer.thinking_process?.map(
                (step, index) => (
                  <div
                    className="flow-item"
                    key={index}
                  >
                    <span>
                      {index + 1}
                    </span>

                    <p>{step}</p>
                  </div>
                )
              )}
            </div>

            <div className="key-idea">
              <strong>
                Skill:
              </strong>{" "}
              {
                content
                  .think_like_a_programmer
                  .skill
              }
            </div>
          </section>
        )}

        {/* ==============================
            INTERVIEW QUESTIONS
        =============================== */}

        {content.interview_questions?.length > 0 && (
          <section className="lesson-section">
            <span className="section-kicker">
              INTERVIEW PREPARATION
            </span>

            <h2>
              Interview Questions
            </h2>

            <ol>
              {content.interview_questions.map(
                (question, index) => (
                  <li key={index}>
                    {question}
                  </li>
                )
              )}
            </ol>
          </section>
        )}

        {/* ==============================
            MINI PROJECT
        =============================== */}

        {content.mini_project && (
          <section className="lesson-section project-section">
            <span className="section-kicker">
              BUILD SOMETHING
            </span>

            <h2>
              🛠️{" "}
              {content.mini_project.title}
            </h2>

            <p>
              {content.mini_project.problem}
            </p>

            {content.mini_project.requirements?.length > 0 && (
              <>
                <h3>
                  Requirements
                </h3>

                <ul>
                  {content.mini_project.requirements.map(
                    (
                      requirement,
                      index
                    ) => (
                      <li key={index}>
                        {requirement}
                      </li>
                    )
                  )}
                </ul>
              </>
            )}

            {content.mini_project.skills_learned?.length > 0 && (
              <>
                <h3>
                  Skills You Practice
                </h3>

                <ul>
                  {content.mini_project.skills_learned.map(
                    (skill, index) => (
                      <li key={index}>
                        {skill}
                      </li>
                    )
                  )}
                </ul>
              </>
            )}

            {content.mini_project.testing?.length > 0 && (
              <>
                <h3>Testing</h3>

                <ul>
                  {content.mini_project.testing.map(
                    (test, index) => (
                      <li key={index}>
                        {test}
                      </li>
                    )
                  )}
                </ul>
              </>
            )}
          </section>
        )}

        {/* ==============================
            LESSON COMPLETION
        =============================== */}

        {content.lesson_completion && (
          <section className="lesson-section completion-section">
            <span className="section-kicker">
              LESSON CHECK
            </span>

            <h2>
              Before You Complete This
              Lesson
            </h2>

            {content.lesson_completion.requirements?.length > 0 && (
              <ul>
                {content.lesson_completion.requirements.map(
                  (
                    requirement,
                    index
                  ) => (
                    <li key={index}>
                      {requirement}
                    </li>
                  )
                )}
              </ul>
            )}

            {content.lesson_completion
              .completion_message && (
              <p>
                {
                  content.lesson_completion
                    .completion_message
                }
              </p>
            )}
          </section>
        )}

        {/* ==============================
            COMPLETE
        =============================== */}

        <div className="lesson-complete-area">
          {completed ? (
            <button
              disabled
              className="completed-button"
            >
              ✅ Lesson Completed
            </button>
          ) : (
            <button
              onClick={markComplete}
              className="complete-button"
            >
              Mark Lesson as Complete
            </button>
          )}
        </div>

        {/* ==============================
            NAVIGATION
        =============================== */}

        <div className="lesson-navigation">
          <button
            disabled={!previousLesson}
            onClick={() => {
              if (previousLesson) {
                navigate(
                  `/lesson/${previousLesson.id}`
                );
              }
            }}
          >
            ← Previous
          </button>

          <button
            disabled={!nextLesson}
            onClick={() => {
              if (nextLesson) {
                navigate(
                  `/lesson/${nextLesson.id}`
                );
              }
            }}
          >
            Next →
          </button>
        </div>

      </div>
    </div>
  );
}

export default LessonPage;