import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../styles/LessonPage.css";

function LessonPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [content, setContent] = useState({});
  const [allLessons, setAllLessons] = useState([]);
  const [completed, setCompleted] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeStage, setActiveStage] = useState(0);
  const [copiedCode, setCopiedCode] = useState("");
  const [practiceAnswers, setPracticeAnswers] = useState({});

  // ============================================================
  // LOAD LESSON
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    const loadLesson = async () => {
      setLoading(true);
      setError("");

      try {
        const numericLessonId = Number(lessonId);

        if (!numericLessonId) {
          setError("Invalid lesson ID.");
          return;
        }

        // --------------------------------------------------------
        // 1. Lesson
        // --------------------------------------------------------

        const { data: lessonData, error: lessonError } =
          await supabase
            .from("lessons")
            .select("*")
            .eq("id", numericLessonId)
            .single();

        if (lessonError) {
          console.error("Lesson error:", lessonError);
          setError("Unable to load this lesson.");
          return;
        }

        // --------------------------------------------------------
        // 2. Latest published lesson template
        // --------------------------------------------------------

        const { data: templateData, error: templateError } =
          await supabase
            .from("lesson_templates")
            .select("content, version")
            .eq("lesson_id", lessonData.id)
            .eq("is_published", true)
            .order("version", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (templateError) {
          console.error("Template error:", templateError);
        }

        // --------------------------------------------------------
        // 3. All lessons in same module
        // --------------------------------------------------------

        const { data: lessonsData, error: lessonsError } =
          await supabase
            .from("lessons")
            .select(
              "id, module_id, lesson_order, lesson_title, difficulty, estimated_duration"
            )
            .eq("module_id", lessonData.module_id)
            .eq("is_active", true)
            .order("lesson_order");

        if (lessonsError) {
          console.error("Lessons list error:", lessonsError);
        }

        // --------------------------------------------------------
        // 4. Current user progress
        // --------------------------------------------------------

        const {
          data: { user },
        } = await supabase.auth.getUser();

        let progressCompleted = false;

        if (user) {
          const { data: progress, error: progressError } =
            await supabase
              .from("lesson_progress")
              .select("completed")
              .eq("lesson_id", lessonData.id)
              .eq("user_id", user.id)
              .limit(1);

          if (progressError) {
            console.error("Progress error:", progressError);
          }

          progressCompleted = progress?.[0]?.completed === true;
        }

        if (!cancelled) {
          setLesson(lessonData);
          setContent(templateData?.content || {});
          setAllLessons(lessonsError ? [] : lessonsData || []);
          setCompleted(progressCompleted);
          setActiveStage(0);
        }
      } catch (err) {
        console.error("Lesson loading error:", err);

        if (!cancelled) {
          setError("Something went wrong while loading the lesson.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadLesson();

    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  // ============================================================
  // HELPERS
  // ============================================================

  const text = (value) => {
    if (value === null || value === undefined) return "";

    if (typeof value === "string") return value;

    if (typeof value === "number") return String(value);

    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    return "";
  };

  const hasValue = (value) => {
    return (
      value !== null &&
      value !== undefined &&
      value !== "" &&
      !(Array.isArray(value) && value.length === 0)
    );
  };

  const asArray = (value) => {
    if (Array.isArray(value)) return value;
    if (!hasValue(value)) return [];
    return [value];
  };

  const formatCode = (value) => {
    if (!hasValue(value)) return "";

    return String(value)
      .replace(/\\n/g, "\n")
      .replace(/\\"/g, '"')
      .trim();
  };

  const formatOutput = (value) => {
    if (!hasValue(value)) return "";

    return String(value)
      .replace(/\\n/g, "\n")
      .replace(/\\"/g, '"')
      .trim();
  };

  const copyCode = async (code, key) => {
    try {
      await navigator.clipboard.writeText(formatCode(code));

      setCopiedCode(key);

      setTimeout(() => {
        setCopiedCode("");
      }, 1500);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  // ============================================================
  // NORMALIZE CONTENT
  // Supports current flat DB structure and older nested structure
  // ============================================================

  const normalizedContent = useMemo(() => {
    if (!content) return {};

    // Current structure is already flat.
    if (!content.stages) {
      return content;
    }

    // Fallback for older nested content.
    const stages = content.stages;

    return {
      ...content,

      why_learn:
        content.why_learn ||
        stages.understand?.why_learn ||
        stages.understand?.intro,

      learning_objectives:
        content.learning_objectives ||
        stages.understand?.learning_objectives,

      theory:
        content.theory ||
        stages.learn?.theory,

      examples:
        content.examples ||
        stages.learn?.examples,

      example_program:
        content.example_program ||
        stages.learn?.example,

      guided_practice:
        content.guided_practice ||
        stages.practice?.guided_practice,

      challenge:
        content.challenge ||
        stages.challenge,

      mini_project:
        content.mini_project ||
        stages.build_review?.mini_project,

      interview_questions:
        content.interview_questions ||
        stages.build_review?.interview_questions,

      lesson_completion:
        content.lesson_completion ||
        stages.build_review?.lesson_completion,

      next_topic:
        content.next_topic ||
        stages.build_review?.next_topic,
    };
  }, [content]);

  // ============================================================
  // LESSON NAVIGATION
  // ============================================================

  const currentIndex = allLessons.findIndex(
    (item) => Number(item.id) === Number(lesson?.id)
  );

  const totalLessons = allLessons.length;

  const currentLessonNumber =
    currentIndex >= 0 ? currentIndex + 1 : lesson?.lesson_order || 1;

  const previousLesson =
    currentIndex > 0 ? allLessons[currentIndex - 1] : null;

  const nextLesson =
    currentIndex >= 0 && currentIndex < allLessons.length - 1
      ? allLessons[currentIndex + 1]
      : null;

  // ============================================================
  // MARK COMPLETE
  // ============================================================

  const markComplete = async () => {
    if (!lesson) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login to save your progress.");
      return;
    }

    try {
      const { data: existing, error: existingError } =
        await supabase
          .from("lesson_progress")
          .select("id")
          .eq("lesson_id", lesson.id)
          .eq("user_id", user.id)
          .limit(1);

      if (existingError) {
        console.error(existingError);
        return;
      }

      if (existing?.length) {
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
      } else {
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
      }

      setCompleted(true);
    } catch (err) {
      console.error("Mark complete error:", err);
    }
  };

  // ============================================================
  // NEXT / PREVIOUS
  // ============================================================

  const goToNextLesson = () => {
    if (!nextLesson) return;

    navigate(`/lessons/${nextLesson.module_id}/${nextLesson.id}`);
  };

  const goToPreviousLesson = () => {
    if (!previousLesson) return;

    navigate(
      `/lessons/${previousLesson.module_id}/${previousLesson.id}`
    );
  };

  // ============================================================
  // STAGE CONTENT
  // ============================================================

  const stages = [
    {
      key: "understand",
      number: 1,
      title: "Understand",
      subtitle: "Know what it is and why it matters.",
    },
    {
      key: "learn",
      number: 2,
      title: "Learn",
      subtitle: "Understand the concept with examples.",
    },
    {
      key: "practice",
      number: 3,
      title: "Practice",
      subtitle: "Try small coding tasks.",
    },
    {
      key: "challenge",
      number: 4,
      title: "Challenge",
      subtitle: "Solve a problem independently.",
    },
    {
      key: "build",
      number: 5,
      title: "Build & Review",
      subtitle: "Build, review and move forward.",
    },
  ];

  // ============================================================
  // RENDER: UNDERSTAND
  // ============================================================

  const renderUnderstand = () => {
    return (
      <div className="lesson-stage-content">
        <section className="learning-section">
          <div className="section-label">WHY THIS MATTERS</div>
          <h2>Why should you learn this?</h2>

          {asArray(normalizedContent.why_learn).map(
            (item, index) => (
              <div className="bullet-card" key={index}>
                <span className="bullet-icon">✓</span>
                <p>{text(item)}</p>
              </div>
            )
          )}
        </section>

        {hasValue(normalizedContent.learning_objectives) && (
          <section className="learning-section">
            <div className="section-label">LEARNING GOALS</div>
            <h2>What you will be able to do</h2>

            <div className="objective-grid">
              {asArray(
                normalizedContent.learning_objectives
              ).map((item, index) => (
                <div className="objective-card" key={index}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{text(item)}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {normalizedContent.what_is_c && (
          <section className="learning-section">
            <div className="section-label">CORE IDEA</div>
            <h2>
              {text(normalizedContent.what_is_c.title) ||
                "What is this?"}
            </h2>

            <div className="explanation-card">
              <p>
                {text(
                  normalizedContent.what_is_c.explanation
                )}
              </p>

              {hasValue(
                normalizedContent.what_is_c.important_idea
              ) && (
                <div className="important-box">
                  <strong>Important:</strong>
                  <span>
                    {text(
                      normalizedContent.what_is_c
                        .important_idea
                    )}
                  </span>
                </div>
              )}
            </div>
          </section>
        )}

        {hasValue(normalizedContent.where_c_is_used) && (
          <section className="learning-section">
            <div className="section-label">
              REAL WORLD
            </div>

            <h2>Where is it used?</h2>

            <div className="application-grid">
              {asArray(
                normalizedContent.where_c_is_used
              ).map((item, index) => (
                <div className="application-card" key={index}>
                  <span>▸</span>
                  <p>{text(item)}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  };

  // ============================================================
  // CODE BLOCK
  // ============================================================

  const renderCodeBlock = (code, key = "code") => {
    if (!hasValue(code)) return null;

    const formatted = formatCode(code);

    return (
      <div className="code-wrapper">
        <div className="code-header">
          <span>C</span>

          <button
            type="button"
            onClick={() => copyCode(code, key)}
            className="copy-button"
          >
            {copiedCode === key ? "Copied ✓" : "Copy"}
          </button>
        </div>

        <pre className="code-block">
          <code>{formatted}</code>
        </pre>
      </div>
    );
  };

  // ============================================================
  // RENDER: LEARN
  // ============================================================

  const renderLearn = () => {
    return (
      <div className="lesson-stage-content">
        {normalizedContent.theory && (
          <section className="learning-section">
            <div className="section-label">
              CORE CONCEPT
            </div>

            <h2>
              {text(normalizedContent.theory.title) ||
                "Core Idea"}
            </h2>

            <div className="explanation-card">
              <p>
                {text(
                  normalizedContent.theory.explanation
                )}
              </p>
            </div>
          </section>
        )}

        {normalizedContent.program_execution && (
          <section className="learning-section">
            <div className="section-label">
              PROGRAM FLOW
            </div>

            <h2>
              {text(
                normalizedContent.program_execution.title
              ) || "How it works"}
            </h2>

            <div className="flow-container">
              {asArray(
                normalizedContent.program_execution.steps
              ).map((step, index) => (
                <div className="flow-step" key={index}>
                  <div className="flow-number">
                    {index + 1}
                  </div>

                  <div className="flow-text">
                    <strong>
                      Step {index + 1}
                    </strong>
                    <p>{text(step)}</p>
                  </div>

                  {index <
                    normalizedContent.program_execution
                      .steps.length -
                      1 && (
                    <div className="flow-arrow">
                      ↓
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {normalizedContent.example_program && (
          <section className="learning-section">
            <div className="section-label">
              LEARN BY EXAMPLE
            </div>

            <h2>
              {text(
                normalizedContent.example_program.title
              ) || "Example Program"}
            </h2>

            {hasValue(
              normalizedContent.example_program.description
            ) && (
              <p className="section-description">
                {text(
                  normalizedContent.example_program
                    .description
                )}
              </p>
            )}

            {renderCodeBlock(
              normalizedContent.example_program.code,
              "example-program"
            )}

            {hasValue(
              normalizedContent.example_program.output
            ) && (
              <div className="output-wrapper">
                <div className="output-header">
                  <span>Expected Output</span>
                </div>

                <pre className="output-block">
                  {formatOutput(
                    normalizedContent.example_program
                      .output
                  )}
                </pre>
              </div>
            )}

            {normalizedContent.example_program
              .explanation && (
              <div className="explanation-grid">
                {Object.entries(
                  normalizedContent.example_program
                    .explanation
                ).map(([key, value]) => (
                  <div
                    className="concept-explanation"
                    key={key}
                  >
                    <h3>{key}</h3>
                    <p>{text(value)}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {Array.isArray(normalizedContent.examples) &&
          normalizedContent.examples.length > 0 && (
            <section className="learning-section">
              <div className="section-label">
                MORE EXAMPLES
              </div>

              <h2>Examples</h2>

              <div className="examples-list">
                {normalizedContent.examples.map(
                  (example, index) => (
                    <article
                      className="example-card"
                      key={index}
                    >
                      <div className="example-number">
                        Example {index + 1}
                      </div>

                      <h3>
                        {text(example.title) ||
                          `Example ${index + 1}`}
                      </h3>

                      {hasValue(example.purpose) && (
                        <p className="example-purpose">
                          {text(example.purpose)}
                        </p>
                      )}

                      {renderCodeBlock(
                        example.code,
                        `example-${index}`
                      )}

                      {hasValue(example.output) && (
                        <div className="output-wrapper">
                          <div className="output-header">
                            <span>Output</span>
                          </div>

                          <pre className="output-block">
                            {formatOutput(
                              example.output
                            )}
                          </pre>
                        </div>
                      )}
                    </article>
                  )
                )}
              </div>
            </section>
          )}
      </div>
    );
  };

  // ============================================================
  // RENDER: PRACTICE
  // ============================================================

  const renderPractice = () => {
    const practices = asArray(
      normalizedContent.guided_practice
    );

    return (
      <div className="lesson-stage-content">
        {practices.length > 0 && (
          <section className="learning-section">
            <div className="section-label">
              YOUR TURN
            </div>

            <h2>Guided Practice</h2>

            <div className="practice-list">
              {practices.map((practice, index) => (
                <article
                  className="practice-card"
                  key={index}
                >
                  <div className="practice-top">
                    <div className="practice-number">
                      {index + 1}
                    </div>

                    <div>
                      <span className="practice-label">
                        PRACTICE
                      </span>

                      <h3>
                        {text(practice.title) ||
                          `Practice ${index + 1}`}
                      </h3>
                    </div>
                  </div>

                  <p className="practice-task">
                    {text(practice.task)}
                  </p>

                  <textarea
                    className="practice-editor"
                    placeholder="// Write your solution here..."
                    value={
                      practiceAnswers[index] || ""
                    }
                    onChange={(event) =>
                      setPracticeAnswers((prev) => ({
                        ...prev,
                        [index]:
                          event.target.value,
                      }))
                    }
                  />

                  {hasValue(practice.hint) && (
                    <details className="hint-box">
                      <summary>
                        Need a hint?
                      </summary>

                      <p>
                        {text(practice.hint)}
                      </p>
                    </details>
                  )}

                  <button
                    type="button"
                    className="compiler-button"
                    onClick={() =>
                      navigate("/workspace")
                    }
                  >
                    Open Compiler →
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}

        {normalizedContent.debugging && (
          <section className="learning-section">
            <div className="section-label">
              DEBUGGING
            </div>

            <h2>
              {text(
                normalizedContent.debugging.title
              ) || "Find the Error"}
            </h2>

            <p className="section-description">
              {text(
                normalizedContent.debugging.description
              )}
            </p>

            {renderCodeBlock(
              normalizedContent.debugging.code,
              "debugging"
            )}

            <div className="debug-question">
              <strong>
                {text(
                  normalizedContent.debugging.question
                )}
              </strong>
            </div>

            {Array.isArray(
              normalizedContent.debugging.hints
            ) && (
              <details className="hint-box">
                <summary>
                  Need a debugging hint?
                </summary>

                <ol>
                  {normalizedContent.debugging.hints.map(
                    (hint, index) => (
                      <li key={index}>
                        {text(hint)}
                      </li>
                    )
                  )}
                </ol>
              </details>
            )}

            {hasValue(
              normalizedContent.debugging
                .solution_explanation
            ) && (
              <details className="solution-box">
                <summary>
                  Show explanation
                </summary>

                <p>
                  {text(
                    normalizedContent.debugging
                      .solution_explanation
                  )}
                </p>
              </details>
            )}
          </section>
        )}
      </div>
    );
  };

  // ============================================================
  // RENDER: CHALLENGE
  // ============================================================

  const renderChallenge = () => {
    const challenge = normalizedContent.challenge;

    return (
      <div className="lesson-stage-content">
        {challenge && (
          <section className="challenge-main">
            <div className="challenge-badge">
              🏆 Challenge
            </div>

            <h2>
              {text(challenge.title) ||
                "Your Challenge"}
            </h2>

            <p className="challenge-description">
              {text(challenge.description)}
            </p>

            {hasValue(challenge.task) && (
              <div className="challenge-task">
                <span>YOUR TASK</span>
                <p>{text(challenge.task)}</p>
              </div>
            )}

            {Array.isArray(challenge.requirements) && (
              <div className="challenge-section-box">
                <h3>Requirements</h3>

                <ul>
                  {challenge.requirements.map(
                    (item, index) => (
                      <li key={index}>
                        <span>✓</span>
                        {text(item)}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

            {Array.isArray(challenge.rules) && (
              <div className="challenge-section-box">
                <h3>Rules</h3>

                <ul>
                  {challenge.rules.map(
                    (item, index) => (
                      <li key={index}>
                        <span>•</span>
                        {text(item)}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

            {Array.isArray(challenge.hints) && (
              <details className="hint-box">
                <summary>
                  Need a hint?
                </summary>

                <ol>
                  {challenge.hints.map(
                    (hint, index) => (
                      <li key={index}>
                        {text(hint)}
                      </li>
                    )
                  )}
                </ol>
              </details>
            )}

            <button
              type="button"
              className="compiler-button challenge-button"
              onClick={() =>
                navigate("/workspace")
              }
            >
              Solve in Compiler →
            </button>
          </section>
        )}

        {Array.isArray(
          normalizedContent.common_mistakes
        ) &&
          normalizedContent.common_mistakes.length >
            0 && (
            <section className="learning-section">
              <div className="section-label">
                WATCH OUT
              </div>

              <h2>Common Mistakes</h2>

              <div className="mistakes-grid">
                {normalizedContent.common_mistakes.map(
                  (item, index) => (
                    <div
                      className="mistake-card"
                      key={index}
                    >
                      <div className="mistake-icon">
                        !
                      </div>

                      <div>
                        <h3>
                          {text(item.mistake) ||
                            text(item.title)}
                        </h3>

                        <p>
                          {text(
                            item.explanation
                          )}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </section>
          )}

        {normalizedContent.programmer_mindset && (
          <section className="learning-section">
            <div className="section-label">
              PROGRAMMER MINDSET
            </div>

            <h2>
              {text(
                normalizedContent
                  .programmer_mindset.title
              ) || "Think Like a Programmer"}
            </h2>

            <div className="mindset-card">
              <p>
                <strong>Problem:</strong>{" "}
                {text(
                  normalizedContent
                    .programmer_mindset.problem
                )}
              </p>

              <div className="mindset-steps">
                {asArray(
                  normalizedContent
                    .programmer_mindset.steps
                ).map((step, index) => (
                  <div
                    className="mindset-step"
                    key={index}
                  >
                    <span>{index + 1}</span>
                    <p>{text(step)}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    );
  };

  // ============================================================
  // RENDER: BUILD & REVIEW
  // ============================================================

  const renderBuild = () => {
    const project = normalizedContent.mini_project;

    return (
      <div className="lesson-stage-content">
        {project && (
          <section className="project-card">
            <div className="project-label">
              🛠️ BUILD SOMETHING
            </div>

            <h2>
              {text(project.title) ||
                "Mini Project"}
            </h2>

            <p className="project-description">
              {text(project.description)}
            </p>

            {Array.isArray(project.requirements) && (
              <div className="project-block">
                <h3>Requirements</h3>

                <ul>
                  {project.requirements.map(
                    (item, index) => (
                      <li key={index}>
                        <span>✓</span>
                        {text(item)}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

            {Array.isArray(project.skills) && (
              <div className="project-block">
                <h3>Skills you practice</h3>

                <div className="skill-tags">
                  {project.skills.map(
                    (skill, index) => (
                      <span key={index}>
                        {text(skill)}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {Array.isArray(
          normalizedContent.interview_questions
        ) &&
          normalizedContent.interview_questions
            .length > 0 && (
            <section className="learning-section">
              <div className="section-label">
                INTERVIEW PREPARATION
              </div>

              <h2>Interview Questions</h2>

              <div className="interview-list">
                {normalizedContent.interview_questions.map(
                  (question, index) => (
                    <div
                      className="interview-item"
                      key={index}
                    >
                      <span>
                        {String(index + 1).padStart(
                          2,
                          "0"
                        )}
                      </span>

                      <p>{text(question)}</p>
                    </div>
                  )
                )}
              </div>
            </section>
          )}

        {normalizedContent.lesson_completion && (
          <section className="completion-card">
            <div className="completion-icon">
              ✓
            </div>

            <div>
              <div className="section-label">
                LESSON CHECK
              </div>

              <h2>Ready to complete?</h2>

              {Array.isArray(
                normalizedContent.lesson_completion
                  .requirements
              ) && (
                <ul>
                  {normalizedContent.lesson_completion.requirements.map(
                    (item, index) => (
                      <li key={index}>
                        {text(item)}
                      </li>
                    )
                  )}
                </ul>
              )}

              {hasValue(
                normalizedContent.lesson_completion
                  .completion_message
              ) && (
                <p>
                  {text(
                    normalizedContent
                      .lesson_completion
                      .completion_message
                  )}
                </p>
              )}
            </div>
          </section>
        )}

        {normalizedContent.next_topic && (
          <section className="next-topic-card">
            <span>NEXT TOPIC</span>

            <h2>
              {text(
                normalizedContent.next_topic.title
              )}
            </h2>

            <p>
              {text(
                normalizedContent.next_topic
                  .description
              )}
            </p>
          </section>
        )}
      </div>
    );
  };

  // ============================================================
  // ACTIVE STAGE
  // ============================================================

  const renderActiveStage = () => {
    switch (activeStage) {
      case 0:
        return renderUnderstand();

      case 1:
        return renderLearn();

      case 2:
        return renderPractice();

      case 3:
        return renderChallenge();

      case 4:
        return renderBuild();

      default:
        return renderUnderstand();
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <main className="lesson-page">
        <div className="lesson-loading">
          <div className="loading-spinner"></div>
          <h2>Loading lesson...</h2>
          <p>Preparing your learning experience.</p>
        </div>
      </main>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error || !lesson) {
    return (
      <main className="lesson-page">
        <div className="lesson-error">
          <div className="error-icon">!</div>

          <h2>Lesson unavailable</h2>

          <p>
            {error ||
              "This lesson could not be loaded."}
          </p>

          <button
            type="button"
            onClick={() => navigate(-1)}
          >
            ← Go Back
          </button>
        </div>
      </main>
    );
  }

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <main className="lesson-page">
      <div className="lesson-container">
        {/* BACK */}
        <button
          type="button"
          className="lesson-back"
          onClick={() => navigate(-1)}
        >
          ← Back to Lessons
        </button>

        {/* HEADER */}
        <header className="lesson-header">
          <div className="lesson-header-top">
            <span className="lesson-course-label">
              C PROGRAMMING
            </span>

            {completed && (
              <span className="completed-badge">
                ✓ Completed
              </span>
            )}
          </div>

          <h1>{lesson.lesson_title}</h1>

          <p className="lesson-intro">
            {content.intro ||
              "Learn the concept step by step through explanation, practice and challenges."}
          </p>

          <div className="lesson-meta">
            <span>
              ● {lesson.difficulty || "Beginner"}
            </span>

            <span>
              ◷{" "}
              {lesson.estimated_duration ||
                "2 Days"}
            </span>

            {totalLessons > 0 && (
              <span>
                Lesson {currentLessonNumber} of{" "}
                {totalLessons}
              </span>
            )}
          </div>
        </header>

        {/* PROGRESS */}
        <div className="lesson-progress-area">
          <div className="progress-info">
            <span>
              Stage {activeStage + 1} of 5
            </span>

            <span>
              {Math.round(
                ((activeStage + 1) / 5) * 100
              )}
              %
            </span>
          </div>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${
                  ((activeStage + 1) / 5) * 100
                }%`,
              }}
            />
          </div>
        </div>

        {/* STAGE NAVIGATION */}
        <nav className="stage-navigation">
          {stages.map((stage, index) => (
            <button
              type="button"
              key={stage.key}
              className={`stage-button ${
                activeStage === index
                  ? "active"
                  : ""
              } ${
                index < activeStage
                  ? "visited"
                  : ""
              }`}
              onClick={() =>
                setActiveStage(index)
              }
            >
              <span className="stage-number">
                {index < activeStage
                  ? "✓"
                  : stage.number}
              </span>

              <span className="stage-text">
                <strong>{stage.title}</strong>
                <small>{stage.subtitle}</small>
              </span>
            </button>
          ))}
        </nav>

        {/* STAGE CONTENT */}
        <div className="lesson-content">
          {renderActiveStage()}
        </div>

        {/* STAGE NAVIGATION BUTTONS */}
        <div className="stage-footer">
          <button
            type="button"
            className="secondary-button"
            disabled={activeStage === 0}
            onClick={() =>
              setActiveStage((prev) =>
                Math.max(prev - 1, 0)
              )
            }
          >
            ← Previous Stage
          </button>

          <span>
            {stages[activeStage].title}
          </span>

          {activeStage < stages.length - 1 ? (
            <button
              type="button"
              className="primary-button"
              onClick={() =>
                setActiveStage((prev) =>
                  Math.min(
                    prev + 1,
                    stages.length - 1
                  )
                )
              }
            >
              Next Stage →
            </button>
          ) : (
            <button
              type="button"
              className={`complete-button ${
                completed ? "completed" : ""
              }`}
              onClick={markComplete}
            >
              {completed
                ? "✓ Lesson Completed"
                : "✓ Mark Lesson Complete"}
            </button>
          )}
        </div>

        {/* LESSON NAVIGATION */}
        <div className="lesson-navigation">
          <button
            type="button"
            disabled={!previousLesson}
            onClick={goToPreviousLesson}
          >
            <small>Previous Lesson</small>

            <strong>
              {previousLesson
                ? previousLesson.lesson_title
                : "No previous lesson"}
            </strong>
          </button>

          <button
            type="button"
            disabled={!nextLesson}
            onClick={goToNextLesson}
          >
            <small>Next Lesson</small>

            <strong>
              {nextLesson
                ? nextLesson.lesson_title
                : "Module Complete"}
            </strong>
          </button>
        </div>
      </div>
    </main>
  );
}

export default LessonPage;