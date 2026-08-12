import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Courses from "./pages/Courses";
import About from "./pages/About";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import Modules from "./pages/Modules";
import LessonDetails from "./pages/LessonDetails";
import LessonPage from "./pages/LessonPage";
import PythonLesson from "./pages/PythonLesson";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import "./App.css";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        {/* Main Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/about" element={<About />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Student Flow */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Existing Learning System */}
        <Route path="/modules/:roadmapId" element={<Modules />} />
        <Route path="/lessons/:moduleId" element={<LessonDetails />} />
        <Route path="/lesson/:lessonId" element={<LessonPage />} />

        {/* Python Course */}
        <Route path="/python" element={<PythonLesson />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;