import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCapstoneProjects } from "../services/projectService";
import "../styles/CapstoneProjects.css";

function CapstoneProjects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadProjects = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getCapstoneProjects();

        if (mounted) {
          setProjects(data);
        }
      } catch (err) {
        console.error("Capstone projects load error:", err);

        if (mounted) {
          setError(
            "Unable to load Capstone projects. Please refresh and try again."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProjects();

    return () => {
      mounted = false;
    };
  }, []);

  const openProject = (projectId) => {
    navigate(`/capstone/${projectId}`);
  };

  return (
    <main className="capstone-page">
      <section className="capstone-hero">
        <div className="capstone-hero-content">
          <span className="capstone-eyebrow">C PROGRAMMING</span>

          <h1>C Capstone Project Lab</h1>

          <p>
            Apply the C concepts you learned across the course to a
            resume-oriented real-world project.
          </p>

          <div className="capstone-flow">
            <span>Learn</span>
            <span>→</span>
            <span>Build</span>
            <span>→</span>
            <span>Test</span>
            <span>→</span>
            <span>Review</span>
          </div>
        </div>
      </section>

      <section className="capstone-content">
        <div className="capstone-section-header">
          <div>
            <h2>Choose Your Capstone</h2>
            <p>
              Select one project and build it from problem understanding to
              final review.
            </p>
          </div>

          <div className="capstone-count">
            {projects.length} Projects
          </div>
        </div>

        {loading && (
          <div className="capstone-state">
            <div className="capstone-spinner" />
            <p>Loading Capstone projects...</p>
          </div>
        )}

        {!loading && error && (
          <div className="capstone-state capstone-error">
            <h3>Could not load projects</h3>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="capstone-state">
            <h3>No projects available</h3>
            <p>Capstone projects have not been published yet.</p>
          </div>
        )}

        {!loading && !error && projects.length > 0 && (
          <div className="capstone-grid">
            {projects.map((project) => (
              <article
                key={project.id}
                className="capstone-project-card"
                onClick={() => openProject(project.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openProject(project.id);
                  }
                }}
              >
                <div className="capstone-card-top">
                  <span className="capstone-project-number">
                    PROJECT {String(project.project_order).padStart(2, "0")}
                  </span>

                  <span className="capstone-difficulty">
                    {project.difficulty || "Advanced"}
                  </span>
                </div>

                <h3>{project.project_title}</h3>

                <p className="capstone-project-description">
                  {project.description}
                </p>

                <div className="capstone-card-meta">
                  <span>
                    ⏱ {project.estimated_duration || "Flexible"}
                  </span>

                  <span>◆ C Capstone</span>
                </div>

                <div className="capstone-skills">
                  {String(project.skills_learned || "")
                    .split(",")
                    .map((skill) => skill.trim())
                    .filter(Boolean)
                    .slice(0, 5)
                    .map((skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                        className="skill-chip"
                      >
                        {skill}
                      </span>
                    ))}
                </div>

                <div className="capstone-card-footer">
                  <span>View project details</span>
                  <span className="capstone-arrow">→</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default CapstoneProjects;