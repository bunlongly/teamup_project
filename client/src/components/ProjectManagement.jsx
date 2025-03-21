import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import CreateProjectPage from "../pages/Post";
import Projects from "../pages/Projects";

function ProjectManagement() {
  const [projects, setProjects] = useState([]);

  const addProject = (project) => {
    setProjects([...projects, project]);
  };

  const updateProject = (index, updatedProject) => {
    const updatedProjects = projects.map((project, i) =>
      i === index ? updatedProject : project
    );
    setProjects(updatedProjects);
  };

  const deleteProject = (index) => {
    const updatedProjects = projects.filter((_, i) => i !== index);
    setProjects(updatedProjects);
  };

  return (
    <div>
      <Routes>
        <Route
          path="/"
          element={<Projects projects={projects} />}
        />
        <Route
          path="create"
          element={
            <CreateProjectPage
              projects={projects}
              addProject={addProject}
              updateProject={updateProject}
              deleteProject={deleteProject}
            />
          }
        />
      </Routes>
    </div>
  );
}

export default ProjectManagement;