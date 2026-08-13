import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, useParams } from "react-router-dom";

function Modules() {
  const { roadmapId } = useParams();
  const [modules, setModules] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchModules = async () => {
      // Shared module mapping
      const { data: mappings, error: mappingError } = await supabase
        .from("roadmap_module_map")
        .select("module_id")
        .eq("roadmap_id", roadmapId);

      if (mappingError) {
        console.error("Mapping error:", mappingError);
        return;
      }

      const mappedModuleIds = (mappings || []).map(
        (item) => item.module_id
      );

      // Existing direct modules
      const { data: directModules, error: directError } = await supabase
        .from("roadmap_modules")
        .select("*")
        .eq("roadmap_id", roadmapId)
        .order("module_order");

      if (directError) {
        console.error("Direct module error:", directError);
        return;
      }

      // Get shared modules
      let sharedModules = [];

      if (mappedModuleIds.length > 0) {
        const { data, error } = await supabase
          .from("roadmap_modules")
          .select("*")
          .in("id", mappedModuleIds);

        if (error) {
          console.error("Shared module error:", error);
          return;
        }

        sharedModules = data || [];
      }

      // Combine without duplicates
      const combinedModules = [
        ...(directModules || []),
        ...sharedModules.filter(
          (shared) =>
            !(directModules || []).some(
              (direct) => direct.id === shared.id
            )
        ),
      ].sort((a, b) => a.module_order - b.module_order);

      setModules(combinedModules);
    };

    fetchModules();
  }, [roadmapId]);

  return (
    <div style={{ padding: "40px" }}>
      <h1>Modules</h1>

      {modules.map((module) => (
        <div
          key={module.id}
          onClick={() => navigate(`/lessons/${module.id}`)}
          style={{
            border: "1px solid #ddd",
            padding: "15px",
            marginBottom: "10px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          <h3>{module.module_name}</h3>

          <p>{module.description}</p>
        </div>
      ))}
    </div>
  );
}

export default Modules;