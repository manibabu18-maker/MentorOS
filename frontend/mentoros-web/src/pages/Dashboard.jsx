import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const handleLogout = async () => {
  await supabase.auth.signOut();
  navigate("/login");
};
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      console.log("Dashboard User:", user);
      console.log("Dashboard Error:", error);

      if (!user) {
        navigate("/login");
        return;
      }

      setUser(user);
      setLoading(false);
    };

    checkUser();
  }, [navigate]);

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

      <p>Start your personalized learning journey.</p>
      <button onClick={handleLogout}>
  Logout
</button>
    </section>
  );
}

export default Dashboard;