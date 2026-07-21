import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Courses from "./pages/Courses";
import About from "./pages/About";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import "./App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import Lesson from "./pages/Lesson";
import Modules from "./pages/Modules";
import LessonDetails from "./pages/LessonDetails";
function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/lesson/:moduleId" element={<Lesson />} />
        <Route path="/modules/:roadmapId" element={<Modules />} />
        <Route
  path="/lessons/:moduleId"
  element={<LessonDetails />}
/>
      </Routes>

      <Footer />
    </>
  );
}

export default App;