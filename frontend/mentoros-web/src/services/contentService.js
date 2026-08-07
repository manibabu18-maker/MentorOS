export async function getLesson(course, module, lesson) {
  try {
    const response = await fetch(
      `/content/${course}/${module}/${lesson}.json`
    );

    if (!response.ok) {
      throw new Error("Lesson not found");
    }

    return await response.json();
  } catch (error) {
    console.error("Error loading lesson:", error);
    return null;
  }
}