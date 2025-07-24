import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const ProjectListSidebar = ({ projects }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const selectedId = pathname.startsWith("/projects/")
    ? parseInt(pathname.split("/projects/")[1])
    : null;

  return (
    <div style={{ width: 250, padding: 10, borderLeft: "1px solid #ccc" }}>
      <h3>Projects</h3>
      <button onClick={() => navigate("/upload")} style={{ marginBottom: 10 }}>
        Add New Project
      </button>
      <div style={{ overflowY: "auto", height: "80%" }}>
        {projects.map((p) => (
          <div
            key={p.id}
            onClick={() => navigate(`/projects/${p.id}`)}
            style={{
              padding: "5px 10px",
              cursor: "pointer",
              backgroundColor: selectedId === p.id ? "#f0f0f0" : "transparent",
            }}
          >
            {p.title}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectListSidebar;
