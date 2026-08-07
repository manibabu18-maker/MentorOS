import { useEffect, useState } from "react";
import { getLesson } from "../services/contentService";

export default function PythonLesson() {

  const [lesson, setLesson] = useState(null);

  useEffect(() => {

    async function loadLesson() {

      const data = await getLesson(
        "python",
        "module1",
        "lesson01"
      );

      setLesson(data);
    }

    loadLesson();

  }, []);

  if (!lesson) {
    return <h2>Loading Lesson...</h2>;
  }

  return (
    <div style={{ padding: "30px" }}>

      <h1>{lesson.lessonInfo.title}</h1>

      <h3>Difficulty : {lesson.lessonInfo.difficulty}</h3>

      <h3>Duration : {lesson.lessonInfo.duration}</h3>

      <hr />

      <h2>Learning Objectives</h2>

      <ul>
        {lesson.learningObjectives.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

      <h2>Theory</h2>

      <p>{lesson.theory.introduction}</p>

      <h2>Example</h2>

      <pre>{lesson.codeExamples[0].code}</pre>

      <h2>Mini Project</h2>

      <p>{lesson.miniProject.title}</p>

    </div>
  );
}