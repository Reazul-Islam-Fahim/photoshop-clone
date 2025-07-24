import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api";
import CanvasEditor from "./CanvasEditor";

const ProjectEditorPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(`/projects/${id}/`);
        setProject(res.data);
      } catch (err) {
        console.error("Failed to fetch project", err);
      }
    };
    fetchProject();
  }, [id]);

  return project ? (
    <CanvasEditor project={project} />
  ) : (
    <p>Loading project...</p>
  );
};

export default ProjectEditorPage;
