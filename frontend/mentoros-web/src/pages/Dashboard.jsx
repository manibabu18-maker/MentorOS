import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

import ProgressBar from "../components/ProgressBar";
import "../styles/Dashboard.css";

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

      const { data: profileData } = await supabase
        .from("student_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profileData) {
        navigate("/onboarding");
        return;
      }

      setProfile(profileData);

      const { data: pathData } = await supabase
        .from("learning_paths")
        .select("*")
        .eq("user_id", user.id)
        .order("day_number", { ascending: true });

      setLearningPath(pathData || []);
      setLoading(false);
    };

    loadDashboard();
  }, [navigate]);

  const handleComplete = async (dayId) => {
    await supabase
      .from("learning_paths")
      .update({ status: "Completed" })
      .eq("id", dayId);

    setLearningPath((current) =>
      current.map((day) =>
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
    return (
      <section className="dashboard-loading">
        <h2>Loading Dashboard...</h2>
      </section>
    );
  }

  const completedDays = learningPath.filter(
    (day) => day.status === "Completed"
  ).length;

  const progress = learningPath.length
    ? Math.round((completedDays / learningPath.length) * 100)
    : 0;

  const nextLesson = learningPath.find(
    (day) => day.status !== "Completed"
  );

  return (
    <section className="dashboard-page">

      <div className="dashboard-hero">
        <div>
          <h1>
            Welcome back, {user.user_metadata?.name || "Student"} 👋
          </h1>

          <p>{user.email}</p>

          <span className="career-badge">
            {profile.goal}
          </span>
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <p>Subject</p>
          <h2>{profile.subject}</h2>
        </div>

        <div className="stat-card">
          <p>Completed</p>
          <h2>{completedDays}</h2>
        </div>

        <div className="stat-card">
          <p>Total Days</p>
          <h2>{learningPath.length}</h2>
        </div>

        <div className="stat-card">
          <p>Progress</p>
          <h2>{progress}%</h2>
        </div>
      </div>

      <div className="continue-card">
        <div className="continue-header">
          <h2>Continue Learning</h2>
          <span>{progress}% Complete</span>
        </div>

        {nextLesson ? (
          <>
            <h3>
              Day {nextLesson.day_number} • {nextLesson.topic}
            </h3>

            <p>{nextLesson.description}</p>

            <ProgressBar value={progress} />

            <button
              className="start-learning-button"
              onClick={() =>
                navigate(`/lesson/${nextLesson.id}`)
              }
            >
              Resume Learning →
            </button>
          </>
        ) : (
          <>
            <h3>🎉 Roadmap Completed</h3>
            <p>Congratulations! You completed your roadmap.</p>
          </>
        )}
      </div>

      <div className="profile-card">
        <h2>Learning Profile</h2>

        <div className="profile-grid">
          <div>
            <span>Level</span>
            <strong>{profile.level}</strong>
          </div>

          <div>
            <span>Preference</span>
            <strong>{profile.learning_preference}</strong>
          </div>

          <div>
            <span>Daily Time</span>
            <strong>{profile.daily_time}</strong>
          </div>

          <div>
            <span>Goal</span>
            <strong>{profile.goal}</strong>
          </div>
        </div>
      </div>

      <div className="learning-path-section">
        <h2>Your Personalized Learning Path</h2>

        <div className="learning-path-list">
          {learningPath.map((day) => {
            const unlocked =
              day.day_number === 1 ||
              learningPath.find(
                (prev) =>
                  prev.day_number === day.day_number - 1
              )?.status === "Completed";

            return (
              <div
                className="learning-day-card"
                key={day.id}
              >
                <div className="learning-day-top">
                  <span className="day-number">
                    Day {day.day_number}
                  </span>

                  <span
                    className={`learning-status ${
                      day.status === "Completed"
                        ? "completed"
                        : "pending"
                    }`}
                  >
                    {day.status}
                  </span>
                </div>

                <h3>{day.topic}</h3>

                <p>{day.description}</p>

                {unlocked ? (
                  <div className="learning-actions">
                    <button
                      className="start-learning-button"
                      onClick={() =>
                        navigate(`/lesson/${day.id}`)
                      }
                    >
                      Start Learning
                    </button>

                    {day.status !== "Completed" && (
                      <button
                        className="complete-button"
                        onClick={() =>
                          handleComplete(day.id)
                        }
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="locked-message">
                    🔒 Complete Day {day.day_number - 1} to unlock
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
}

export default Dashboard;