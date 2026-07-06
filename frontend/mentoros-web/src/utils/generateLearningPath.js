export function generateLearningPath(profile) {
  const subject = profile.subject;
  const level = profile.level;

  if (subject === "VLSI" && level === "Beginner") {
    return [
      {
        day_number: 1,
        topic: "Introduction to VLSI",
        description: "Understand VLSI design flow and basic concepts.",
        status: "Not Started",
      },
      {
        day_number: 2,
        topic: "Digital Logic Fundamentals",
        description: "Learn logic gates, Boolean algebra and combinational circuits.",
        status: "Not Started",
      },
      {
        day_number: 3,
        topic: "Verilog Basics",
        description: "Understand modules, inputs, outputs and basic Verilog syntax.",
        status: "Not Started",
      },
      {
        day_number: 4,
        topic: "Combinational Circuit Design",
        description: "Design multiplexers, encoders and decoders using Verilog.",
        status: "Not Started",
      },
      {
        day_number: 5,
        topic: "Sequential Circuits",
        description: "Learn flip-flops, registers and counters.",
        status: "Not Started",
      },
    ];
  }

  return [
    {
      day_number: 1,
      topic: `Introduction to ${subject}`,
      description: `Understand the fundamentals of ${subject}.`,
      status: "Not Started",
    },
  ];
}