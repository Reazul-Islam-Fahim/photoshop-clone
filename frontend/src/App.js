import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import axios from "./api";
import ProjectListSidebar from "./components/ProjectListSidebar";
import ProjectEditorPage from "./components/ProjectEditorPage";
import UploadProject from "./components/UploadProject";

const UploadProjectPage = ({ onUploadSuccess }) => {
  const navigate = useNavigate();
  const handleSuccess = (project) => {
    if (onUploadSuccess) {
      onUploadSuccess(project, navigate);
    } else {
      navigate(`/projects/${project.id}`);
    }
  };
  return <UploadProject onUploadSuccess={handleSuccess} />;
};

const AppLayout = () => {
  const [projects, setProjects] = useState([]);

  const fetchProjects = async () => {
    try {
      const res = await axios.get("/projects/");
      setProjects(res.data);
    } catch (err) {
      console.error("Failed to fetch projects", err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <section
      style={{
        backgroundColor: "#bfe2ff",
        paddingBottom: "20px",
      }}
    >
      <h1 className="canvas-title">
        <span style={{ color: "red" }}>R</span>
        <span style={{ color: "orange" }}>a</span>
        <span style={{ color: "yellow" }}>i</span>
        <span style={{ color: "green" }}>n</span>
        <span style={{ color: "blue" }}>b</span>
        <span style={{ color: "indigo" }}>o</span>
        <span style={{ color: "violet" }}>w</span>
        <span>&nbsp;</span>
        <span style={{ color: "crimson" }}>V</span>
        <span style={{ color: "deeppink" }}>i</span>
        <span style={{ color: "coral" }}>s</span>
        <span style={{ color: "gold" }}>u</span>
        <span style={{ color: "limegreen" }}>a</span>
        <span style={{ color: "dodgerblue" }}>l</span>
        <span style={{ color: "purple" }}>i</span>
        <span style={{ color: "hotpink" }}>z</span>
        <span style={{ color: "teal" }}>e</span>
        <span style={{ color: "slategray" }}>r</span>
      </h1>
      <div style={{ display: "flex", height: "100vh" }}>
        <div style={{ flex: 1, padding: 0 }}>
          <Routes>
            <Route path="/projects/:id" element={<ProjectEditorPage />} />
            <Route
              path="/upload"
              element={
                <UploadProjectPage
                  onUploadSuccess={async (project, navigate) => {
                    await fetchProjects();
                    navigate(`/projects/${project.id}`);
                  }}
                />
              }
            />
          </Routes>
        </div>
        <ProjectListSidebar projects={projects} />
      </div>
    </section>
  );
};

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}
