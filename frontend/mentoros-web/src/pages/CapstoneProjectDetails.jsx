import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCapstoneProjectById } from "../services/projectService";
import "../styles/CapstoneProjectDetails.css";

function parseRequirements(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value;
  }

  return String(value)
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

function CapstoneProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadProject = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getCapstoneProjectById(projectId);

        if (mounted) {
          setProject(data);
        }
      } catch (err) {
        console.error("Capstone project details error:", err);

        if (mounted) {
          setError(
            "Unable to load this project. The project may no longer be available."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProject();

    return () => {
      mounted = false;
    };
  }, [projectId]);

  const requirements = useMemo(
    () => parseRequirements(project?.requirements),
    [project?.requirements]
  );

  const skills = useMemo(
    () =>
      String(project?.skills_learned || "")
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
    [project?.skills_learned]
  );

  if (loading) {
    return (
      <main className="project-details-page">
        <div className="project-details-state">
          <div className="capstone-spinner" />
          <p>Loading project...</p>
        </div>
      </main>
    );
  }

  if (error || !project) {
    return (
      <main className="project-details-page">
        <div className="project-details-state project-details-error">
          <h2>Project unavailable</h2>
          <p>{error || "Project not found."}</p>

          <button
            type="button"
            className="project-back-button"
            onClick={() => navigate("/capstone")}
          >
            ← Back to Capstone Lab
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="project-details-page">
      <section className="project-details-hero">
        <div className="project-details-container">
          <button
            type="button"
            className="project-back-link"
            onClick={() => navigate("/capstone")}
          >
            ← Back to Capstone Lab
          </button>

          <div className="project-badge-row">
            <span className="project-number-badge">
              PROJECT {String(project.project_order).padStart(2, "0")}
            </span>

            <span className="project-difficulty-badge">
              {project.difficulty || "Advanced"}
            </span>

            <span className="project-duration-badge">
              {project.estimated_duration || "Flexible duration"}
            </span>
          </div>

          <h1>{project.project_title}</h1>

          <p className="project-hero-description">
            {project.description}
          </p>
        </div>
      </section>

      <section className="project-details-content">
        <div className="project-details-container">
          <div className="project-action-panel">
            <div>
              <strong>Ready to build?</strong>
              <p>
                Start by understanding the problem and planning your solution.
              </p>
            </div>

            <button
              type="button"
              className="start-project-button"
              onClick={() =>
                navigate(`/capstone/${project.id}/workspace`)
              }
            >
              Start Project →
            </button>
          </div>

          <section className="details-section">
            <div className="section-heading">
              <span>01</span>
              <div>
                <h2>Project Overview</h2>
                <p>
                  Understand what you are expected to build before writing
                  code.
                </p>
              </div>
            </div>

            <div className="overview-card">
              <p>{project.description}</p>
            </div>
          </section>

          <section className="details-section">
            <div className="section-heading">
              <span>02</span>
              <div>
                <h2>Required Skills</h2>
                <p>
                  Concepts this project expects you to apply.
                </p>
              </div>
            </div>

            <div className="skills-grid">
              {skills.map((skill, index) => (
                <div className="detail-skill-card" key={`${skill}-${index}`}>
                  <span>✓</span>
                  <p>{skill}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="details-section">
            <div className="section-heading">
              <span>03</span>
              <div>
                <h2>Requirements</h2>
                <p>
                  Functional requirements your project should satisfy.
                </p>
              </div>
            </div>

            <div className="requirements-list">
              {requirements.map((requirement, index) => (
                <div className="requirement-item" key={index}>
                  <div className="requirement-number">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <p>{requirement}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="details-section">
            <div className="section-heading">
              <span>04</span>
              <div>
                <h2>Required Concepts</h2>
                <p>
                  Core and advanced C concepts involved in this project.
                </p>
              </div>
            </div>

            <div className="concept-groups">
              <div className="concept-group">
                <h3>Core Concepts</h3>

                <div className="concept-chip-list">
                  {project.concepts
                    .filter((concept) => concept.concept_type === "core")
                    .map((concept) => (
                      <span
                        key={concept.id}
                        className="concept-chip core"
                      >
                        {concept.concept_name}
                      </span>
                    ))}
                </div>
              </div>

              <div className="concept-group">
                <h3>Advanced Concepts</h3>

                <div className="concept-chip-list">
                  {project.concepts
                    .filter(
                      (concept) => concept.concept_type === "advanced"
                    )
                    .map((concept) => (
                      <span
                        key={concept.id}
                        className="concept-chip advanced"
                      >
                        {concept.concept_name}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </section>

          <section className="details-section">
            <div className="section-heading">
              <span>05</span>
              <div>
                <h2>Project Milestones</h2>
                <p>
                  Build the project step by step instead of jumping directly
                  into code.
                </p>
              </div>
            </div>

            <div className="milestone-list">
              {project.milestones.map((milestone) => (
                <article
                  key={milestone.id}
                  className="milestone-card"
                >
                  <div className="milestone-number">
                    {String(milestone.milestone_order).padStart(2, "0")}
                  </div>

                  <div className="milestone-content">
                    <h3>{milestone.milestone_title}</h3>
                    <p>{milestone.description}</p>

                    {milestone.deliverables && (
                      <div className="deliverable-box">
                        <strong>Deliverable</strong>
                        <span>{milestone.deliverables}</span>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="details-section">
            <div className="section-heading">
              <span>06</span>
              <div>
                <h2>Test Cases</h2>
                <p>
                  Your implementation should pass functional and negative
                  tests.
                </p>
              </div>
            </div>

            <div className="test-case-table-wrapper">
              <table className="test-case-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Test</th>
                    <th>Input</th>
                    <th>Expected Result</th>
                    <th>Type</th>
                  </tr>
                </thead>

                <tbody>
                  {project.testCases.map((testCase) => (
                    <tr key={testCase.id}>
                      <td>{testCase.test_order}</td>
                      <td>{testCase.test_title}</td>
                      <td>{testCase.input_data || "—"}</td>
                      <td>{testCase.expected_result}</td>
                      <td>
                        <span
                          className={`test-type ${String(
                            testCase.test_type || ""
                          ).toLowerCase()}`}
                        >
                          {testCase.test_type || "functional"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="details-section">
            <div className="section-heading">
              <span>07</span>
              <div>
                <h2>Edge Cases</h2>
                <p>
                  Strong implementations handle boundary and invalid cases.
                </p>
              </div>
            </div>

            <div className="edge-case-grid">
              {project.edgeCases.map((edgeCase) => (
                <article
                  key={edgeCase.id}
                  className="edge-case-card"
                >
                  <h3>{edgeCase.edge_title}</h3>
                  <p>{edgeCase.description}</p>

                  <div className="edge-result">
                    <strong>Expected behavior</strong>
                    <span>{edgeCase.expected_behavior}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="details-section expected-output-section">
            <div className="section-heading">
              <span>08</span>
              <div>
                <h2>Expected Output</h2>
                <p>
                  This is a reference format, not something to copy blindly.
                </p>
              </div>
            </div>

            <pre className="expected-output">
              {project.expected_output || "No sample output provided."}
            </pre>
          </section>

          <section className="project-final-cta">
            <div>
              <span className="cta-label">NEXT STEP</span>
              <h2>Build it yourself</h2>
              <p>
                Your next step is to plan the implementation before writing
                the complete solution.
              </p>
            </div>

            <button
              type="button"
              className="start-project-button large"
              onClick={() =>
                navigate(`/capstone/${project.id}/workspace`)
              }
            >
              Start Project →
            </button>
          </section>
        </div>
      </section>
    </main>
  );
}

export default CapstoneProjectDetails;