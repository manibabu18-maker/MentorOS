export function generateLessonContent(lesson, profile) {
  const preference = profile.learning_preference;

  const baseContent = {
    explanation: `${lesson.topic} is an important concept in ${profile.subject}. We will understand this topic from the basics.`,

    visual: `Visualize ${lesson.topic} as a system where inputs are processed to produce an output.`,

    practical: `Think about a real electronic system that uses ${lesson.topic}. Observe how input conditions affect the output.`,

    practice: `Write three important points you understood about ${lesson.topic}.`,

    quiz: `Why is ${lesson.topic} important in ${profile.subject}?`,
  };

  if (preference === "Visual Learning") {
    return [
      {
        type: "visual",
        title: "Visual Explanation",
        content: baseContent.visual,
      },
      {
        type: "explanation",
        title: "Simple Explanation",
        content: baseContent.explanation,
      },
      {
        type: "practice",
        title: "Visual Practice",
        content: `Draw a simple diagram representing ${lesson.topic}.`,
      },
    ];
  }

  if (preference === "Notes Learning") {
    return [
      {
        type: "explanation",
        title: "Study Notes",
        content: baseContent.explanation,
      },
      {
        type: "practice",
        title: "Key Points",
        content: baseContent.practice,
      },
      {
        type: "quiz",
        title: "Quick Question",
        content: baseContent.quiz,
      },
    ];
  }

  if (preference === "Practical Learning") {
    return [
      {
        type: "practical",
        title: "Practical Example",
        content: baseContent.practical,
      },
      {
        type: "practice",
        title: "Hands-On Task",
        content: `Create a small example or simulation related to ${lesson.topic}.`,
      },
      {
        type: "quiz",
        title: "Think Like an Engineer",
        content: baseContent.quiz,
      },
    ];
  }

  return [
    {
      type: "explanation",
      title: "Simple Explanation",
      content: baseContent.explanation,
    },
    {
      type: "visual",
      title: "Visual Explanation",
      content: baseContent.visual,
    },
    {
      type: "practical",
      title: "Practical Example",
      content: baseContent.practical,
    },
    {
      type: "practice",
      title: "Practice Task",
      content: baseContent.practice,
    },
    {
      type: "quiz",
      title: "Quick Question",
      content: baseContent.quiz,
    },
  ];
}