// src/pages/ProjectDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import fallbackLogo from '../assets/logo.png';
import { motion, AnimatePresence } from 'framer-motion';

function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  // applicationStatus holds the current user's application status if it exists
  const [applicationStatus, setApplicationStatus] = useState(null);
  const token = localStorage.getItem('token');
  const currentUserId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5200/api/post/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const fetchedProject = response.data.data;
        setProject(fetchedProject);

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

  const handleApply = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5200/api/application/apply',
        { postId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApplicationStatus(response.data.data.status);
    } catch (error) {
      console.error('Error applying to project:', error);
    }
  };

  if (loading) {
    return (
      <p className='p-4 text-center text-gray-600'>
        Loading project details...
      </p>
    );
  }

  if (!project) {
    return <p className='p-4 text-center text-gray-600'>Project not found.</p>;
  }

  const isOwner = project.userId === currentUserId;
  const applications = project.applications || [];
  const totalApplications = applications.length;
  const pendingCount = applications.filter(
    app => app.status === 'PENDING'
  ).length;
  const approvedCount = applications.filter(
    app => app.status === 'APPROVED'
  ).length;
  const rejectedCount = applications.filter(
    app => app.status === 'REJECTED'
  ).length;

  // Framer Motion variants for the application section.
  const summaryVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
  };

  return (
    <div className='container mx-auto p-6'>
      <motion.h1
        className='text-4xl font-extrabold text-blue-800 mb-6 text-center'
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {project.projectName || 'Untitled Project'}
      </motion.h1>

      {/* Using a column layout for image and details */}
      <div className='flex flex-col gap-8'>
        {/* Project Image (Centered) */}
        <motion.div
          className='w-full md:w-1/2 mx-auto'
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {project.fileUrl ? (
            <img
              src={project.fileUrl}
              alt='Project'
              className='w-full h-auto rounded-md shadow-lg'
            />
          ) : (
            <img
              src={fallbackLogo}
              alt='Default Logo'
              className='w-full h-auto rounded-md shadow-lg'
            />
          )}
        </motion.div>

        {/* Project Details (Left-aligned) */}
        <motion.div
          className='w-full text-left space-y-4 text-gray-700'
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p>
            <strong>Description:</strong> {project.projectDescription || 'N/A'}
          </p>
          <p>
            <strong>Project Type:</strong> {project.projectType || 'N/A'}
          </p>
          <p>
            <strong>Platform:</strong> {project.platform || 'N/A'}
          </p>
          <p>
            <strong>Duration:</strong> {project.duration || 'N/A'}
          </p>
          <p>
            <strong>Location:</strong> {project.location || 'N/A'}
          </p>
          {project.technicalRole && (
            <p>
              <strong>Technical Role:</strong> {project.technicalRole}
            </p>
          )}
          {project.requirement && (
            <p>
              <strong>Requirement:</strong> {project.requirement}
            </p>
          )}
        </motion.div>
      </div>

      {/* Application / Project Seeking Section */}
      {project.postType !== 'PROJECT_SEEKING' && (
        <AnimatePresence>
          <motion.div
            key='applicationSection'
            variants={summaryVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
            transition={{ duration: 0.5 }}
            className='mt-10 p-6 bg-white border rounded-lg shadow-md'
          >
            {isOwner ? (
              <>
                <h2 className='text-xl font-bold text-gray-800 mb-4'>
                  Application Summary
                </h2>
                <p className='text-sm text-gray-700'>
                  Total Applications: {totalApplications}
                </p>
                <div className='flex space-x-4 mt-3'>
                  <span className='px-3 py-1 text-sm font-semibold text-white bg-yellow-500 rounded-full'>
                    Pending: {pendingCount}
                  </span>
                  <span className='px-3 py-1 text-sm font-semibold text-white bg-green-600 rounded-full'>
                    Approved: {approvedCount}
                  </span>
                  <span className='px-3 py-1 text-sm font-semibold text-white bg-red-600 rounded-full'>
                    Rejected: {rejectedCount}
                  </span>
                </div>
                <div className='flex justify-center mt-6'>
                  <button
                    onClick={() => navigate(`/candidates`)}
                    className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                  >
                    View Candidates
                  </button>
                </div>
              </>
            ) : (
              <>
                {applicationStatus ? (
                  <div className='p-4'>
                    {applicationStatus === 'PENDING' && (
                      <div className='bg-yellow-100 border border-yellow-200 rounded-lg p-4'>
                        <p className='text-sm text-yellow-800'>
                          Your application is pending approval.
                        </p>
                      </div>
                    )}
                    {applicationStatus === 'APPROVED' && (
                      <div className='bg-green-100 border border-green-200 rounded-lg p-4'>
                        <p className='text-sm text-green-800'>
                          Congratulations! Your application has been approved.
                        </p>
                      </div>
                    )}
                    {applicationStatus === 'REJECTED' && (
                      <div className='bg-red-100 border border-red-200 rounded-lg p-4'>
                        <p className='text-sm text-red-800'>
                          Your application was rejected.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className='flex justify-center'>
                    <button
                      onClick={handleApply}
                      className='mt-4 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow'
                    >
                      Apply
                    </button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

export default ProjectDetailPage;
