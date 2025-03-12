import React from "react";
import { useLocation } from "react-router-dom";
import logo from "../assets/logo.png";

function CandidatePage() {
  const location = useLocation();
  const { state } = location;
  const { role, requirement, projectname, projecttype, startdate, enddate, location: projectLocation, description, candidateProfile } = state;

  return (
    <div className="candidate-page">
      <div className="grid grid-cols-10 w-4/5 mx-auto main-container space-x-8">
        <div className="col-span-7 candidate-left-col">
          <div className="candidate-detail bg-white mb-4 rounded-md shadow-md overflow-hidden details-container">
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
                    {projectname}
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
                      <strong>Project Type:</strong>
                      {projecttype}
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
                      <strong>Start Date:</strong>
                      {startdate}
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
                      <strong>End Date:</strong>
                      {enddate}
                    </p>
                  </div>
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
                      <strong>Location:</strong>
                      {projectLocation}
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
                      <strong>Role:</strong>
                      {role}
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
                      <strong>Requirement:</strong>
                      {requirement}
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
                    {description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-3 candidate-right-col">
          <div className="candidate-profile bg-white p-4 rounded-md shadow-md">
            <h3 className="text-lg font-bold mb-4">Candidate Profile</h3>
            {/* Display candidate profile information here */}
            <p><strong>Name:</strong> John Doe</p>
            <p><strong>Email:</strong> john.doe@example.com</p>
            <p><strong>Skills:</strong> {candidateProfile.skills.join(", ")}</p>
            <p><strong>Experience:</strong> {candidateProfile.experience.map(exp => `${exp.title} at ${exp.company}`).join(", ")}</p>
            <p><strong>Education:</strong> {candidateProfile.education.map(edu => `${edu.degree} from ${edu.school}`).join(", ")}</p>
            <p><strong>Portfolio:</strong> <a href={candidateProfile.portfolioLink} target="_blank" rel="noopener noreferrer">{candidateProfile.portfolioLink}</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CandidatePage;