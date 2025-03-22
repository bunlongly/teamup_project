import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import fallbackLogo from '../assets/logo.png';

function MyProjectDetailPage() {
  const { id } = useParams(); // project ID from the URL
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        // Adjust your backend route if needed (e.g., "/api/post/:id")
        const response = await axios.get(`http://localhost:5200/api/post/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Assuming response.data.data is the project object
        setProject(response.data.data);
      } catch (error) {
        console.error('Error fetching project details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, token]);

  if (loading) return <p className="p-4">Loading project details...</p>;
  if (!project) return <p className="p-4">Project not found.</p>;

  return (
    <div className="container mx-auto p-4">
      {/* Optional Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-500 hover:underline"
      >
        &larr; Back
      </button>

      {/* Project Info */}
      <div className="bg-white rounded-md shadow p-6">
        {/* Header Section */}
        <div className="flex items-center mb-4">
          <img
            src={project.fileUrl || fallbackLogo}
            alt="Project"
            className="w-20 h-20 object-contain rounded mr-4"
          />
          <div>
            <h1 className="text-2xl font-bold">
              {project.projectName || 'Untitled Project'}
            </h1>
            <p className="text-sm text-gray-600">
              {project.postType || 'STATUS'}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="mb-4 text-gray-700">
          {project.projectDescription || 'No description provided.'}
        </p>

        {/* Candidates List */}
        <h2 className="text-xl font-semibold mb-2">Candidates</h2>
        {project.applications && project.applications.length > 0 ? (
          <div className="space-y-2">
            {project.applications.map((app) => {
              if (!app.applicant) return null; // defensive check
              const fullName = `${app.applicant.firstName} ${app.applicant.lastName}`;
              return (
                <div key={app.id} className="p-2 bg-gray-100 rounded flex items-center">
                  {/* Candidate Avatar */}
                  <img
                    src={app.applicant.imageUrl || fallbackLogo}
                    alt="Candidate"
                    className="w-10 h-10 object-cover rounded-full mr-3 cursor-pointer"
                    onClick={() => navigate(`/profile/${app.applicant.id}`)}
                  />
                  <div className="flex-1">
                    <h4 className="font-bold">{fullName}</h4>
                    <p className="text-xs text-gray-600">
                      {app.applicant.jobTitle || 'Web Developer'}
                    </p>
                  </div>
                  {/* Status Badge */}
                  <div>
                    {app.status === 'APPROVED' && (
                      <span className="px-2 py-1 text-xs bg-green-600 text-white rounded-full">
                        Approved
                      </span>
                    )}
                    {app.status === 'PENDING' && (
                      <span className="px-2 py-1 text-xs bg-blue-500 text-white rounded-full">
                        Pending
                      </span>
                    )}
                    {app.status === 'REJECTED' && (
                      <span className="px-2 py-1 text-xs bg-red-600 text-white rounded-full">
                        Rejected
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-600">
            No candidates have applied to this project.
          </p>
        )}
      </div>
    </div>
  );
}

export default MyProjectDetailPage;
