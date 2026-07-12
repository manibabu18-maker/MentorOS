import { supabase } from "../supabaseClient";
import { generateLessonContent } from "../utils/generateLessonContent";
export async function getSavedLesson(userId, lessonId) {
  const { data, error } = await supabase
    .from("lesson_content")
    .select("ai_content")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (error) {
    console.log(error);
    return null;
  }

  return data?.ai_content || null;
}
export async function saveLesson(
  userId,
  lessonId,
  lessonContent
) {
  const { error } = await supabase
    .from("lesson_content")
    .insert({
      user_id: userId,
      lesson_id: lessonId,
      ai_content: lessonContent,
    });

  if (error) {
    console.log(error);
  }
}
export async function generateAILesson(profile, lesson) {
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

  if (error || data?.error) {
    return null;
  }

  return data.lesson;
}
export function generateFallbackLesson(lesson, profile) {
  const fallbackSections = generateLessonContent(
    lesson,
    profile
  );

  return {
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
      `Visualize the working of ${lesson.topic}.`,

    practicalExample:
      fallbackSections.find(
        (section) => section.type === "practical"
      )?.content ||
      `Observe a real engineering application of ${lesson.topic}.`,

    practiceTask:
      fallbackSections.find(
        (section) => section.type === "practice"
      )?.content ||
      `Write three important points about ${lesson.topic}.`,

    quiz: [
      {
        question: `Why is ${lesson.topic} important in ${profile.subject}?`,
        answer: `It is a fundamental topic required to understand advanced concepts.`,
      },
    ],
  };
}