import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

function Lesson() {
  const [lesson, setLesson] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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
      const { data: profileData, error: profileError } = await supabase
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
        <button onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    </section>
  );
}

export default Lesson;