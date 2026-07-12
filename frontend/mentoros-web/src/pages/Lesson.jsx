import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

import {
  getSavedLesson,
  saveLesson,
  generateAILesson,
  generateFallbackLesson,
} from "../services/lessonService";

function Lesson() {
  const [lesson, setLesson] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLesson, setAiLesson] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const navigate = useNavigate();
  const { dayId } = useParams();

  useEffect(() => {
    const loadLesson = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      const { data: lessonData, error: lessonError } = await supabase
        .from("learning_paths")
        .select("*")
        .eq("id", dayId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (lessonError) {
        console.log(lessonError);
      }

      if (!lessonData) {
        navigate("/dashboard");
        return;
      }

      const {
        data: profileData,
        error: profileError,
      } = await supabase
        .from("student_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) {
        console.log(profileError);
      }

      if (!profileData) {
        navigate("/onboarding");
        return;
      }

      setLesson(lessonData);
      setProfile(profileData);
      setLoading(false);
    };

    loadLesson();
  }, [dayId, navigate]);
    const handleGenerateLesson = async () => {
    setAiLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      // Step 1: Check if lesson already exists in database
      const savedLesson = await getSavedLesson(
        user.id,
        lesson.id
      );

      if (savedLesson) {
        console.log("Lesson loaded from database.");
        setAiLesson(savedLesson);
        return;
      }

      // Step 2: Generate AI lesson using Groq
      const generatedLesson = await generateAILesson(
        profile,
        lesson
      );

      if (generatedLesson) {
        await saveLesson(
          user.id,
          lesson.id,
          generatedLesson
        );

        setAiLesson(generatedLesson);
        return;
      }

      // Step 3: Use local fallback lesson
      const fallbackLesson =
        generateFallbackLesson(
          lesson,
          profile
        );

      await saveLesson(
        user.id,
        lesson.id,
        fallbackLesson
      );

      setAiLesson(fallbackLesson);

    } catch (error) {
      console.error(
        "Lesson Generation Error:",
        error
      );

      const emergencyLesson =
        generateFallbackLesson(
          lesson,
          profile
        );

      setAiLesson(emergencyLesson);

    } finally {
      setAiLoading(false);
    }
  };
    if (loading) {
    return <h2>Loading Lesson...</h2>;
  }

  return (
    <section className="lesson-page">
      <div className="lesson-card">

        <span>Day {lesson.day_number}</span>

        <h1>{lesson.topic}</h1>

        <p>{lesson.description}</p>

        <div className="learning-preference-box">
          <strong>Your Learning Style:</strong>{" "}
          {profile.learning_preference}
        </div>

        {!aiLesson && (
          <button
            className="generate-lesson-button"
            onClick={handleGenerateLesson}
            disabled={aiLoading}
          >
            {aiLoading
              ? "MentorOS AI is preparing your lesson..."
              : "Generate My AI Lesson"}
          </button>
        )}

        {aiLesson && (
          <div className="ai-lesson-content">

            <h2>{aiLesson.title}</h2>

            <h3>📖 Concept</h3>
            <p>{aiLesson.simpleExplanation}</p>

            <h3>🔑 Key Points</h3>

            <ul>
              {aiLesson.keyPoints?.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>

            <h3>🖼 Visual Explanation</h3>
            <p>{aiLesson.visualExplanation}</p>

            <h3>⚙ Practical Example</h3>
            <p>{aiLesson.practicalExample}</p>

            <h3>💻 Practice Task</h3>
            <p>{aiLesson.practiceTask}</p>

            <h3>🧠 Quick Quiz</h3>

            {aiLesson.quiz?.map((item, index) => (
              <div
                key={index}
                className="quiz-item"
              >
                <p>
                  <strong>Question:</strong>{" "}
                  {item.question}
                </p>

                <p>
                  <strong>Answer:</strong>{" "}
                  {item.answer}
                </p>
              </div>
            ))}

            {/* Future Features */}

            <hr />

            <h3>🚀 Coming Soon</h3>

            <ul>
              <li>🤖 Ask MentorOS AI</li>
              <li>🎥 Recommended Videos</li>
              <li>📚 Further Reading</li>
              <li>📝 Interview Questions</li>
              <li>📄 Download Notes (PDF)</li>
            </ul>

          </div>
        )}

        <button onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>

      </div>
    </section>
  );
}

export default Lesson;