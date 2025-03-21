import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import fallbackLogo from '../assets/logo.png';

function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  // applicationStatus is null initially (meaning no application yet)
  // When applied, it will be set to "PENDING", "APPROVED", or "REJECTED"
  const [applicationStatus, setApplicationStatus] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProject = async () => {
      try {
        // Fetch project details from your backend
        const response = await axios.get(
          `http://localhost:5200/api/post/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setProject(response.data.data);
      } catch (error) {
        console.error('Error fetching project details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, token]);

  // Handler for applying to the project
  const handleApply = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5200/api/application/apply',
        { postId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Assuming your backend returns { data: application, message: '...' }
      setApplicationStatus(response.data.data.status); // Should be "PENDING"
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
        {/* Show application status if applied, otherwise show Apply button */}
        {applicationStatus ? (
          <div className='p-4 bg-gray-100 border rounded'>
            {applicationStatus === 'PENDING' && (
              <p className='text-sm text-blue-600'>Application Pending</p>
            )}
            {applicationStatus === 'APPROVED' && (
              <p className='text-sm text-green-600'>Application Approved</p>
            )}
            {applicationStatus === 'REJECTED' && (
              <p className='text-sm text-red-600'>Application Rejected</p>
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
    </div>
  );
}

export default ProjectDetailPage;
