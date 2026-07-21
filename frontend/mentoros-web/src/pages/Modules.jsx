import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, useParams } from "react-router-dom";
function Modules() {
  const { roadmapId } = useParams();
  const [modules, setModules] = useState([]);
const navigate = useNavigate();
  useEffect(() => {
    const fetchModules = async () => {
      const { data, error } = await supabase
        .from("roadmap_modules")
        .select("*")
        .eq("roadmap_id", roadmapId)
        .order("module_order");

      if (error) {
        console.error(error);
      } else {
        setModules(data);
      }
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