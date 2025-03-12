import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function ApplyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    role,
    requirement,
    projectname,
    projecttype,
    startdate,
    enddate,
    description,
    location: projectLocation,
  } = location.state || {};

  const handleApply = () => {
    // Mock candidate profile data
    const candidateProfile = {
      name: "John Doe",
      email: "john.doe@example.com",
      skills: ["JavaScript", "React", "Node.js"],
      experience: [
        { title: "Software Developer", company: "ABC Corp" },
        { title: "Frontend Developer", company: "XYZ Ltd" },
      ],
      education: [
        { degree: "B.Sc. in Computer Science", school: "University of Example" },
      ],
      portfolioLink: "https://portfolio.example.com",
    };

    navigate("/candidates", {
      state: {
        role,
        requirement,
        projectname,
        projecttype,
        startdate,
        enddate,
        projectLocation,
        description,
        candidateProfile,
      },
    });
  };

  return (
    <div className="apply-page">
      <div className="grid grid-cols-10 w-4/5 mx-auto main-container space-x-8">
        <div className="col-span-7 apply-left-col">
          <div className="upper-left ml-4 mr-4">
            <div className="flex space-x-4">
              <div className="mt-2 w-1/2">
                <p className="mb-3">
                  <strong>{projectname}</strong>
                </p>
                <p>
                  <strong>Role: </strong> {role}
                </p>
              </div>
              <div className="mt-2 w-1/2">
                <p>
                  <strong>Status: </strong>
                </p>
              </div>
            </div>
            <hr />
            <div className="flex space-x-4">
              <div className="mt-2 w-1/2">
                <p className="mb-3">
                  <strong>Project Type: </strong> {projecttype}
                </p>
                <p>
                  <strong>Start Date: </strong> {startdate}
                </p>
              </div>
              <div className="mt-2 w-1/2">
                <p className="mb-3">
                  <strong>Location: </strong> {projectLocation}
                </p>
                <p>
                  <strong>End Date: </strong>
                  {enddate}
                </p>
              </div>
            </div>
            <div className="flex justify-center mt-4">
              <button
                style={{ backgroundColor: "#0046b0", color: "#fff" }}
                type="button"
                onClick={handleApply}
                className="rounded-md px-4 py-1.5 text-sm font-semibold text-black shadow-xs mt-4 mb-4"
              >
                Apply
              </button>
            </div>
          </div>
          <div className="space h-10"></div>
          <div className="lower-left ml-4">
            <div className="project-description mr-4 overflow-auto mb-4">
              <p className="mb-3">
                <strong>Project Description</strong>
              </p>
              <p>{description}</p>
            </div>
            <div className="role-requirement mr-4 overflow-auto">
              <p className="mb-3 mt-4">
                <strong>Role Requirement</strong>
              </p>
              <p>{requirement}</p>
            </div>
          </div>
        </div>
        <div className="col-span-3 apply-right-col">
          <div className="upper-right ml-4 mr-4 mb-10 mt-4">
            Connection Request
          </div>
          <div className="lower-right ml-4 mr-4">
            Connection Suggest
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApplyPage;