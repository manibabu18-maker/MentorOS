import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [learningPath, setLearningPath] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboard = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      setUser(user);

      const { data: profileData, error } = await supabase
        .from("student_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.log(error);
      }

      if (!profileData) {
        navigate("/onboarding");
        return;
      }

      setProfile(profileData);

const { data: pathData, error: pathError } = await supabase
  .from("learning_paths")
  .select("*")
  .eq("user_id", user.id)
  .order("day_number", { ascending: true });

if (pathError) {
  console.log(pathError);
} else {
  setLearningPath(pathData);
}

setLoading(false);
    };

    loadDashboard();
  }, [navigate]);
  const handleComplete = async (dayId) => {
  const { error } = await supabase
    .from("learning_paths")
    .update({ status: "Completed" })
    .eq("id", dayId);

  if (error) {
    console.log(error);
    alert(error.message);
    return;
  }

  setLearningPath((currentPath) =>
    currentPath.map((day) =>
      day.id === dayId
        ? { ...day, status: "Completed" }
        : day
    )
  );
};
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) {
    return <h2>Loading Dashboard...</h2>;
  }

  return (
    <section className="dashboard-page">
      <h1>MentorOS Dashboard</h1>

      <h2>
        Welcome, {user.user_metadata?.name || "Student"}
      </h2>

      <p>{user.email}</p>

      <div className="student-profile-card">
        <h2>Your Learning Profile</h2>

        <p>
          <strong>Subject:</strong> {profile.subject}
        </p>

        <p>
          <strong>Current Level:</strong> {profile.level}
        </p>

        <p>
          <strong>Learning Preference:</strong>{" "}
          {profile.learning_preference}
        </p>

        <p>
          <strong>Daily Learning Time:</strong> {profile.daily_time}
        </p>

        <p>
          <strong>Career Goal:</strong> {profile.goal}
        </p>
      </div>
      <div className="learning-path-section">
  <h2>Your Personalized Learning Path</h2>

  <div className="learning-path-list">
    {learningPath.map((day) => (
      <div className="learning-day-card" key={day.id}>
        <span className="day-number">
          Day {day.day_number}
        </span>

        <h3>{day.topic}</h3>

        <p>{day.description}</p>

        <span className="learning-status">
          {day.status}
        </span>
        {day.status !== "Completed" && (
  <>
    {day.day_number === 1 ||
    learningPath.find(
      (previousDay) =>
        previousDay.day_number === day.day_number - 1
    )?.status === "Completed" ? (
      <button
        className="complete-button"
        onClick={() => handleComplete(day.id)}
      >
        Mark as Completed
      </button>
    ) : (
      <p className="locked-message">
        🔒 Complete Day {day.day_number - 1} to unlock
      </p>
    )}
  </>
)}
      </div>
    ))}
  </div>
</div>
      <button onClick={handleLogout}>Logout</button>
    </section>
  );
}

export default Dashboard;