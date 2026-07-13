import { supabase } from "../supabaseClient";

export async function getChatHistory(userId, lessonId) {
  const { data, error } = await supabase
    .from("lesson_chats")
    .select("*")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}
export async function saveChat(
  userId,
  lessonId,
  question,
  answer
) {
  const { error } = await supabase
    .from("lesson_chats")
    .insert({
      user_id: userId,
      lesson_id: lessonId,
      question,
      answer,
    });

  if (error) {
    console.error(error);
  }
}
export async function askMentor(
  profile,
  lesson,
  question
) {
  const { data, error } = await supabase.functions.invoke(
    "ask-mentor",
    {
      body: {
        subject: profile.subject,
        level: profile.level,
        careerGoal: profile.goal,
        lessonTopic: lesson.topic,
        question,
      },
    }
  );

  if (error || data?.error) {
    console.error(error || data.error);
    return null;
  }

  return data.answer;
}