import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

/* =========================================================
   MentorOS Lesson Renderer
   ---------------------------------------------------------
   The database remains the source of truth. This file only
   decides how known lesson fields are presented to students.
   Unknown fields never become a new page and are not dumped
   as raw JSON labels.
========================================================= */

const text = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return "";
};

const hasValue = (value) => value !== null && value !== undefined && value !== "";
const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const safeArray = (value) => Array.isArray(value) ? value : (hasValue(value) ? [value] : []);

const formatText = (value) => text(value)
  .replace(/\\\\n/g, "\\n")
  .replace(/\\n/g, "\n")
  .replace(/\\"/g, '"');

const formatCode = (value) => {
  if (!hasValue(value)) return "";
  let code = String(value).replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\\"/g, '"');
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

function CodeBlock({ value, output = false }) {
  if (!hasValue(value)) return null;
  return (
    <pre className={output ? "output-block" : "code-block"}>
      <code>{output ? formatOutput(value) : formatCode(value)}</code>
    </pre>
  );
}

function BulletList({ value }) {
  const items = safeArray(value).filter((item) => hasValue(item));
  if (!items.length) return null;
  return (
    <ul className="clean-list">
      {items.map((item, index) => (
        <li key={index}>{isObject(item) ? <ObjectSummary value={item} /> : text(item)}</li>
      ))}
    </ul>
  );
}

function Checklist({ value }) {
  const items = safeArray(value).filter((item) => hasValue(item));
  if (!items.length) return null;
  return (
    <div className="check-list">
      {items.map((item, index) => (
        <div className="check-item" key={index}>
          <span aria-hidden="true">✓</span>
          <div>{isObject(item) ? <ObjectSummary value={item} /> : text(item)}</div>
        </div>
      ))}
    </div>
  );
}

function ObjectSummary({ value }) {
  if (!isObject(value)) return <>{text(value)}</>;
  const preferred = ["title", "name", "area", "mistake", "description", "explanation", "example", "task", "problem"];
  const entries = preferred
    .filter((key) => hasValue(value[key]))
    .map((key) => [key, value[key]]);

  if (!entries.length) return <>{JSON.stringify(value)}</>;

  return (
    <div className="object-summary">
      {entries.map(([key, item]) => (
        <p key={key}>
          {key !== "description" && key !== "explanation" && key !== "example" && key !== "task" && key !== "problem" && (
            <strong>{key.replace(/_/g, " ")}: </strong>
          )}
          {isObject(item) ? <ObjectSummary value={item} /> : Array.isArray(item) ? <BulletList value={item} /> : text(item)}
        </p>
      ))}
    </div>
  );
}

function ConceptCards({ value }) {
  if (!hasValue(value)) return null;
  const cards = [];

  if (Array.isArray(value)) {
    value.forEach((item) => cards.push(item));
  } else if (isObject(value)) {
    Object.entries(value).forEach(([key, item]) => {
      if (hasValue(item)) cards.push({ title: key.replace(/_/g, " "), value: item });
    });
  } else {
    return <p>{text(value)}</p>;
  }

  return (
    <div className="concept-grid">
      {cards.map((item, index) => {
        if (!isObject(item) || !hasValue(item.value)) {
          return (
            <article className="concept-card" key={index}>
              {isObject(item) ? <ObjectSummary value={item} /> : <p>{text(item)}</p>}
            </article>
          );
        }

        return (
          <article className="concept-card" key={index}>
            <h3>{text(item.title).replace(/\b\w/g, (c) => c.toUpperCase())}</h3>
            {Array.isArray(item.value) ? <BulletList value={item.value} /> : isObject(item.value) ? <ObjectSummary value={item.value} /> : <p>{text(item.value)}</p>}
          </article>
        );
      })}
    </div>
  );
}

function StartHereSection({ data }) {
  if (!isObject(data)) return null;
  return (
    <Section kicker="START HERE" title={text(data.title) || "Before Learning C"}>
      {hasValue(data.explanation) && <p>{text(data.explanation)}</p>}
      {isObject(data.example) && (
        <div className="analogy-card">
          {hasValue(data.example.problem) && <h3>{text(data.example.problem)}</h3>}
          <BulletList value={data.example.steps} />
        </div>
      )}
      {hasValue(data.key_idea) && <div className="key-idea"><strong>Key idea:</strong> {text(data.key_idea)}</div>}
    </Section>
  );
}

function WhatIsCSection({ data }) {
  if (!isObject(data)) return null;
  return (
    <Section kicker="UNDERSTAND" title={text(data.title) || "What Is C?"}>
      {hasValue(data.explanation) && <p className="lead-text">{text(data.explanation)}</p>}
      {hasValue(data.important_idea) && <div className="key-idea"><strong>Important idea:</strong> {text(data.important_idea)}</div>}
      {hasValue(data.importantIdea) && <div className="key-idea"><strong>Important idea:</strong> {text(data.importantIdea)}</div>}
    </Section>
  );
}

function RealWorldSection({ content }) {
  const source = content.where_c_is_used || content.real_world_connection || content.real_world_examples || content.real_world_applications;
  if (!hasValue(source)) return null;

  let title = "Where Is C Used?";
  let items = source;

  if (isObject(source)) {
    title = text(source.title) || title;
    items = source.applications || source.items || source.examples || source;
  }

  if (isObject(items) && !Array.isArray(items)) {
    items = Object.entries(items).map(([key, value]) => ({ title: key.replace(/_/g, " "), value }));
  }

  return (
    <Section kicker="REAL-WORLD CONNECTION" title={title}>
      <div className="concept-grid">
        {safeArray(items).map((item, index) => {
          if (!isObject(item)) return <article className="concept-card" key={index}><p>{text(item)}</p></article>;
          const heading = text(item.title) || text(item.area) || text(item.name) || `Application ${index + 1}`;
          const body = item.example || item.description || item.value || item.examples;
          return (
            <article className="concept-card" key={index}>
              <h3>{heading}</h3>
              {Array.isArray(body) ? <BulletList value={body} /> : isObject(body) ? <ObjectSummary value={body} /> : <p>{text(body)}</p>}
            </article>
          );
        })}
      </div>
    </Section>
  );
}

function ProgramFlowSection({ data }) {
  if (!hasValue(data)) return null;
  const steps = isObject(data) ? (data.steps || data.flow || data.process) : data;
  if (!Array.isArray(steps)) return <ConceptCards value={data} />;

  return (
    <Section kicker="PROGRAM FLOW" title="How a C Program Works">
      <div className="flow-list">
        {steps.map((step, index) => (
          <div className="flow-item" key={index}>
            <span>{index + 1}</span>
            <p>{isObject(step) ? <ObjectSummary value={step} /> : text(step)}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function ExampleCard({ example, index }) {
  if (!isObject(example)) return <article className="example-card" key={index}><p>{text(example)}</p></article>;
  return (
    <article className="example-card" key={index}>
      <div className="example-heading">
        <span className="example-number">Example {index + 1}</span>
        <h3>{text(example.title) || "C Program"}</h3>
      </div>
      {hasValue(example.purpose) && <p className="example-purpose">{text(example.purpose)}</p>}
      {hasValue(example.description) && <p>{text(example.description)}</p>}
      {hasValue(example.code) && <CodeBlock value={example.code} />}
      {hasValue(example.output) && (
        <div className="output-area">
          <h4>Output</h4>
          <CodeBlock value={example.output} output />
        </div>
      )}
      {hasValue(example.explanation) && <div className="explanation-box"><strong>Why it works</strong><p>{isObject(example.explanation) ? <ObjectSummary value={example.explanation} /> : text(example.explanation)}</p></div>}
      {hasValue(example.key_concept) && <div className="key-idea"><strong>Key concept:</strong> {text(example.key_concept)}</div>}
    </article>
  );
}

function ExampleSection({ content }) {
  if (!Array.isArray(content.examples) || !content.examples.length) return null;
  return (
    <Section kicker="LEARN BY EXAMPLE" title="Examples">
      <div className="example-stack">
        {content.examples.map((example, index) => <ExampleCard example={example} index={index} key={index} />)}
      </div>
    </Section>
  );
}

function ThinkSection({ content }) {
  const data = content.think_before_you_run || content.output_prediction;
  if (!isObject(data)) return null;
  return (
    <Section kicker="THINK BEFORE YOU RUN" title={text(data.title) || "Think Before You Run"}>
      {hasValue(data.code) && <CodeBlock value={data.code} />}
      {hasValue(data.question) && <p>{text(data.question)}</p>}
      {hasValue(data.task) && <p>{text(data.task)}</p>}
      <details className="interactive-box">
        <summary>Show expected output</summary>
        {hasValue(data.expected_output) && <CodeBlock value={data.expected_output} output />}
        {hasValue(data.explanation) && <p>{isObject(data.explanation) ? <ObjectSummary value={data.explanation} /> : text(data.explanation)}</p>}
      </details>
    </Section>
  );
}

function HintDetails({ hints, labelText = "Need a hint?" }) {
  const items = safeArray(hints).filter((item) => hasValue(item));
  if (!items.length) return null;
  return (
    <details className="interactive-box hint-box">
      <summary>{labelText}</summary>
      <div className="hint-list">
        {items.map((hint, index) => (
          <div className="hint-item" key={index}>
            <span>💡</span>
            <p>{isObject(hint) ? <ObjectSummary value={hint} /> : text(hint)}</p>
          </div>
        ))}
      </div>
    </details>
  );
}

function PracticeSection({ content }) {
  const practices = content.guided_practice;
  if (!Array.isArray(practices) || !practices.length) return null;
  return (
    <Section kicker="YOUR TURN" title="Guided Practice">
      <div className="practice-grid">
        {practices.map((practice, index) => (
          <article className="practice-card" key={index}>
            <span className="activity-label">Practice {index + 1}</span>
            <h3>{text(practice?.title) || `Practice ${index + 1}`}</h3>
            {hasValue(practice?.task) && <p>{text(practice.task)}</p>}
            {hasValue(practice?.hint) && <div className="small-hint"><span>💡</span>{text(practice.hint)}</div>}
            <HintDetails hints={practice?.hints} />
          </article>
        ))}
      </div>
    </Section>
  );
}

function DebuggingSection({ content }) {
  const data = content.debugging || content.debugging_task || content.debugging_activity;
  if (!isObject(data)) return null;
  return (
    <Section kicker="DEBUGGING" title={text(data.title) || "Find the Error"}>
      {hasValue(data.description) && <p>{text(data.description)}</p>}
      {hasValue(data.code) && <CodeBlock value={data.code} />}
      {hasValue(data.question) && <p>{text(data.question)}</p>}
      {hasValue(data.task) && <p>{text(data.task)}</p>}
      <HintDetails hints={data.hints} labelText="Need a debugging hint?" />
      {hasValue(data.hint_1) && <div className="small-hint"><span>💡</span>{text(data.hint_1)}</div>}
      {hasValue(data.solution_explanation) && <div className="explanation-box"><strong>Explanation</strong><p>{text(data.solution_explanation)}</p></div>}
      {hasValue(data.learning_goal) && <div className="key-idea"><strong>Goal:</strong> {text(data.learning_goal)}</div>}
    </Section>
  );
}

function RequirementList({ title, value, numbered = false }) {
  const items = safeArray(value).filter((item) => hasValue(item));
  if (!items.length) return null;
  return (
    <div className="requirement-block">
      {title && <h3>{title}</h3>}
      {numbered ? (
        <div className="step-list">
          {items.map((item, index) => <div className="step-row" key={index}><span>{index + 1}</span><p>{isObject(item) ? <ObjectSummary value={item} /> : text(item)}</p></div>)}
        </div>
      ) : <Checklist value={items} />}
    </div>
  );
}

function ChallengeSection({ content }) {
  const data = content.challenge;
  if (!isObject(data)) return null;
  return (
    <Section kicker="CHALLENGE" title={text(data.title) || "Challenge"}>
      {hasValue(data.description) && <p className="lead-text">{text(data.description)}</p>}
      {hasValue(data.task) && <p>{text(data.task)}</p>}
      <RequirementList title="Requirements" value={data.requirements} />
      <RequirementList title="Rules" value={data.rules} />
      <HintDetails hints={data.hints || data.hint_levels} />
      {hasValue(data.expected_format) && (
        <div className="format-box"><h3>Expected Format</h3><CodeBlock value={data.expected_format} output /></div>
      )}
    </Section>
  );
}

function CommonMistakesSection({ content }) {
  const mistakes = safeArray(content.common_mistakes).filter((item) => hasValue(item));
  if (!mistakes.length) return null;
  return (
    <Section kicker="COMMON MISTAKES" title="Watch Out For These Errors">
      <div className="mistake-grid">
        {mistakes.map((item, index) => (
          <article className="mistake-card" key={index}>
            {isObject(item) ? (
              <>
                <h3>{text(item.mistake) || text(item.title) || `Common mistake ${index + 1}`}</h3>
                {hasValue(item.explanation) && <p>{isObject(item.explanation) ? <ObjectSummary value={item.explanation} /> : text(item.explanation)}</p>}
                {hasValue(item.example) && <div className="small-example"><strong>Example:</strong><p>{isObject(item.example) ? <ObjectSummary value={item.example} /> : text(item.example)}</p></div>}
              </>
            ) : <p>{text(item)}</p>}
          </article>
        ))}
      </div>
    </Section>
  );
}

function ProgrammerMindset({ content }) {
  const data = content.programmer_mindset || content.think_like_a_programmer;
  if (!isObject(data)) return null;
  const steps = data.steps || data.thinking_process;
  return (
    <Section kicker="PROGRAMMER MINDSET" title={text(data.title) || "Break the Problem Into Smaller Parts"}>
      {hasValue(data.problem) && <p><strong>Problem:</strong> {text(data.problem)}</p>}
      {Array.isArray(steps) && (
        <div className="step-list">
          {steps.map((step, index) => <div className="step-row" key={index}><span>{index + 1}</span><p>{isObject(step) ? <ObjectSummary value={step} /> : text(step)}</p></div>)}
        </div>
      )}
      {hasValue(data.skill) && <div className="key-idea"><strong>Skill:</strong> {text(data.skill)}</div>}
    </Section>
  );
}

function AiMentorSection({ content }) {
  const data = content.ai_mentor;
  if (!isObject(data)) return null;
  const interaction = data.example_interaction;
  return (
    <Section kicker="AI MENTOR" title="Learn With Your AI Mentor">
      {hasValue(data.description) && <p>{text(data.description)}</p>}
      {Array.isArray(data.hint_levels) && (
        <div className="mentor-levels">
          {data.hint_levels.map((level, index) => (
            <details className="mentor-level" key={index}>
              <summary>Hint {index + 1}</summary>
              <p>{isObject(level) ? <ObjectSummary value={level} /> : text(level)}</p>
            </details>
          ))}
        </div>
      )}
      {isObject(interaction) && (
        <div className="mentor-example">
          {Object.entries(interaction).map(([key, value]) => (
            <p key={key}><strong>{key.replace(/_/g, " ")}:</strong> {isObject(value) ? <ObjectSummary value={value} /> : text(value)}</p>
          ))}
        </div>
      )}
      {Array.isArray(data.rules) && <Checklist value={data.rules} />}
    </Section>
  );
}

function MiniProjectSection({ content }) {
  const p = content.mini_project;
  if (!isObject(p)) return null;
  return (
    <Section kicker="BUILD SOMETHING" title={`🛠️ ${text(p.title) || "Mini Project"}`}>
      {(p.description || p.problem) && <p className="lead-text">{text(p.description || p.problem)}</p>}
      {hasValue(p.real_world_connection) && <div className="key-idea"><strong>Real-world connection:</strong> {text(p.real_world_connection)}</div>}
      <RequirementList title="Requirements" value={p.requirements} />
      <RequirementList title="Skills You Practice" value={p.skills || p.skills_learned} />
      <RequirementList title="Grade Rules" value={p.grade_rules} />
      <RequirementList title="Testing" value={p.testing} />
      {p.suggested_data && <div className="data-card"><h3>Suggested Data</h3><ObjectSummary value={p.suggested_data} /></div>}
      {hasValue(p.expected_output) && <div className="format-box"><h3>Expected Output</h3><CodeBlock value={p.expected_output} output /></div>}
      <HintDetails hints={p.hints} />
      {hasValue(p.extension) && <p><strong>Try more:</strong> {text(p.extension)}</p>}
      {hasValue(p.next_topic_connection) && <div className="key-idea"><strong>Next lesson:</strong> {text(p.next_topic_connection)}</div>}
    </Section>
  );
}

function InterviewSection({ content }) {
  const questions = safeArray(content.interview_questions).filter((q) => hasValue(q));
  if (!questions.length) return null;
  return (
    <Section kicker="INTERVIEW PREPARATION" title="Interview Questions">
      <div className="question-list">
        {questions.map((question, index) => (
          <article className="question-card" key={index}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <p>{isObject(question) ? <ObjectSummary value={question} /> : text(question)}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}

function PracticalLab({ content }) {
  const data = content.compiler_activity;
  if (!isObject(data)) return null;
  return (
    <Section kicker="PRACTICAL LAB" title={text(data.title) || "Try It Yourself"}>
      {hasValue(data.description) && <p>{text(data.description)}</p>}
      <RequirementList title="Workflow" value={data.workflow} numbered />
    </Section>
  );
}

function LessonCheck({ content }) {
  const data = content.lesson_completion;
  if (!isObject(data)) return null;
  return (
    <Section kicker="LESSON CHECK" title="Before You Complete This Lesson">
      <Checklist value={data.requirements} />
      {hasValue(data.completion_message) && <p className="completion-message">{text(data.completion_message)}</p>}
    </Section>
  );
}

function NextTopic({ content }) {
  if (!hasValue(content.next_topic)) return null;
  const value = isObject(content.next_topic) ? (content.next_topic.title || content.next_topic.topic || content.next_topic.description) : content.next_topic;
  return <Section kicker="NEXT STEP" title="What Comes Next?"><p className="next-topic-card">{text(value)}</p></Section>;
}

function PartOutcome({ partKey }) {
  const outcomes = {
    understand: "You should be able to explain the concept, why it matters, and where it is used.",
    learn: "You should be able to recognize the main syntax and explain the examples.",
    practice: "You should be able to predict output, write a small program, and debug a basic mistake.",
    challenge: "You should be able to combine the concepts to solve a programming problem.",
    build: "You should be able to build, test, and explain a small program."
  };
  return <div className="part-outcome"><strong>After this part</strong><p>{outcomes[partKey]}</p></div>;
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

  const pages = useMemo(() => {
    const parts = [];

    parts.push({
      key: "understand",
      title: "Understand",
      subtitle: "What is this and why do you need it?",
      nodes: [
        content.why_learn && <Section key="why" kicker="WHY THIS MATTERS" title="Why This Matters"><Checklist value={content.why_learn} /></Section>,
        content.learning_objectives && <Section key="goals" kicker="LEARNING GOALS" title="What You Will Be Able To Do"><Checklist value={content.learning_objectives} /></Section>,
        content.start_here && <StartHereSection key="start" data={content.start_here} />,
        content.what_is_c && <WhatIsCSection key="what" data={content.what_is_c} />,
        content.theory && !content.what_is_c && <Section key="theory" kicker="UNDERSTAND" title="Core Idea"><ObjectSummary value={content.theory} /></Section>,
        content.understand && <Section key="understand" kicker="UNDERSTAND" title={text(content.understand.title) || "Core Idea"}><ObjectSummary value={content.understand} /></Section>,
        content.operator_connection && <Section key="connection" kicker="CONNECT THE CONCEPTS" title={text(content.operator_connection.title) || "Connect the Concepts"}><ObjectSummary value={content.operator_connection} /></Section>,
        <RealWorldSection key="real-world" content={content} />
      ].filter(Boolean)
    });

    parts.push({
      key: "learn",
      title: "Learn",
      subtitle: "How does the concept work?",
      nodes: [
        content.concepts && <Section key="concepts" kicker="CORE CONCEPTS" title="Understand the Building Blocks"><ConceptCards value={content.concepts} /></Section>,
        content.theory && content.what_is_c && <Section key="theory-learn" kicker="CORE IDEA" title="The Core Idea"><ObjectSummary value={content.theory} /></Section>,
        content.important_concepts && <Section key="important" kicker="IMPORTANT CONCEPTS" title="Remember These Points"><Checklist value={content.important_concepts} /></Section>,
        content.boundary_values && <Section key="boundary" kicker="IMPORTANT" title={text(content.boundary_values.title) || "Boundary Values"}><ConceptCards value={content.boundary_values} /></Section>,
        content.data_types && <Section key="types" kicker="CORE CONCEPT" title="Data Types"><ConceptCards value={content.data_types} /></Section>,
        content.declaration_and_initialization && <Section key="decl" kicker="CORE CONCEPT" title="Declaration and Initialization"><ConceptCards value={content.declaration_and_initialization} /></Section>,
        content.format_specifiers && <Section key="format" kicker="CORE CONCEPT" title="Format Specifiers"><ConceptCards value={content.format_specifiers} /></Section>,
        content.operator_categories && <Section key="ops" kicker="OPERATOR TYPES" title="Major Categories of Operators"><ConceptCards value={content.operator_categories} /></Section>,
        content.conditional_types && <Section key="conditions" kicker="CONDITIONAL TYPES" title="Major Conditional Statements"><ConceptCards value={content.conditional_types} /></Section>,
        content.program_execution && <ProgramFlowSection key="flow" data={content.program_execution} />,
        content.example_program && <Section key="example-program" kicker="LEARN BY EXAMPLE" title="Example Program"><ConceptCards value={content.example_program} /></Section>,
        content.micro_programs && <Section key="micro" kicker="LEARN BY EXAMPLE" title="Small Programs"><ConceptCards value={content.micro_programs} /></Section>,
        <ExampleSection key="examples" content={content} />
      ].filter(Boolean)
    });

    parts.push({
      key: "practice",
      title: "Practice",
      subtitle: "Predict, practice and debug.",
      nodes: [
        <ThinkSection key="think" content={content} />,
        <PracticeSection key="practice" content={content} />,
        <DebuggingSection key="debugging" content={content} />,
        content.compiler_activity && <PracticalLab key="lab" content={content} />
      ].filter(Boolean)
    });

    parts.push({
      key: "challenge",
      title: "Challenge",
      subtitle: "Can you solve a problem using what you learned?",
      nodes: [
        <ChallengeSection key="challenge" content={content} />,
        <CommonMistakesSection key="mistakes" content={content} />,
        <ProgrammerMindset key="mindset" content={content} />,
        <AiMentorSection key="mentor" content={content} />,
        content.unseen_challenge && <Section key="unseen" kicker="TEST YOUR UNDERSTANDING" title={text(content.unseen_challenge.title) || "Test Your Understanding"}><p>{text(content.unseen_challenge.task)}</p><RequirementList title="Requirements" value={content.unseen_challenge.requirements} /><RequirementList title="Rules" value={content.unseen_challenge.rules} /></Section>
      ].filter(Boolean)
    });

    parts.push({
      key: "build",
      title: "Build & Review",
      subtitle: "Build something, review the concept and move forward.",
      nodes: [
        <MiniProjectSection key="project" content={content} />,
        <InterviewSection key="interview" content={content} />,
        <LessonCheck key="check" content={content} />,
        content.build_now && <Section key="build-now" kicker="BUILD NOW" title={text(content.build_now.title) || "Build It Yourself"}><ObjectSummary value={content.build_now} /></Section>,
        <NextTopic key="next" content={content} />
      ].filter(Boolean)
    });

    return parts;
  }, [content]);

  if (loading) return <div className="lesson-page"><div className="lesson-container"><h2>Loading lesson...</h2></div></div>;
  if (!lesson) return <div className="lesson-page"><div className="lesson-container"><h2>Lesson not found.</h2></div></div>;

  const totalPages = 5;
  const safePage = Math.max(0, Math.min(page, totalPages - 1));
  const currentPage = pages[safePage];

  const goNextPage = () => {
    if (safePage < 4) setPage((p) => p + 1);
    else if (nextLesson) navigate(`/lesson/${nextLesson.id}`);
  };

  const goPreviousPage = () => {
    if (safePage > 0) setPage((p) => p - 1);
    else if (previousLesson) navigate(`/lesson/${previousLesson.id}`);
  };

  return (
    <div className="lesson-page">
      <style>{`
        .lesson-stage-nav { display:flex; flex-wrap:wrap; justify-content:center; gap:8px; margin:18px 0 24px; }
        .lesson-stage-button { display:inline-flex; align-items:center; gap:8px; padding:9px 13px; border:1px solid #e5e7eb; border-radius:12px; background:#fff; cursor:pointer; font:inherit; color:#374151; transition:.18s ease; }
        .lesson-stage-button:hover { border-color:#9ca3af; transform:translateY(-1px); }
        .lesson-stage-button.active { border-color:#2563eb; background:#eff6ff; color:#2563eb; font-weight:700; }
        .lesson-stage-number { display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; border-radius:50%; background:#f3f4f6; font-size:12px; font-weight:700; }
        .lesson-stage-button.active .lesson-stage-number { background:#2563eb; color:#fff; }
        .lesson-stage-header { display:flex; justify-content:space-between; align-items:flex-end; gap:16px; margin-top:18px; }
        .lesson-stage-title { display:flex; flex-direction:column; gap:4px; }
        .lesson-stage-title strong { font-size:20px; }
        .lesson-stage-title span { color:#6b7280; }
        .lesson-stage-count { color:#6b7280; font-size:14px; }
        .lesson-part-progress { height:4px; border-radius:999px; background:#eef2f7; overflow:hidden; margin:10px 0 22px; }
        .lesson-part-progress-fill { height:100%; background:#2563eb; border-radius:inherit; transition:width .2s ease; }
        .clean-list { margin:12px 0; padding-left:20px; }
        .clean-list li { margin:7px 0; }
        .check-list { display:grid; gap:9px; }
        .check-item { display:flex; gap:10px; align-items:flex-start; padding:10px 12px; border-radius:10px; background:#f8fafc; }
        .check-item > span { font-weight:800; color:#2563eb; }
        .concept-grid,.practice-grid,.mistake-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:14px; }
        .concept-card,.practice-card,.mistake-card,.question-card,.analogy-card,.data-card { border:1px solid #e5e7eb; border-radius:14px; padding:16px; background:#fff; }
        .concept-card h3,.practice-card h3,.mistake-card h3 { margin-top:0; text-transform:capitalize; }
        .analogy-card { background:#f8fafc; }
        .lead-text { font-size:17px; line-height:1.65; }
        .example-stack { display:grid; gap:18px; }
        .example-card { border:1px solid #e5e7eb; border-radius:16px; padding:18px; background:#fff; }
        .example-heading { display:flex; align-items:center; gap:10px; margin-bottom:8px; }
        .example-heading h3 { margin:0; }
        .example-number,.activity-label { font-size:12px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:.04em; }
        .example-purpose { color:#4b5563; }
        .code-block,.output-block { margin:12px 0; padding:16px; border-radius:12px; overflow:auto; font-size:14px; line-height:1.55; }
        .code-block { background:#111827; color:#f9fafb; }
        .output-block { background:#f3f4f6; color:#111827; }
        .output-area,.explanation-box,.format-box,.interactive-box,.small-example { margin-top:14px; padding:13px; border-radius:12px; background:#f8fafc; }
        .interactive-box { border:1px solid #e5e7eb; }
        .interactive-box summary { cursor:pointer; font-weight:700; }
        .hint-list { display:grid; gap:8px; margin-top:12px; }
        .hint-item { display:flex; gap:10px; align-items:flex-start; padding:9px 10px; background:#fff; border-radius:9px; }
        .small-hint { display:flex; gap:8px; margin-top:12px; padding:10px 12px; background:#eff6ff; border-radius:10px; }
        .step-list { display:grid; gap:10px; }
        .step-row { display:flex; gap:12px; align-items:flex-start; }
        .step-row > span { flex:0 0 28px; height:28px; display:flex; align-items:center; justify-content:center; border-radius:50%; background:#eff6ff; color:#2563eb; font-weight:700; }
        .step-row p { margin:3px 0 0; }
        .question-list { display:grid; gap:8px; }
        .question-card { display:flex; gap:12px; align-items:flex-start; }
        .question-card > span { color:#2563eb; font-weight:800; min-width:26px; }
        .question-card p { margin:0; }
        .mentor-levels { display:grid; gap:8px; }
        .mentor-level { padding:10px 12px; border:1px solid #e5e7eb; border-radius:10px; background:#fff; }
        .mentor-level summary { cursor:pointer; font-weight:700; }
        .part-outcome { margin-top:24px; padding:15px 16px; border-radius:14px; background:#f8fafc; border:1px solid #e5e7eb; }
        .part-outcome p { margin:5px 0 0; }
        .next-topic-card { padding:16px; border-radius:14px; background:#eff6ff; font-weight:700; }
        .lesson-page-navigation { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-top:30px; padding-top:18px; border-top:1px solid #e5e7eb; }
        .lesson-page-navigation span { text-align:center; color:#6b7280; font-size:14px; }
        @media(max-width:700px){ .lesson-stage-header,.lesson-page-navigation{flex-direction:column;align-items:stretch}.lesson-stage-count{text-align:left}.lesson-page-navigation button{width:100%}.lesson-stage-nav{justify-content:flex-start}.lesson-stage-button{flex:1 1 auto;justify-content:center} }
      `}</style>

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
          <p className="lesson-intro">{text(content.intro || content.description) || "Start learning C programming from the fundamentals."}</p>
          <div className="lesson-meta">
            <span>Difficulty: {text(lesson.difficulty)}</span>
            <span>Duration: {text(content.duration) || text(lesson.estimated_duration)}</span>
          </div>
        </header>

        <div className="lesson-stage-header">
          <div className="lesson-stage-title">
            <strong>{currentPage.title}</strong>
            <span>{currentPage.subtitle}</span>
          </div>
        </div>

        <nav className="lesson-stage-nav" aria-label="Lesson stages">
          {pages.map((part, index) => (
            <button
              key={part.key}
              type="button"
              className={`lesson-stage-button${index === safePage ? " active" : ""}`}
              aria-current={index === safePage ? "step" : undefined}
              onClick={() => setPage(index)}
            >
              <span className="lesson-stage-number">{index + 1}</span>
              <span>{part.title}</span>
            </button>
          ))}
        </nav>

        <div className="lesson-part-progress" aria-hidden="true">
          <div className="lesson-part-progress-fill" style={{ width: `${((safePage + 1) / 5) * 100}%` }} />
        </div>

        <main className="lesson-content-page">
          {currentPage.nodes}
          <PartOutcome partKey={currentPage.key} />
        </main>

        <div className="lesson-page-navigation">
          <button type="button" onClick={goPreviousPage} disabled={safePage === 0 && !previousLesson}>← Previous</button>
          <span>{currentPage.title}</span>
          <button type="button" onClick={goNextPage} disabled={safePage === 4 && !nextLesson}>{safePage === 4 && nextLesson ? "Next Lesson →" : "Next →"}</button>
        </div>

        {safePage === 4 && (
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
