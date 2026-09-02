import { supabase } from "../lib/supabase";

/**
 * Fetch all active C Capstone projects.
 * module_id = 1 -> C Programming
 */
export async function getCapstoneProjects() {
  const { data, error } = await supabase
    .from("projects")
    .select(`
      id,
      module_id,
      project_order,
      project_title,
      difficulty,
      estimated_duration,
      description,
      requirements,
      expected_output,
      github_template,
      is_active,
      skills_learned
    `)
    .eq("module_id", 1)
    .eq("is_active", true)
    .order("project_order", { ascending: true });

  if (error) {
    console.error("Error fetching capstone projects:", error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch one C Capstone project with:
 * - concepts
 * - milestones
 * - test cases
 * - edge cases
 */
export async function getCapstoneProjectById(projectId) {
  const numericId = Number(projectId);

  if (!Number.isFinite(numericId)) {
    throw new Error("Invalid project id.");
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select(`
      id,
      module_id,
      project_order,
      project_title,
      difficulty,
      estimated_duration,
      description,
      requirements,
      expected_output,
      github_template,
      is_active,
      skills_learned
    `)
    .eq("id", numericId)
    .eq("module_id", 1)
    .eq("is_active", true)
    .single();

  if (projectError) {
    console.error("Error fetching project:", projectError);
    throw projectError;
  }

  const [
    conceptsResult,
    milestonesResult,
    testCasesResult,
    edgeCasesResult,
  ] = await Promise.all([
    supabase
      .from("project_concepts")
      .select(`
        id,
        project_id,
        concept_name,
        concept_type,
        concept_order
      `)
      .eq("project_id", numericId)
      .order("concept_order", { ascending: true }),

    supabase
      .from("project_milestones")
      .select(`
        id,
        project_id,
        milestone_order,
        milestone_title,
        description,
        deliverables
      `)
      .eq("project_id", numericId)
      .order("milestone_order", { ascending: true }),

    supabase
      .from("project_test_cases")
      .select(`
        id,
        project_id,
        test_order,
        test_title,
        input_data,
        expected_result,
        test_type
      `)
      .eq("project_id", numericId)
      .order("test_order", { ascending: true }),

    supabase
      .from("project_edge_cases")
      .select(`
        id,
        project_id,
        edge_order,
        edge_title,
        description,
        expected_behavior
      `)
      .eq("project_id", numericId)
      .order("edge_order", { ascending: true }),
  ]);

  if (conceptsResult.error) {
    console.error("Error fetching project concepts:", conceptsResult.error);
    throw conceptsResult.error;
  }

  if (milestonesResult.error) {
    console.error(
      "Error fetching project milestones:",
      milestonesResult.error
    );
    throw milestonesResult.error;
  }

  if (testCasesResult.error) {
    console.error("Error fetching project test cases:", testCasesResult.error);
    throw testCasesResult.error;
  }

  if (edgeCasesResult.error) {
    console.error("Error fetching project edge cases:", edgeCasesResult.error);
    throw edgeCasesResult.error;
  }

  return {
    ...project,
    concepts: conceptsResult.data || [],
    milestones: milestonesResult.data || [],
    testCases: testCasesResult.data || [],
    edgeCases: edgeCasesResult.data || [],
  };
}