import { Routes, Route } from "react-router-dom";

// Main Pages
import Home from "./pages/Home";
import Courses from "./pages/Courses";
import About from "./pages/About";

// Authentication
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Student Flow
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";

// Learning System
import Modules from "./pages/Modules";
import LessonDetails from "./pages/LessonDetails";
import LessonPage from "./pages/LessonPage";

// Existing Python Page
import PythonLesson from "./pages/PythonLesson";

// Capstone Projects
import CapstoneProjects from "./pages/CapstoneProjects";
import CapstoneProjectDetails from "./pages/CapstoneProjectDetails";
import CapstoneProjectWorkspace from "./pages/CapstoneProjectWorkspace";

// Compiler
import CompilerWorkspace from "./pages/CompilerWorkspace";

// Styles
import "./styles/theme.css";
import "./App.css";

// Layout
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function App() {
  return (
    <>
      <Navbar />

      <Routes>

        {/* ==========================================
            MAIN PAGES
        ========================================== */}

        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/about" element={<About />} />


        {/* ==========================================
            AUTHENTICATION
        ========================================== */}

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />


        {/* ==========================================
            STUDENT FLOW
        ========================================== */}

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/onboarding" element={<Onboarding />} />


        {/* ==========================================
            LEARNING SYSTEM
        ========================================== */}

        {/* Course → Modules */}

        <Route
          path="/modules/:roadmapId"
          element={<Modules />}
        />

        {/* Module → Lesson List */}

        <Route
          path="/lessons/:moduleId"
          element={<LessonDetails />}
        />

        {/* Lesson List → Individual Lesson */}

        <Route
          path="/lessons/:moduleId/:lessonId"
          element={<LessonPage />}
        />

        {/* Legacy / Existing Individual Lesson Route */}

        <Route
          path="/lesson/:lessonId"
          element={<LessonPage />}
        />


        {/* ==========================================
            EXISTING PYTHON PAGE
        ========================================== */}

        <Route
          path="/python"
          element={<PythonLesson />}
        />


        {/* ==========================================
            CAPSTONE PROJECTS
        ========================================== */}

        <Route
          path="/capstone"
          element={<CapstoneProjects />}
        />

        <Route
          path="/capstone/:projectId"
          element={<CapstoneProjectDetails />}
        />

        <Route
          path="/capstone/:projectId/workspace"
          element={<CapstoneProjectWorkspace />}
        />


        {/* ==========================================
            COMPILER
        ========================================== */}

        <Route
          path="/workspace"
          element={<CompilerWorkspace />}
        />

      </Routes>

      <Footer />
    </>
  );
}

export default App;