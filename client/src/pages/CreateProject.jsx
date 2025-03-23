import React, { useState } from "react";
import NavBar from "../components/NavBar";
import SubscriptionModal from "../components/SubscriptionModal"; // Ensure you import the SubscriptionModal component

function CreateProjectPage({
  projects,
  addProject,
  updateProject,
  deleteProject,
}) {
  const [formData, setFormData] = useState({
    projectname: "",
    projectdescription: "",
    projecttype: "",
    duration: "",
    startdate: "",
    enddate: "",
    file: null,
    roles: [{ role: "", requirement: "" }],
  });

  const [isEditing, setIsEditing] = useState(false);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(null);
  const [createCount, setCreateCount] = useState(0); // Track the number of project creations
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false); // Track the visibility of the subscription modal

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleRoleChange = (index, e) => {
    const { name, value } = e.target;
    const roles = [...formData.roles];
    roles[index][name] = value;
    setFormData({ ...formData, roles });
  };

  const addRole = () => {
    setFormData({
      ...formData,
      roles: [...formData.roles, { role: "", requirement: "" }],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // First, check if the user has created 3 projects
    if (createCount >= 3) {
      setShowSubscriptionModal(true); // Show the subscription modal after 3 creations
    } else {
      // Handle creating or updating the project
      if (isEditing) {
        updateProject(currentProjectIndex, formData);
        setIsEditing(false);
        setCurrentProjectIndex(null);
      } else {
        addProject(formData);

        // Increment the project creation count
        setCreateCount((prevCount) => prevCount + 1); // Use the previous state value
      }
    }

    // Reset form data after submit
    setFormData({
      projectname: "",
      projectdescription: "",
      projecttype: "",
      duration: "",
      startdate: "",
      enddate: "",
      file: null,
      roles: [{ role: "", requirement: "" }],
    });
  };

  const handleEdit = (index) => {
    setFormData(projects[index]);
    setIsEditing(true);
    setCurrentProjectIndex(index);
  };

  const handleDelete = (index) => {
    deleteProject(index);
  };

  const handleCloseSubscriptionModal = () => {
    setShowSubscriptionModal(false); // Close the subscription modal
  };

  return (
    <div className="create-project-page">
      {/* <NavBar /> */}
      <div className="grid grid-cols-1 lg:grid-cols-10 w-4/5 mx-auto main-container space-y-8 lg:space-y-0 lg:space-x-8">
        <div className="col-span-1 lg:col-span-7 projects-left-col">
          <div className="title-container">
            <h3 className="text-2xl font-bold mb-4">Create Project</h3>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <div className="mt-2">
                <label htmlFor="projectname">Project Name</label>
                <input
                  type="text"
                  name="projectname"
                  placeholder="Enter your project name"
                  id="projectname"
                  autoComplete="projectname"
                  required
                  value={formData.projectname}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm shadow-md rounded-lg"
                  style={{ boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                />
              </div>
            </div>
            <div className="mt-2">
              <label htmlFor="projectdescription">Project Description</label>
              <input
                type="text"
                name="projectdescription"
                placeholder="Enter your project description"
                id="projectdescription"
                autoComplete="projectdescription"
                required
                value={formData.projectdescription}
                onChange={handleChange}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm shadow-md rounded-lg"
                style={{ boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
              />
            </div>
            <div className="flex space-x-4">
              <div className="mt-2 w-1/2">
                <label htmlFor="projecttype">Project Type</label>
                <input
                  type="text"
                  name="projecttype"
                  placeholder="Enter your project type"
                  id="projecttype"
                  autoComplete="projecttype"
                  required
                  value={formData.projecttype}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm shadow-md rounded-lg"
                  style={{ boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                />
              </div>
              <div className="mt-2 w-1/2">
                <label htmlFor="duration">Duration</label>
                <input
                  type="text"
                  name="duration"
                  placeholder="Enter your project duration"
                  id="duration"
                  autoComplete="duration"
                  required
                  value={formData.duration}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm shadow-md rounded-lg"
                  style={{ boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <div className="mt-2 w-1/2">
                <label htmlFor="startdate">Start Date</label>
                <input
                  type="date"
                  name="startdate"
                  placeholder="Enter your project start date"
                  id="startdate"
                  autoComplete="startdate"
                  required
                  value={formData.startdate}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm shadow-md rounded-lg"
                  style={{ boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                />
              </div>
              <div className="mt-2 w-1/2">
                <label htmlFor="enddate">End Date</label>
                <input
                  type="date"
                  name="enddate"
                  placeholder="Enter your project end date"
                  id="enddate"
                  autoComplete="enddate"
                  required
                  value={formData.enddate}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm shadow-md rounded-lg"
                  style={{ boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                />
              </div>
            </div>
            <div className="mt-2">
              <label htmlFor="file">Upload File</label>
              <input
                type="file"
                name="file"
                id="file"
                onChange={handleChange}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm shadow-md rounded-lg"
                style={{ boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
              />
            </div>
            {formData.roles.map((role, index) => (
              <div key={index} className="flex space-x-4 mt-2">
                <div className="w-1/2">
                  <label htmlFor={`role-${index}`}>Role</label>
                  <input
                    type="text"
                    name="role"
                    placeholder="Enter role"
                    id={`role-${index}`}
                    autoComplete="role"
                    required
                    value={role.role}
                    onChange={(e) => handleRoleChange(index, e)}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm shadow-md rounded-lg"
                    style={{ boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                  />
                </div>
                <div className="w-1/2">
                  <label htmlFor={`requirement-${index}`}>Requirement</label>
                  <input
                    type="text"
                    name="requirement"
                    placeholder="Enter requirement"
                    id={`requirement-${index}`}
                    autoComplete="requirement"
                    required
                    value={role.requirement}
                    onChange={(e) => handleRoleChange(index, e)}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm shadow-md rounded-lg"
                    style={{ boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                  />
                </div>
              </div>
            ))}
            <div className="flex justify-center mt-4">
              <button
                type="button"
                onClick={addRole}
                className="rounded-md px-3 py-2 text-sm font-semibold text-white shadow-xs"
                style={{ backgroundColor: "#0046b0" }}
              >
                Add Another Role
              </button>
            </div>
            <div className="flex justify-center mt-4">
              <button
                style={{ backgroundColor: "#0046b0" }}
                type="submit"
                className="rounded-md px-3 py-2 text-sm font-semibold text-white shadow-xs"
              >
                {isEditing ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
        <div className="col-span-1 lg:col-span-3 projects-right-col">
          {projects.map((project, index) => (
            <div
              key={index}
              className="project-detail bg-white mb-4 rounded-md shadow-md overflow-hidden details-container"
            >
              <div className="text-white p-4 rounded-t-md details-header">
                <p style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong className="text-m font-bold mb-2">Title: </strong>
                  <h4 className="text-m font-bold mb-2 ml-2">
                    {project.projectname}
                  </h4>
                </p>
              </div>
              <div className="p-4 break-words project-description mr-4">
                <p
                  style={{
                    fontFamily: "poppins",
                    fontSize: "0.8rem",
                    color: "rgba(128, 128, 128, 0.9)",
                  }}
                >
                  Role Requirement: <br />
                  {project.projectdescription}
                </p>
              </div>
              <div className="flex space-x-2 justify-center mt-4">
                <div className="w-1/2">
                  <button
                    style={{ backgroundColor: "#EE972E" }}
                    type="button"
                    className="rounded-md px-4 py-2 text-sm font-semibold text-white shadow-xs w-full"
                    onClick={() => handleEdit(index)}
                  >
                    Edit
                  </button>
                </div>
                <div className="w-1/2">
                  <button
                    style={{ backgroundColor: "#D03B3D" }}
                    type="button"
                    className="rounded-md px-3 py-2 text-sm font-semibold text-white shadow-xs w-full"
                    onClick={() => handleDelete(index)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Display SubscriptionModal when necessary */}
      {showSubscriptionModal && (
        <SubscriptionModal onClose={handleCloseSubscriptionModal} />
      )}
    </div>
  );
}

export default CreateProjectPage;