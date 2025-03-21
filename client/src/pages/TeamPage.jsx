import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const TeamPage = () => {
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState([
    {
      name: "John Doe",
      role: "Project Manager",
      profilePic: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    {
      name: "Jane Smith",
      role: "Developer",
      profilePic: "https://randomuser.me/api/portraits/women/2.jpg",
    },
    {
      name: "Michael Brown",
      role: "Designer",
      profilePic: "https://randomuser.me/api/portraits/men/3.jpg",
    },
  ]);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("");
  const [newMemberPic, setNewMemberPic] = useState("");

  const handleAddMember = () => {
    if (newMemberName.trim() && newMemberRole.trim() && newMemberPic.trim()) {
      setTeamMembers([
        ...teamMembers,
        { name: newMemberName, role: newMemberRole, profilePic: newMemberPic },
      ]);
      setNewMemberName("");
      setNewMemberRole("");
      setNewMemberPic("");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100 p-6 space-y-6 lg:space-y-0">
      {/* Left Panel: Team Members */}
      <div className="flex flex-col space-y-6 lg:w-3/4">
        {/* Top Navigation Buttons */}
        <div className="flex space-x-4">
          <button
            className="flex items-center px-4 py-2 bg-gray-200 text-black rounded"
            onClick={() => navigate("/my-projects")}
          >
            <FontAwesomeIcon icon={faUsers} className="mr-2" /> Task
          </button>
          <button
            className="flex items-center px-4 py-2 bg-[#0046B0] text-white rounded"
            onClick={() => navigate("/team")}
          >
            <FontAwesomeIcon icon={faUsers} className="mr-2" /> Team
          </button>
        </div>

        {/* Team Members List */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Team Members</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="flex flex-col items-center bg-gray-100 p-4 rounded-lg shadow"
              >
                <img
                  src={member.profilePic}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mb-4 object-cover"
                />
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <p className="text-sm text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Add New Team Member */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Add New Team Member</h2>
          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Enter Member Name"
                className="p-2 border rounded w-full"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Enter Member Role"
                className="p-2 border rounded w-full"
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value)}
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Enter Profile Picture URL"
                className="p-2 border rounded w-full"
                value={newMemberPic}
                onChange={(e) => setNewMemberPic(e.target.value)}
              />
            </div>
            <button
              className="flex items-center px-4 py-2 bg-[#0046B0] text-white rounded mt-4"
              onClick={handleAddMember}
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add Member
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="lg:w-1/4 space-y-6 ml-4 mt-16">
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-[#0046B0] font-semibold">Project Overview</h3>
          <p className="text-sm text-gray-600">Web Development</p>
          <p className="text-sm text-gray-600">Mobile Development</p>
          <p className="text-sm text-gray-600">UX/UI Design</p>
        </div>

        {/* Additional Panel */}
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-[#0046B0] font-semibold">Team Status</h3>
          <p className="text-sm text-gray-600">Status: Active</p>
          <p className="text-sm text-gray-600">Members: {teamMembers.length}</p>
        </div>
      </div>
    </div>
  );
};

export default TeamPage;
