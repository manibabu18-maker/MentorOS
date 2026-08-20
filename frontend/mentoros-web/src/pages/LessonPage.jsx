import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

/* =========================================================
   SAFE LESSON RENDERER
   Supports strings, arrays, objects and nested objects.
   The lesson data can evolve without React trying to render
   a raw object as a child.
========================================================= */

const text = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return "";
};

const label = (key) =>
  String(key)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const formatText = (value) => text(value)
  .replace(/\\\\n/g, "\\n")
  .replace(/\\n/g, "\n")
  .replace(/\\"/g, '"');

const formatCode = (value) => {
  if (value === null || value === undefined) return "";
  let code = String(value)
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\\"/g, '"');

  // Preserve C string escape sequences such as printf("Hello\\n").
  // Convert only escaped newlines that occur outside quoted strings.
  let result = "";
  let inString = false;
  let escaped = false;

  for (let i = 0; i < code.length; i += 1) {
    const c = code[i];
    if (c === '"' && !escaped) inString = !inString;
    if (c === "\\" && !escaped) {
      if (code[i + 1] === "n" && !inString) {
        result += "\n";
        i += 1;
        escaped = false;
        continue;
      }
      escaped = true;
    } else {
      escaped = false;
    }
    result += c;
  }

  return result.trim();
};

const formatOutput = (value) => formatText(value).replace(/\\n/g, "\n");

const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const hasValue = (value) =>
  value !== null && value !== undefined && value !== "";

const safeArray = (value) => {
  if (Array.isArray(value)) return value;
  if (!hasValue(value)) return [];
  return [value];
};

function ValueBlock({ value, level = 0 }) {
  if (!hasValue(value)) return null;

  if (!isObject(value) && !Array.isArray(value)) {
    return <p>{text(value)}</p>;
  }

  if (Array.isArray(value)) {
    return (
      <ul>
        {value.map((item, index) => (
          <li key={index}>
            {isObject(item) || Array.isArray(item) ? (
              <ValueBlock value={item} level={level + 1} />
            ) : (
              text(item)
            )}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className={level ? "structured-content nested-content" : "structured-content"}>
      {Object.entries(value).map(([key, item]) => {
        if (!hasValue(item)) return null;
        return (
          <div className="structured-item" key={key}>
            <h4>{label(key)}</h4>
            <ValueBlock value={item} level={level + 1} />
          </div>
        );
      })}
    </div>
  );
}

function ListBlock({ value, ordered = false }) {
  const items = safeArray(value);
  if (!items.length) return null;
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag>
      {items.map((item, index) => (
        <li key={index}>
          {isObject(item) || Array.isArray(item) ? <ValueBlock value={item} /> : text(item)}
        </li>
      ))}
    </Tag>
  );
}

function CodeBlock({ value, output = false }) {
  if (!hasValue(value)) return null;
  return (
    <pre className={output ? "output-block" : "code-block"}>
      <code>{output ? formatOutput(value) : formatCode(value)}</code>
    </pre>
  );
}

function Section({ kicker, title, children, className = "" }) {
  if (!children) return null;
  return (
    <section className={`lesson-section ${className}`.trim()}>
      {kicker && <span className="section-kicker">{kicker}</span>}
      {title && <h2>{title}</h2>}
      {children}
    </section>
  );
}

function ExampleCard({ example, index }) {
  if (!isObject(example)) {
    return (
      <div className="example-card" key={index}>
        <ValueBlock value={example} />
      </div>
    );
  }

  return (
    <div className="example-card" key={index}>
      <h3>{text(example.title) || `Example ${index + 1}`}</h3>
      {hasValue(example.purpose) && (
        <p><strong>Purpose:</strong> {text(example.purpose)}</p>
      )}
      {hasValue(example.description) && <p>{text(example.description)}</p>}
      {hasValue(example.code) && <CodeBlock value={example.code} />}
      {hasValue(example.output) && (
        <>
          <h4>Output</h4>
          <CodeBlock value={example.output} output />
        </>
      )}
      {hasValue(example.explanation) && (
        <div className="example-explanation">
          <ValueBlock value={example.explanation} />
        </div>
      )}
      {hasValue(example.key_concept) && (
        <div className="key-idea"><strong>Key Concept:</strong> {text(example.key_concept)}</div>
      )}
    </div>
  );
}

function ExampleSection({ content }) {
  if (!Array.isArray(content.examples) || !content.examples.length) return null;
  return (
    <Section kicker="LEARN BY EXAMPLE" title="Examples">
      {content.examples.map((example, index) => (
        <ExampleCard example={example} index={index} key={index} />
      ))}
    </Section>
  );
}

function RealWorldSection({ content }) {
  const items = content.real_world_connection?.applications || content.real_world_examples || content.real_world_applications;
  if (!hasValue(items)) return null;

  return (
    <Section kicker="REAL-WORLD CONNECTION" title={text(content.real_world_connection?.title) || "Where Will You Use This?"}>
      {Array.isArray(items) ? (
        <div className="card-grid">
          {items.map((item, index) => (
            <div className="concept-card" key={index}>
              {isObject(item) ? (
                <>
                  <h3>{text(item.title) || text(item.area) || `Application ${index + 1}`}</h3>
                  {hasValue(item.example) && <p>{text(item.example)}</p>}
                  {hasValue(item.description) && <p>{text(item.description)}</p>}
                  {Array.isArray(item.examples) && <ListBlock value={item.examples} />}
                </>
              ) : <p>{text(item)}</p>}
            </div>
          ))}
        </div>
      ) : <ValueBlock value={items} />}
    </Section>
  );
}

function ThinkSection({ content }) {
  const data = content.think_before_you_run || content.output_prediction;
  if (!isObject(data)) return null;
  return (
    <Section kicker="THINK BEFORE YOU RUN" title={text(data.title) || "Think Before You Run"} className="practice-section">
      {hasValue(data.code) && <CodeBlock value={data.code} />}
      {hasValue(data.question) && <p>{text(data.question)}</p>}
      {hasValue(data.task) && <p>{text(data.task)}</p>}
      <details className="hint-box">
        <summary>Show expected output</summary>
        {hasValue(data.expected_output) && <CodeBlock value={data.expected_output} output />}
        {hasValue(data.explanation) && <ValueBlock value={data.explanation} />}
      </details>
    </Section>
  );
}

function PracticeSection({ content }) {
  const practices = content.guided_practice;
  if (!Array.isArray(practices) || !practices.length) return null;
  return (
    <Section kicker="YOUR TURN" title="Guided Practice">
      {practices.map((practice, index) => (
        <div className="practice-card" key={index}>
          <h3>{text(practice?.title) || `Practice ${index + 1}`}</h3>
          {hasValue(practice?.task) && <p>{text(practice.task)}</p>}
          {hasValue(practice?.hint) && <p><strong>Hint:</strong> {text(practice.hint)}</p>}
          {Array.isArray(practice?.hints) && practice.hints.length > 0 && (
            <details className="hint-box">
              <summary>Need a hint?</summary>
              <ListBlock value={practice.hints} ordered />
            </details>
          )}
        </div>
      ))}
    </Section>
  );
}

function DebuggingSection({ content }) {
  const data = content.debugging || content.debugging_task || content.debugging_activity;
  if (!isObject(data)) return null;
  return (
    <Section kicker="DEBUGGING" title={text(data.title) || "Find the Error"} className="debugging-section">
      {hasValue(data.description) && <p>{text(data.description)}</p>}
      {hasValue(data.code) && <CodeBlock value={data.code} />}
      {hasValue(data.question) && <p>{text(data.question)}</p>}
      {hasValue(data.task) && <p>{text(data.task)}</p>}
      {Array.isArray(data.hints) && data.hints.length > 0 && (
        <details className="hint-box">
          <summary>Need a debugging hint?</summary>
          <ListBlock value={data.hints} ordered />
        </details>
      )}
      {hasValue(data.hint_1) && <p><strong>Hint:</strong> {text(data.hint_1)}</p>}
      {hasValue(data.solution_explanation) && (
        <div className="key-idea"><strong>Explanation:</strong> {text(data.solution_explanation)}</div>
      )}
      {hasValue(data.learning_goal) && (
        <div className="key-idea"><strong>Goal:</strong> {text(data.learning_goal)}</div>
      )}
    </Section>
  );
}

function ChallengeSection({ content }) {
  const data = content.challenge;
  if (!isObject(data)) return null;
  return (
    <Section kicker="CHALLENGE" title={text(data.title) || "Challenge"} className="challenge-section">
      {hasValue(data.description) && <p>{text(data.description)}</p>}
      {hasValue(data.task) && <p>{text(data.task)}</p>}
      {Array.isArray(data.requirements) && data.requirements.length > 0 && (
        <><h3>Requirements</h3><ListBlock value={data.requirements} /></>
      )}
      {Array.isArray(data.rules) && data.rules.length > 0 && (
        <><h3>Rules</h3><ListBlock value={data.rules} /></>
      )}
      {Array.isArray(data.hints) && data.hints.length > 0 && (
        <details className="hint-box"><summary>Need a hint?</summary><ListBlock value={data.hints} ordered /></details>
      )}
      {Array.isArray(data.hint_levels) && data.hint_levels.length > 0 && (
        <details className="hint-box"><summary>Need a hint?</summary><ListBlock value={data.hint_levels} ordered /></details>
      )}
      {hasValue(data.expected_format) && <><h3>Expected Format</h3><CodeBlock value={data.expected_format} output /></>}
    </Section>
  );
}

function InterviewSection({ content }) {
  if (!hasValue(content.interview_questions)) return null;
  return (
    <Section kicker="INTERVIEW PREPARATION" title="Interview Questions">
      <ListBlock value={content.interview_questions} ordered />
    </Section>
  );
}

function MiniProjectSection({ content }) {
  const p = content.mini_project;
  if (!isObject(p)) return null;
  const description = p.description || p.problem;
  return (
    <Section kicker="BUILD SOMETHING" title={`🛠️ ${text(p.title) || "Mini Project"}`} className="project-section">
      {hasValue(description) && <p>{text(description)}</p>}
      {hasValue(p.real_world_connection) && (
        <div className="key-idea"><strong>Real-world connection:</strong> {text(p.real_world_connection)}</div>
      )}
      {Array.isArray(p.requirements) && p.requirements.length > 0 && <><h3>Requirements</h3><ListBlock value={p.requirements} /></>}
      {Array.isArray(p.skills) && p.skills.length > 0 && <><h3>Skills You Practice</h3><ListBlock value={p.skills} /></>}
      {Array.isArray(p.skills_learned) && p.skills_learned.length > 0 && <><h3>Skills You Practice</h3><ListBlock value={p.skills_learned} /></>}
      {Array.isArray(p.grade_rules) && p.grade_rules.length > 0 && <><h3>Grade Rules</h3><ListBlock value={p.grade_rules} /></>}
      {Array.isArray(p.testing) && p.testing.length > 0 && <><h3>Testing</h3><ListBlock value={p.testing} /></>}
      {p.suggested_data && <><h3>Suggested Data</h3><ValueBlock value={p.suggested_data} /></>}
      {hasValue(p.expected_output) && <><h3>Expected Output</h3><CodeBlock value={p.expected_output} output /></>}
      {Array.isArray(p.hints) && p.hints.length > 0 && <details className="hint-box"><summary>Need a hint?</summary><ListBlock value={p.hints} ordered /></details>}
      {hasValue(p.extension) && <p><strong>Try More:</strong> {text(p.extension)}</p>}
      {hasValue(p.next_topic_connection) && <div className="key-idea"><strong>Next Lesson:</strong> {text(p.next_topic_connection)}</div>}
    </Section>
  );
}

function ProgrammerMindset({ content }) {
  const data = content.programmer_mindset || content.think_like_a_programmer;
  if (!isObject(data)) return null;
  const steps = data.steps || data.thinking_process;
  return (
    <Section kicker="PROGRAMMER MINDSET" title={text(data.title) || "Think Like a Programmer"}>
      {hasValue(data.problem) && <p><strong>Problem:</strong> {text(data.problem)}</p>}
      <div className="flow-list">
        {Array.isArray(steps) && steps.map((step, index) => (
          <div className="flow-item" key={index}><span>{index + 1}</span><p>{text(step)}</p></div>
        ))}
      </div>
      {hasValue(data.skill) && <div className="key-idea"><strong>Skill:</strong> {text(data.skill)}</div>}
    </Section>
  );
}

function AiMentorSection({ content }) {
  const data = content.ai_mentor;
  if (!isObject(data)) return null;
  const interaction = data.example_interaction;
  return (
    <Section kicker="AI MENTOR" title="🤖 Learn With Your AI Mentor" className="ai-mentor-section">
      {hasValue(data.description) && <p>{text(data.description)}</p>}
      {Array.isArray(data.hint_levels) && data.hint_levels.length > 0 && (
        <div className="mentor-rules">
          {data.hint_levels.map((level, index) => (
            <div className="mentor-step" key={index}><span>{index + 1}</span><div><strong>Hint {index + 1}</strong><p>{text(level)}</p></div></div>
          ))}
        </div>
      )}
      {isObject(interaction) && (
        <div className="mentor-example">
          {Object.entries(interaction).map(([key, value]) => (
            <p key={key}><strong>{label(key)}:</strong> {text(value)}</p>
          ))}
        </div>
      )}
      {Array.isArray(data.rules) && <ListBlock value={data.rules} />}
    </Section>
  );
}


function LegacySections({ content }) {
  return (
    <>
      {content.start_here && (
        <Section kicker="START HERE" title={text(content.start_here.title) || "Start Here"}>
          {hasValue(content.start_here.explanation) && <p>{text(content.start_here.explanation)}</p>}
          {isObject(content.start_here.example) && (
            <div className="concept-card">
              {hasValue(content.start_here.example.problem) && <h3>{text(content.start_here.example.problem)}</h3>}
              <ListBlock value={content.start_here.example.steps} ordered />
            </div>
          )}
          {hasValue(content.start_here.key_idea) && <div className="key-idea"><strong>Key Idea:</strong> {text(content.start_here.key_idea)}</div>}
        </Section>
      )}
      {content.what_is_c && (
        <Section kicker="UNDERSTAND" title={text(content.what_is_c.title) || "What Is C?"}>
          <ValueBlock value={content.what_is_c} />
        </Section>
      )}
      {content.where_c_is_used && (
        <Section kicker="REAL-WORLD CONNECTION" title="Where Is C Actually Used?">
          <ValueBlock value={content.where_c_is_used} />
        </Section>
      )}
      {content.concepts && (
        <Section kicker="CORE CONCEPTS" title="Understand the Building Blocks">
          <ValueBlock value={content.concepts} />
        </Section>
      )}
      {content.common_mistakes && (
        <Section kicker="COMMON MISTAKES" title="Watch Out For These Errors" className="debugging-section">
          <ValueBlock value={content.common_mistakes} />
        </Section>
      )}
      {content.unseen_challenge && (
        <Section kicker="TEST YOUR UNDERSTANDING" title={text(content.unseen_challenge.title) || "Test Your Understanding"} className="challenge-section">
          {hasValue(content.unseen_challenge.task) && <p>{text(content.unseen_challenge.task)}</p>}
          {content.unseen_challenge.requirements && <><h3>Requirements</h3><ListBlock value={content.unseen_challenge.requirements} /></>}
          {content.unseen_challenge.rules && <><h3>Rules</h3><ListBlock value={content.unseen_challenge.rules} /></>}
          {hasValue(content.unseen_challenge.ai_support) && <div className="key-idea"><strong>AI Mentor:</strong> {text(content.unseen_challenge.ai_support)}</div>}
        </Section>
      )}
      {content.compiler_activity && (
        <Section kicker="PRACTICAL LAB" title={text(content.compiler_activity.title) || "Try It Yourself"} className="tool-section">
          {hasValue(content.compiler_activity.description) && <p>{text(content.compiler_activity.description)}</p>}
          {Array.isArray(content.compiler_activity.workflow) && <><h3>Workflow</h3><ListBlock value={content.compiler_activity.workflow} ordered /></>}
        </Section>
      )}
      {content.lesson_completion && (
        <Section kicker="LESSON CHECK" title="Before You Complete This Lesson" className="completion-section">
          {content.lesson_completion.requirements && <ListBlock value={content.lesson_completion.requirements} />}
          {hasValue(content.lesson_completion.completion_message) && <p>{text(content.lesson_completion.completion_message)}</p>}
        </Section>
      )}
    </>
  );
}

function GenericExtraSections({ content }) {
  const known = new Set([
    "title", "difficulty", "duration", "next_topic", "why_learn", "learning_objectives",
    "start_here", "what_is_c", "where_c_is_used", "program_execution", "concepts", "examples",
    "theory", "real_world_examples", "real_world_applications", "real_world_connection", "data_types",
    "declaration_and_initialization", "format_specifiers", "operator_categories", "important_concepts",
    "common_mistakes", "example_program", "micro_programs", "build_now", "output_prediction",
    "think_before_you_run", "guided_practice", "debugging", "debugging_task", "debugging_activity",
    "challenge", "compiler_activity", "ai_mentor", "unseen_challenge", "think_like_a_programmer",
    "programmer_mindset", "interview_questions", "mini_project", "lesson_completion"
  ]);

  return (
    <>
      {Object.entries(content).map(([key, value]) => {
        if (known.has(key) || !hasValue(value)) return null;
        return (
          <Section key={key} kicker="MORE TO EXPLORE" title={label(key)}>
            <ValueBlock value={value} />
          </Section>
        );
      })}
    </>
  );
}

function LessonPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [lessonContent, setLessonContent] = useState(null);
  const [allLessons, setAllLessons] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchLesson = async () => {
      setLoading(true);
      setLesson(null);
      setLessonContent(null);
      setCompleted(false);
      setAllLessons([]);
      setPage(0);

      const { data: lessonData, error: lessonError } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", Number(lessonId))
        .single();

      if (lessonError) {
        console.error("Lesson error:", lessonError);
        if (!cancelled) setLoading(false);
        return;
      }

      const { data: templateData, error: templateError } = await supabase
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
      console.log("CURRENT LESSON TITLE:", lessonData.lesson_title);
      console.log("TEMPLATE VERSION:", templateData?.version);
      console.log("TEMPLATE CONTENT:", templateData?.content);

      const { data: lessonsData, error: lessonsError } = await supabase
        .from("lessons")
        .select("*")
        .eq("module_id", lessonData.module_id)
        .eq("is_active", true)
        .order("lesson_order");

      const { data: { user } } = await supabase.auth.getUser();

      let progressCompleted = false;
      if (user) {
        const { data: progress, error: progressError } = await supabase
          .from("lesson_progress")
          .select("completed")
          .eq("lesson_id", lessonData.id)
          .eq("user_id", user.id)
          .limit(1);
        if (progressError) console.error("Progress error:", progressError);
        progressCompleted = progress?.[0]?.completed === true;
      }

      if (!cancelled) {
        setLesson(lessonData);
        setLessonContent(templateData?.content || {});
        setAllLessons(lessonsError ? [] : lessonsData || []);
        setCompleted(progressCompleted);
        setLoading(false);
      }
    };

    fetchLesson();
    return () => { cancelled = true; };
  }, [lessonId]);

  const markComplete = async () => {
    if (!lesson) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Please login to save your progress.");
      return;
    }

    const { data: existing, error: existingError } = await supabase
      .from("lesson_progress")
      .select("id")
      .eq("lesson_id", lesson.id)
      .eq("user_id", user.id)
      .limit(1);

    if (existingError) {
      console.error("Existing progress error:", existingError);
      return;
    }

    if (existing?.length) {
      const { error } = await supabase
        .from("lesson_progress")
        .update({ completed: true, completed_at: new Date().toISOString() })
        .eq("id", existing[0].id);
      if (error) {
        console.error("Progress update error:", error);
        return;
      }
    } else {
      const { error } = await supabase.from("lesson_progress").insert({
        lesson_id: lesson.id,
        user_id: user.id,
        completed: true,
        completed_at: new Date().toISOString(),
      });
      if (error) {
        console.error("Progress insert error:", error);
        return;
      }
    }
    setCompleted(true);
  };

  const currentIndex = allLessons.findIndex((item) => item.id === lesson?.id);
  const totalLessons = allLessons.length;
  const currentLessonNumber = currentIndex >= 0 ? currentIndex + 1 : 1;
  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  const content = lessonContent || {};

  /*
     Group content by learning flow instead of by individual database fields.
     A lesson should normally contain 3-5 internal pages, not 10-15.
     These are UI pages only; progress still belongs to the same lesson_id.
  */
  const pages = useMemo(() => {
    const parts = [
      {
        key: "understand",
        title: "Understand",
        subtitle: "What is this and why do you need it?",
        nodes: [
          content.why_learn && (
            <Section kicker="WHY THIS MATTERS" title="Why This Matters">
              <ListBlock value={content.why_learn} />
            </Section>
          ),
          content.learning_objectives && (
            <Section kicker="LEARNING GOALS" title="What You Will Be Able To Do">
              <ListBlock value={content.learning_objectives} />
            </Section>
          ),
          content.theory && (
            <Section kicker="UNDERSTAND" title="Core Idea">
              <ValueBlock value={content.theory} />
            </Section>
          ),
          content.understand && (
            <Section
              kicker="UNDERSTAND"
              title={text(content.understand.title) || "Core Idea"}
            >
              <ValueBlock value={content.understand} />
            </Section>
          ),
          content.operator_connection && (
            <Section
              kicker="CONNECT THE CONCEPTS"
              title={text(content.operator_connection.title) || "From Operators to Decisions"}
            >
              <ValueBlock value={content.operator_connection} />
            </Section>
          ),
          <RealWorldSection key="real-world" content={content} />
        ].filter(Boolean)
      },

      {
        key: "learn",
        title: "Learn",
        subtitle: "How does the concept work?",
        nodes: [
          content.conditional_types && (
            <Section kicker="CONDITIONAL TYPES" title="Major Conditional Statements">
              <ValueBlock value={content.conditional_types} />
            </Section>
          ),
          content.important_concepts && (
            <Section kicker="IMPORTANT CONCEPTS" title="Remember These Points">
              <ListBlock value={content.important_concepts} />
            </Section>
          ),
          content.operator_categories && (
            <Section kicker="OPERATOR TYPES" title="Major Categories of Operators">
              <ValueBlock value={content.operator_categories} />
            </Section>
          ),
          content.boundary_values && (
            <Section
              kicker="IMPORTANT"
              title={text(content.boundary_values.title) || "Boundary Values"}
            >
              <ValueBlock value={content.boundary_values} />
            </Section>
          ),
          <ExampleSection key="examples" content={content} />
        ].filter(Boolean)
      },

      {
        key: "practice",
        title: "Practice",
        subtitle: "Can you predict, practice and debug it?",
        nodes: [
          <ThinkSection key="think" content={content} />,
          <PracticeSection key="practice" content={content} />,
          <DebuggingSection key="debugging" content={content} />
        ].filter(Boolean)
      },

      {
        key: "challenge",
        title: "Challenge",
        subtitle: "Can you solve a problem using what you learned?",
        nodes: [
          <ChallengeSection key="challenge" content={content} />,
          <ProgrammerMindset key="mindset" content={content} />,
          <AiMentorSection key="mentor" content={content} />
        ].filter(Boolean)
      },

      {
        key: "build",
        title: "Build & Review",
        subtitle: "Build something, review the concept and move forward.",
        nodes: [
          <InterviewSection key="interview" content={content} />,
          <MiniProjectSection key="project" content={content} />,
          <LegacySections key="legacy" content={content} />,
          <GenericExtraSections key="extra" content={content} />
        ].filter(Boolean)
      }
    ];

    // Short lessons can naturally have fewer than five parts.
    return parts.filter((part) => part.nodes.length > 0);
  }, [content]);


  if (loading) {
    return <div className="lesson-page"><div className="lesson-container"><h2>Loading lesson...</h2></div></div>;
  }

  if (!lesson) {
    return <div className="lesson-page"><div className="lesson-container"><h2>Lesson not found.</h2></div></div>;
  }

  const totalPages = Math.max(pages.length, 1);
  const safePage = Math.min(page, totalPages - 1);
  const currentPage = pages[safePage];

  const goNextPage = () => {
    if (safePage < totalPages - 1) setPage((p) => p + 1);
    else if (nextLesson) navigate(`/lesson/${nextLesson.id}`);
  };

  const goPreviousPage = () => {
    if (safePage > 0) setPage((p) => p - 1);
    else if (previousLesson) navigate(`/lesson/${previousLesson.id}`);
  };

  return (
    <div className="lesson-page">
      <div className="lesson-container">
        <button className="lesson-back-button" onClick={() => navigate(-1)}>← Back</button>

        <div className="lesson-progress-header">
          <span>Lesson {currentLessonNumber} of {totalLessons}</span>
          <span>{lesson.difficulty}</span>
        </div>

        <div className="lesson-progress-bar">
          <div className="lesson-progress-fill" style={{ width: `${totalLessons ? (currentLessonNumber / totalLessons) * 100 : 0}%` }} />
        </div>

        <header className="lesson-header">
          <p className="lesson-label">LESSON {currentLessonNumber}</p>
          <h1>{text(content.title) || text(lesson.lesson_title)}</h1>
          <p className="lesson-intro">
            {text(content.intro || content.description) || "Start learning C programming from the fundamentals."}
          </p>
          <div className="lesson-meta">
            <span>Difficulty: {text(lesson.difficulty)}</span>
            <span>Duration: {text(content.duration) || text(lesson.estimated_duration)}</span>
          </div>
        </header>

        <div className="lesson-part-indicator">
          <strong>
            Part {safePage + 1} of {totalPages}
          </strong>
          {currentPage?.title && <span> · {currentPage.title}</span>}
          {currentPage?.subtitle && (
            <small>{currentPage.subtitle}</small>
          )}
        </div>

        <main className="lesson-content-page">
          {currentPage?.nodes || <p>No lesson content available.</p>}
        </main>

        <div className="lesson-navigation">
          <button onClick={goPreviousPage} disabled={safePage === 0 && !previousLesson}>← Previous</button>
          <span>Part {safePage + 1} / {totalPages}</span>
          <button onClick={goNextPage} disabled={safePage === totalPages - 1 && !nextLesson}>Next →</button>
        </div>

        {safePage === totalPages - 1 && (
          <div className="lesson-complete-area">
            {completed ? (
              <button disabled className="completed-button">✅ Lesson Completed</button>
            ) : (
              <button onClick={markComplete} className="complete-button">Mark Lesson as Complete</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default LessonPage;