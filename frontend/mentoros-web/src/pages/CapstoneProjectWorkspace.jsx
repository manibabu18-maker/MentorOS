import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCapstoneProjectById } from "../services/projectService";
import "../styles/CapstoneProjectWorkspace.css";

function parseList(value) {
  if (!value) return [];

  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Not JSON, continue with plain text parsing.
    }

    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function safeText(value, fallback = "") {
  if (value === null || value === undefined) return fallback;

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return JSON.stringify(value, null, 2);
}

function CodeBlock({ children }) {
  return (
    <pre className="workspace-code">
      <code>{children}</code>
    </pre>
  );
}

function SectionHeader({ number, title, description }) {
  return (
    <div className="workspace-section-header">
      <div className="workspace-section-number">{number}</div>

      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
    </div>
  );
}

export default function CapstoneProjectWorkspace() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    let mounted = true;

    async function loadProject() {
      try {
        setLoading(true);
        setError("");

        const data = await getCapstoneProjectById(projectId);

        if (mounted) {
          setProject(data);
        }
      } catch (err) {
        console.error("Failed to load capstone project:", err);

        if (mounted) {
          setError(
            err?.message ||
              "Unable to load this capstone project. Please try again."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProject();

    return () => {
      mounted = false;
    };
  }, [projectId]);

  const requirements = useMemo(
    () => parseList(project?.requirements),
    [project]
  );

  const skills = useMemo(
    () => parseList(project?.skills_learned),
    [project]
  );

  const coreConcepts = useMemo(() => {
    const concepts = project?.concepts || [];

    return concepts.filter((concept) => {
      const type = String(concept.concept_type || "").toLowerCase();

      return (
        type.includes("core") ||
        type.includes("fundamental") ||
        type.includes("basic")
      );
    });
  }, [project]);

  const advancedConcepts = useMemo(() => {
    const concepts = project?.concepts || [];

    return concepts.filter((concept) => {
      const type = String(concept.concept_type || "").toLowerCase();

      return (
        type.includes("advanced") ||
        type.includes("application") ||
        type.includes("extension")
      );
    });
  }, [project]);

  const otherConcepts = useMemo(() => {
    const concepts = project?.concepts || [];

    return concepts.filter((concept) => {
      const type = String(concept.concept_type || "").toLowerCase();

      const isCore =
        type.includes("core") ||
        type.includes("fundamental") ||
        type.includes("basic");

      const isAdvanced =
        type.includes("advanced") ||
        type.includes("application") ||
        type.includes("extension");

      return !isCore && !isAdvanced;
    });
  }, [project]);

  const scrollToSection = (id) => {
    setActiveTab(id);

    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  if (loading) {
    return (
      <main className="workspace-page">
        <div className="workspace-loading">
          <div className="workspace-loader" />
          <h2>Loading Project Workspace...</h2>
          <p>Preparing your capstone project.</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="workspace-page">
        <div className="workspace-error">
          <div className="error-icon">!</div>
          <h2>Unable to Load Project</h2>
          <p>{error}</p>

          <div className="workspace-error-actions">
            <button
              className="workspace-primary-btn"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>

            <button
              className="workspace-secondary-btn"
              onClick={() => navigate("/capstone")}
            >
              Back to Capstone Lab
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="workspace-page">
        <div className="workspace-error">
          <h2>Project Not Found</h2>
          <p>The requested capstone project could not be found.</p>

          <button
            className="workspace-primary-btn"
            onClick={() => navigate("/capstone")}
          >
            Back to Capstone Lab
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="workspace-page">
      {/* HERO */}
      <section className="workspace-hero">
        <div className="workspace-container">
          <button
            className="workspace-back-btn"
            onClick={() => navigate(`/capstone/${project.id}`)}
          >
            ← Back to Project
          </button>

          <div className="workspace-breadcrumb">
            Capstone Lab <span>/</span> Project Workspace
          </div>

          <div className="workspace-hero-content">
            <div>
              <div className="workspace-project-label">
                PROJECT {project.project_order || project.id}
              </div>

              <h1>{project.project_title}</h1>

              <p className="workspace-hero-description">
                {safeText(project.description)}
              </p>

              <div className="workspace-meta">
                {project.difficulty && (
                  <span className="workspace-meta-item">
                    <strong>Difficulty</strong>
                    {project.difficulty}
                  </span>
                )}

                {project.estimated_duration && (
                  <span className="workspace-meta-item">
                    <strong>Duration</strong>
                    {project.estimated_duration}
                  </span>
                )}
              </div>
            </div>

            <div className="workspace-status-card">
              <span className="status-dot" />
              <div>
                <strong>Workspace Ready</strong>
                <span>Build your project step by step</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NAVIGATION */}
      <div className="workspace-sticky-nav">
        <div className="workspace-container workspace-nav-inner">
          <button
            className={activeTab === "overview" ? "active" : ""}
            onClick={() => scrollToSection("overview")}
          >
            Overview
          </button>

          <button
            className={activeTab === "requirements" ? "active" : ""}
            onClick={() => scrollToSection("requirements")}
          >
            Requirements
          </button>

          <button
            className={activeTab === "concepts" ? "active" : ""}
            onClick={() => scrollToSection("concepts")}
          >
            Concepts
          </button>

          <button
            className={activeTab === "milestones" ? "active" : ""}
            onClick={() => scrollToSection("milestones")}
          >
            Milestones
          </button>

          <button
            className={activeTab === "tests" ? "active" : ""}
            onClick={() => scrollToSection("tests")}
          >
            Test Cases
          </button>

          <button
            className={activeTab === "edge-cases" ? "active" : ""}
            onClick={() => scrollToSection("edge-cases")}
          >
            Edge Cases
          </button>

          <button
            className={activeTab === "expected-output" ? "active" : ""}
            onClick={() => scrollToSection("expected-output")}
          >
            Expected Output
          </button>

          <button
            className={activeTab === "coding" ? "active" : ""}
            onClick={() => scrollToSection("coding")}
          >
            Coding
          </button>
        </div>
      </div>

      <div className="workspace-container workspace-content">
        {/* OVERVIEW */}
        <section id="overview" className="workspace-section">
          <SectionHeader
            number="01"
            title="Project Overview"
            description="Understand what you are building and why it matters."
          />

          <div className="workspace-overview-card">
            <p>{safeText(project.description)}</p>
          </div>
        </section>

        {/* SKILLS */}
        {skills.length > 0 && (
          <section className="workspace-section">
            <SectionHeader
              number="02"
              title="Skills You Will Use"
              description="Technical skills expected during this project."
            />

            <div className="workspace-chip-grid">
              {skills.map((skill, index) => (
                <div className="workspace-chip" key={`${skill}-${index}`}>
                  <span>✓</span>
                  {safeText(skill)}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* REQUIREMENTS */}
        <section id="requirements" className="workspace-section">
          <SectionHeader
            number="03"
            title="Requirements"
            description="These are the capabilities your final project should implement."
          />

          {requirements.length > 0 ? (
            <div className="workspace-requirements">
              {requirements.map((requirement, index) => (
                <div className="requirement-card" key={index}>
                  <div className="requirement-number">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div>
                    <h3>Requirement {index + 1}</h3>
                    <p>{safeText(requirement)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="workspace-empty">
              No requirements have been added yet.
            </div>
          )}
        </section>

        {/* CONCEPTS */}
        <section id="concepts" className="workspace-section">
          <SectionHeader
            number="04"
            title="Required Concepts"
            description="Use these C programming concepts while implementing the project."
          />

          {coreConcepts.length > 0 && (
            <div className="concept-group">
              <div className="concept-group-title">
                <span>CORE</span>
                <h3>Core Concepts</h3>
              </div>

              <div className="concept-grid">
                {coreConcepts.map((concept) => (
                  <div className="concept-card" key={concept.id}>
                    <span className="concept-type">
                      {safeText(concept.concept_type, "Core")}
                    </span>

                    <h4>{safeText(concept.concept_name)}</h4>
                  </div>
                ))}
              </div>
            </div>
          )}

          {advancedConcepts.length > 0 && (
            <div className="concept-group">
              <div className="concept-group-title">
                <span>ADVANCED</span>
                <h3>Advanced Concepts</h3>
              </div>

              <div className="concept-grid">
                {advancedConcepts.map((concept) => (
                  <div className="concept-card" key={concept.id}>
                    <span className="concept-type">
                      {safeText(concept.concept_type, "Advanced")}
                    </span>

                    <h4>{safeText(concept.concept_name)}</h4>
                  </div>
                ))}
              </div>
            </div>
          )}

          {otherConcepts.length > 0 && (
            <div className="concept-group">
              <div className="concept-group-title">
                <span>PROJECT</span>
                <h3>Project Concepts</h3>
              </div>

              <div className="concept-grid">
                {otherConcepts.map((concept) => (
                  <div className="concept-card" key={concept.id}>
                    <span className="concept-type">
                      {safeText(concept.concept_type, "Concept")}
                    </span>

                    <h4>{safeText(concept.concept_name)}</h4>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(project.concepts || []).length === 0 && (
            <div className="workspace-empty">
              No project concepts have been added yet.
            </div>
          )}
        </section>

        {/* MILESTONES */}
        <section id="milestones" className="workspace-section">
          <SectionHeader
            number="05"
            title="Project Milestones"
            description="Complete the project in small, measurable stages."
          />

          {project.milestones?.length > 0 ? (
            <div className="milestone-list">
              {project.milestones.map((milestone, index) => {
                const deliverables = parseList(milestone.deliverables);

                return (
                  <div className="milestone-card" key={milestone.id}>
                    <div className="milestone-number">
                      {String(
                        milestone.milestone_order || index + 1
                      ).padStart(2, "0")}
                    </div>

                    <div className="milestone-body">
                      <h3>{milestone.milestone_title}</h3>

                      {milestone.description && (
                        <p>{safeText(milestone.description)}</p>
                      )}

                      {deliverables.length > 0 && (
                        <div className="deliverables">
                          <strong>Deliverables</strong>

                          <ul>
                            {deliverables.map((item, itemIndex) => (
                              <li key={itemIndex}>{safeText(item)}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="workspace-empty">
              No milestones have been added yet.
            </div>
          )}
        </section>

        {/* TEST CASES */}
        <section id="tests" className="workspace-section">
          <SectionHeader
            number="06"
            title="Test Cases"
            description="Use these cases to verify that your implementation behaves correctly."
          />

          {project.testCases?.length > 0 ? (
            <div className="test-case-list">
              {project.testCases.map((test, index) => (
                <article className="test-card" key={test.id}>
                  <div className="test-card-header">
                    <div>
                      <span className="test-label">
                        TEST {String(index + 1).padStart(2, "0")}
                      </span>

                      <h3>{test.test_title}</h3>
                    </div>

                    {test.test_type && (
                      <span className="test-type">{test.test_type}</span>
                    )}
                  </div>

                  <div className="test-grid">
                    <div>
                      <span className="test-field-label">INPUT</span>
                      <CodeBlock>{safeText(test.input_data)}</CodeBlock>
                    </div>

                    <div>
                      <span className="test-field-label">EXPECTED RESULT</span>
                      <CodeBlock>
                        {safeText(test.expected_result)}
                      </CodeBlock>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="workspace-empty">
              No test cases have been added yet.
            </div>
          )}
        </section>

        {/* EDGE CASES */}
        <section id="edge-cases" className="workspace-section">
          <SectionHeader
            number="07"
            title="Edge Cases"
            description="Think about unusual inputs and failure conditions before testing."
          />

          {project.edgeCases?.length > 0 ? (
            <div className="edge-case-grid">
              {project.edgeCases.map((edge, index) => (
                <article className="edge-card" key={edge.id}>
                  <span className="edge-number">
                    EDGE {String(index + 1).padStart(2, "0")}
                  </span>

                  <h3>{edge.edge_title}</h3>

                  <p>{safeText(edge.description)}</p>

                  {edge.expected_behavior && (
                    <div className="edge-behavior">
                      <strong>Expected Behavior</strong>
                      <span>{safeText(edge.expected_behavior)}</span>
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="workspace-empty">
              No edge cases have been added yet.
            </div>
          )}
        </section>

        {/* EXPECTED OUTPUT */}
        <section id="expected-output" className="workspace-section">
          <SectionHeader
            number="08"
            title="Expected Output"
            description="Reference output for validating your implementation."
          />

          <div className="expected-output-card">
            <CodeBlock>{safeText(project.expected_output)}</CodeBlock>

            <p className="output-note">
              Use this as a reference. Your implementation should produce
              logically equivalent results for the defined test data.
            </p>
          </div>
        </section>

        {/* CODING */}
        <section id="coding" className="workspace-section coding-section">
          <SectionHeader
            number="09"
            title="Build Your Project"
            description="Implement the project using the concepts and milestones above."
          />

          <div className="coding-placeholder">
            <div className="coding-icon">&lt;/&gt;</div>

            <div className="coding-placeholder-content">
              <span className="coding-label">CODING WORKSPACE</span>

              <h3>C Programming Environment</h3>

              <p>
                Your code editor and C compiler will be connected here. For
                now, use the requirements, milestones, and test cases above to
                plan your implementation.
              </p>

              <div className="coding-features">
                <span>✓ C Code Editor</span>
                <span>✓ Compile & Run</span>
                <span>✓ Test Cases</span>
                <span>✓ Output Validation</span>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER ACTION */}
        <div className="workspace-bottom-actions">
          <button
            className="workspace-secondary-btn"
            onClick={() => navigate(`/capstone/${project.id}`)}
          >
            ← Project Details
          </button>

          <button
            className="workspace-primary-btn"
            onClick={() => scrollToSection("coding")}
          >
            Start Coding →
          </button>
        </div>
      </div>
    </main>
  );
}