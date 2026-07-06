import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { generateLearningPath } from "../utils/generateLearningPath";
function Onboarding() {
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState("");
  const [learningPreference, setLearningPreference] = useState("");
  const [dailyTime, setDailyTime] = useState("");
  const [goal, setGoal] = useState("");
  const navigate = useNavigate();
  const handleOnboarding = async (event) => {
  event.preventDefault();

  if (
    subject === "" ||
    level === "" ||
    learningPreference === "" ||
    dailyTime === "" ||
    goal === ""
  ) {
    alert("Please fill all fields");
    return;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    navigate("/login");
    return;
  }

  const profileData = {
    user_id: user.id,
    subject: subject,
    level: level,
    learning_preference: learningPreference,
    daily_time: dailyTime,
    goal: goal,
  };

  const { error: profileError } = await supabase
    .from("student_profiles")
    .insert([profileData]);

  if (profileError) {
    console.log(profileError);
    alert(profileError.message);
    return;
  }

  const learningPath = generateLearningPath(profileData);

  const learningPathData = learningPath.map((day) => ({
    user_id: user.id,
    day_number: day.day_number,
    topic: day.topic,
    description: day.description,
    status: day.status,
  }));

  const { error: learningPathError } = await supabase
    .from("learning_paths")
    .insert(learningPathData);

  if (learningPathError) {
    console.log(learningPathError);
    alert(learningPathError.message);
    return;
  }

  alert("Your personalized learning path is ready!");

  navigate("/dashboard");
};

  return (
    <section className="onboarding-page">
      <div className="onboarding-card">
        <h1>Let's Personalize Your Learning</h1>

        <p>Help MentorOS understand your learning goals.</p>

        <form onSubmit={handleOnboarding}>
          <label>What do you want to learn?</label>

          <select
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
          >
            <option value="">Select Subject</option>
            <option value="VLSI">VLSI</option>
            <option value="Embedded Systems">Embedded Systems</option>
            <option value="Electrical Design">Electrical Design</option>
            <option value="Python">Python</option>
            <option value="AI & Machine Learning">
              AI & Machine Learning
            </option>
            <option value="Web Development">
              Web Development
            </option>
          </select>

          <label>What is your current level?</label>

          <select
            value={level}
            onChange={(event) => setLevel(event.target.value)}
          >
            <option value="">Select Level</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <label>How do you prefer to learn?</label>

          <select
            value={learningPreference}
            onChange={(event) =>
              setLearningPreference(event.target.value)
            }
          >
            <option value="">Select Preference</option>
            <option value="Visual">Diagrams & Visuals</option>
            <option value="Notes">Notes & Explanations</option>
            <option value="Practical">Practical Examples</option>
            <option value="Mixed">Mixed Learning</option>
          </select>

          <label>How much time can you learn daily?</label>

          <select
            value={dailyTime}
            onChange={(event) => setDailyTime(event.target.value)}
          >
            <option value="">Select Daily Time</option>
            <option value="30 Minutes">30 Minutes</option>
            <option value="1 Hour">1 Hour</option>
            <option value="2 Hours">2 Hours</option>
            <option value="3+ Hours">3+ Hours</option>
          </select>

          <label>What is your career goal?</label>

          <input
            type="text"
            placeholder="Example: Physical Design Engineer"
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
          />

          <button type="submit">
            Create My Learning Path
          </button>
        </form>
      </div>
    </section>
  );
}

export default Onboarding;