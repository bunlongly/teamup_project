import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import fallbackLogo from '../assets/logo.png';

function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  // applicationStatus holds the current user's application status if it exists
  const [applicationStatus, setApplicationStatus] = useState(null);
  const token = localStorage.getItem('token');
  // Assume the current user's id is stored in localStorage
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchProject = async () => {
      try {
        // Ensure your backend endpoint includes applications (see note below)
        const response = await axios.get(
          `http://localhost:5200/api/post/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        const fetchedProject = response.data.data;
        setProject(fetchedProject);

        // If the project includes applications, check if current user has applied.
        if (fetchedProject && fetchedProject.applications) {
          const userApplication = fetchedProject.applications.find(
            app => app.applicantId === currentUserId
          );
          if (userApplication) {
            setApplicationStatus(userApplication.status);
          }
        }
      } catch (error) {
        console.error('Error fetching project details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, token, currentUserId]);

  // Handler for applying to the project (for non-owners)
  const handleApply = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5200/api/application/apply',
        { postId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Assuming response.data.data.status is set to "PENDING"
      setApplicationStatus(response.data.data.status);
    } catch (error) {
      console.error('Error applying to project:', error);
      // Optionally display an error message to the user
    }
  };

  if (loading) {
    return <p className='p-4'>Loading project details...</p>;
  }

  if (!project) {
    return <p className='p-4'>Project not found.</p>;
  }

  // Check if current user is the owner of the project
  const isOwner = project.userId === currentUserId;
  // Fallback: if applications field is undefined, use an empty array.
  const applicationCount = project.applications
    ? project.applications.length
    : 0;

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-3xl font-bold mb-4'>
        {project.projectName || 'Untitled Project'}
      </h1>
      <div className='flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6'>
        {/* Project Image */}
        <div className='w-full md:w-1/3'>
          {project.fileUrl ? (
            <img
              src={project.fileUrl}
              alt='Project'
              className='w-full h-auto rounded-md shadow'
            />
          ) : (
            <img
              src={fallbackLogo}
              alt='Default Logo'
              className='w-full h-auto rounded-md'
            />
          )}
        </div>
        {/* Project Details */}
        <div className='w-full md:w-2/3'>
          <p className='mb-2'>
            <strong>Description:</strong> {project.projectDescription || 'N/A'}
          </p>
          <p className='mb-2'>
            <strong>Project Type:</strong> {project.projectType || 'N/A'}
          </p>
          <p className='mb-2'>
            <strong>Platform:</strong> {project.platform || 'N/A'}
          </p>
          <p className='mb-2'>
            <strong>Duration:</strong> {project.duration || 'N/A'}
          </p>
          <p className='mb-2'>
            <strong>Location:</strong> {project.location || 'N/A'}
          </p>
          {project.technicalRole && (
            <p className='mb-2'>
              <strong>Technical Role:</strong> {project.technicalRole}
            </p>
          )}
          {project.requirement && (
            <p className='mb-2'>
              <strong>Requirement:</strong> {project.requirement}
            </p>
          )}
        </div>
      </div>

      <div className='mt-8'>
        {isOwner ? (
          <div className='p-4 bg-gray-100 border rounded'>
            <p className='text-sm text-gray-700'>
              Total Applications: {applicationCount}
            </p>
            {/* Optionally, you can list or link to detailed applications */}
          </div>
        ) : (
          <div>
            {applicationStatus ? (
              <div className='p-4 bg-gray-100 border rounded'>
                {applicationStatus === 'PENDING' && (
                  <p className='text-sm text-blue-600'>
                    Your application is pending approval.
                  </p>
                )}
                {applicationStatus === 'APPROVED' && (
                  <p className='text-sm text-green-600'>
                    Your application has been approved.
                  </p>
                )}
                {applicationStatus === 'REJECTED' && (
                  <p className='text-sm text-red-600'>
                    Your application was rejected.
                  </p>
                )}
              </div>
            ) : (
              <button
                onClick={handleApply}
                className='mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
              >
                Apply
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectDetailPage;
