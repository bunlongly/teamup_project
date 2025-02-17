import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

function Projects({ projects }) {
  const navigate = useNavigate();
  const [filteredProjects, setFilteredProjects] = useState(projects);
  const [projectNameFilter, setProjectNameFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const handleFilter = () => {
    const filtered = projects.filter((project) => {
      const matchesProjectName = project.projectname
        .toLowerCase()
        .includes(projectNameFilter.toLowerCase());
      const matchesRole = project.roles.some((role) =>
        role.role.toLowerCase().includes(roleFilter.toLowerCase())
      );
      return matchesProjectName && matchesRole;
    });
    setFilteredProjects(filtered);
  };

  return (
    <div className="projects-page">
      <div className="grid grid-cols-10 w-4/5 mx-auto main-container space-x-8">
        <div className="col-span-7 projects-left-col">
          {filteredProjects.map((project, index) => (
            <ProjectDetail key={index} project={project} />
          ))}
        </div>
        <div className="col-span-3 projects-right-col">
          <button
            style={{ backgroundColor: "#0046b0", color: "#fff" }}
            type="button"
            onClick={() => navigate("/projects/create")}
            className="rounded-md px-3 py-1.5 text-sm font-semibold text-black shadow-xs mb-4"
          >
            Create Project
          </button>
          <div className="filter-panel p-4 bg-white rounded-md shadow-md">
            <h3 className="text-lg font-bold mb-4">Filter Projects</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Project Name
              </label>
              <input
                type="text"
                value={projectNameFilter}
                onChange={(e) => setProjectNameFilter(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Role Needed
              </label>
              <input
                type="text"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2"
              />
            </div>
            <button
              style={{ backgroundColor: "#0046b0", color: "#fff" }}
              type="button"
              onClick={handleFilter}
              className="rounded-md px-3 py-2 text-sm font-semibold text-black shadow-xs"
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectDetail({ project }) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const navigate = useNavigate();

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const handleRoleClick = (role) => {
    navigate("/apply", { 
      state: { 
        role: role.role, 
        requirement: role.requirement, 
        projectname: project.projectname, 
        projecttype: project.projecttype, 
        startdate: project.startdate, 
        enddate: project.enddate, 
        location: project.location,
        description: project.projectdescription
      } 
    });
  };

  return (
    <div className="project-detail bg-white mb-4 rounded-md shadow-md overflow-hidden details-container">
      <div className="flex">
        <div className="w-1/4 p-4">
          <img src={logo} width={70} alt="Logo" />
        </div>
        <div className="w-3/4">
          <div className="text-black p-4 rounded-t-md text-m font-bold mb-2">
            <p
              style={{
                fontFamily: "poppins",
                fontSize: "1rem",
                color: "black",
              }}
            >
              {project.projectname}
            </p>
          </div>
          <div className="flex space-x-4 ml-4">
            <div className="mt-2 w-1/3">
              <p
                style={{
                  fontFamily: "poppins",
                  fontSize: "0.8rem",
                  color: "black",
                }}
              >
                <strong>Project Length</strong>
                {project.duration}
              </p>
            </div>
            <div className="mt-2 w-1/3">
              <p
                style={{
                  fontFamily: "poppins",
                  fontSize: "0.8rem",
                  color: "black",
                }}
              >
                <strong>Project Type:</strong>
                {project.projecttype}
              </p>
            </div>
            <div className="mt-2 w-1/3">
              <p
                style={{
                  fontFamily: "poppins",
                  fontSize: "0.8rem",
                  color: "black",
                }}
              >
                <strong>Location: </strong>
                {project.location}
              </p>
            </div>
          </div>
          <div className="p-4 break-words project-description">
            <p className="mr-4"
              style={{
                fontFamily: "poppins",
                fontSize: "0.8rem",
                color: "rgba(128, 128, 128, 0.9)",
              }}
            >
              Description: <br />
              {showFullDescription
                ? project.projectdescription
                : `${project.projectdescription.substring(0, 100)}...`}
            </p>
            <button
              style={{
                fontFamily: "poppins",
                fontSize: "0.8rem",
              }}
              onClick={toggleDescription}
              className="text-blue-500 underline"
            >
              {showFullDescription ? "See Less" : "See More"}
            </button>
          </div>
          <hr className="mr-4 ml-4"/>
          <div className="project-roles mr-4">
            {project.roles && project.roles.map((role, index) => (
              <div key={index} className="mt-2 inline-block p-2">
                <button
                  style={{ backgroundColor: "#0046b0" }}
                  type="button"
                  className="rounded-md px-4 py-1 text-sm font-semibold text-white shadow-xs w-full"
                  onClick={() => handleRoleClick(role)}
                >
                  {role.role}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Projects;