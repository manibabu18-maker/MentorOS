import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { generateLessonContent } from "../utils/generateLessonContent";

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

      const { data, error } = await supabase
        .from("learning_paths")
        .select("*")
        .eq("id", dayId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.log(error);
      }

      if (!data) {
        navigate("/dashboard");
        return;
      }

      const { data: profileData, error: profileError } =
        await supabase
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

      setProfile(profileData);
      setLesson(data);
      setLoading(false);
    };

    loadLesson();
  }, [dayId, navigate]);

  const handleGenerateLesson = async () => {
    setAiLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "generate-lesson",
        {
          body: {
            subject: profile.subject,
            level: profile.level,
            learningPreference: profile.learning_preference,
            dailyTime: profile.daily_time,
            careerGoal: profile.goal,
            lessonTopic: lesson.topic,
          },
        }
      );

      if (!error && !data?.error && data?.lesson) {
        setAiLesson(data.lesson);
        return;
      }

      console.log(
        "Live AI unavailable. Using MentorOS lesson engine."
      );

      const fallbackSections = generateLessonContent(
        lesson,
        profile
      );

      const fallbackLesson = {
        title: lesson.topic,

        simpleExplanation:
          fallbackSections.find(
            (section) => section.type === "explanation"
          )?.content || lesson.description,

        keyPoints: [
          `Understand the fundamentals of ${lesson.topic}.`,
          `Connect ${lesson.topic} with ${profile.subject}.`,
          `Apply the concept toward your goal: ${profile.goal}.`,
        ],

        visualExplanation:
          fallbackSections.find(
            (section) => section.type === "visual"
          )?.content ||
          `Visualize the input, processing, and output flow of ${lesson.topic}.`,

        practicalExample:
          fallbackSections.find(
            (section) => section.type === "practical"
          )?.content ||
          `Observe how ${lesson.topic} is applied in a real engineering system.`,

        practiceTask:
          fallbackSections.find(
            (section) => section.type === "practice"
          )?.content ||
          `Write three important points about ${lesson.topic}.`,

        quiz: [
          {
            question: `Why is ${lesson.topic} important in ${profile.subject}?`,
            answer: `It helps build the fundamental knowledge required to understand and apply ${profile.subject} concepts.`,
          },
        ],
      };

      setAiLesson(fallbackLesson);
    } catch (error) {
      console.log(error);

      const fallbackSections = generateLessonContent(
        lesson,
        profile
      );

      setAiLesson({
        title: lesson.topic,

        simpleExplanation:
          fallbackSections.find(
            (section) => section.type === "explanation"
          )?.content || lesson.description,

        keyPoints: [
          `Learn the core concepts of ${lesson.topic}.`,
          `Understand its role in ${profile.subject}.`,
          `Practice the concept with a simple engineering example.`,
        ],

        visualExplanation:
          fallbackSections.find(
            (section) => section.type === "visual"
          )?.content ||
          `Create a simple flow diagram for ${lesson.topic}.`,

        practicalExample:
          fallbackSections.find(
            (section) => section.type === "practical"
          )?.content ||
          `Identify a practical application of ${lesson.topic}.`,

        practiceTask:
          fallbackSections.find(
            (section) => section.type === "practice"
          )?.content ||
          `Write three key points about ${lesson.topic}.`,

        quiz: [
          {
            question: `What did you understand about ${lesson.topic}?`,
            answer:
              "Explain the core concept using your own words.",
          },
        ],
      });
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

            <h3>Simple Explanation</h3>
            <p>{aiLesson.simpleExplanation}</p>

            <h3>Key Points</h3>

            <ul>
              {aiLesson.keyPoints?.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>

            <h3>Visual Explanation</h3>
            <p>{aiLesson.visualExplanation}</p>

            <h3>Practical Example</h3>
            <p>{aiLesson.practicalExample}</p>

            <h3>Practice Task</h3>
            <p>{aiLesson.practiceTask}</p>

            <h3>Quick Quiz</h3>

            {aiLesson.quiz?.map((item, index) => (
              <div key={index}>
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