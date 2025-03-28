import React, { useState, useEffect } from 'react';
import axios from 'axios';
import fallbackAvatar from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

function MyCandidatesPage() {
  // viewMode: "Applicants" (for owners) or "My Applications" (for candidates)
  const [viewMode, setViewMode] = useState('Applicants');
  const [applications, setApplications] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  // statusFilter controlled by tabs: "All", "PENDING", "APPROVED", "REJECTED"
  const [statusFilter, setStatusFilter] = useState('All');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // Fetch applications based on viewMode
  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        let url = 'http://localhost:5200/api/application/all';
        if (viewMode === 'My Applications') {
          url = 'http://localhost:5200/api/application/my';
        }
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApplications(response.data.data);
        setFilteredApps(response.data.data);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [token, viewMode]);

  // Update filtered applications when filterText or statusFilter changes.
  useEffect(() => {
    const lowerFilter = filterText.toLowerCase();
    const filtered = applications.filter(app => {
      // For both views, we'll filter by the candidate's name/job title.
      const { applicant, status } = app;
      const fullName =
        `${applicant.firstName} ${applicant.lastName}`.toLowerCase();
      const jobTitle = applicant.jobTitle
        ? applicant.jobTitle.toLowerCase()
        : '';
      const matchesText =
        fullName.includes(lowerFilter) || jobTitle.includes(lowerFilter);
      const matchesStatus =
        statusFilter === 'All' ? true : status === statusFilter;
      return matchesText && matchesStatus;
    });
    setFilteredApps(filtered);
  }, [filterText, statusFilter, applications]);

  // For owner view, group applications by postId.
  const grouped =
    viewMode === 'Applicants'
      ? filteredApps.reduce((acc, app) => {
          const { postId } = app;
          if (!acc[postId]) acc[postId] = [];
          acc[postId].push(app);
          return acc;
        }, {})
      : null; // For "My Applications", we display a flat list

  const handleUpdateStatus = async (applicationId, newStatus) => {
    try {
      await axios.post(
        `http://localhost:5200/api/application/update/${applicationId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (newStatus === 'APPROVED') {
        // Remove the application from the list if approved
        setApplications(prev => prev.filter(app => app.id !== applicationId));
      } else {
        // Otherwise, update its status
        setApplications(prev =>
          prev.map(app =>
            app.id === applicationId ? { ...app, status: newStatus } : app
          )
        );
      }
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  if (loading) return <p className='p-4'>Loading applications...</p>;
  if (!applications.length)
    return <p className='p-4'>No applications found.</p>;

  return (
    <div className='container mx-auto p-4'>
      {/* Main View Mode Tabs */}
      <div className='mb-4 border-b'>
        <ul className='flex space-x-6'>
          {['Applicants', 'My Applications'].map(tab => (
            <li
              key={tab}
              onClick={() => {
                setViewMode(tab);
                setFilterText('');
                setStatusFilter('All');
              }}
              className={`cursor-pointer pb-2 transition-all duration-300 ${
                viewMode === tab
                  ? 'border-b-2 border-blue-500 font-semibold text-gray-800'
                  : 'text-gray-500 hover:border-b-2 hover:border-blue-300'
              }`}
            >
              {tab}
            </li>
          ))}
        </ul>
      </div>

      {/* Filter Panel (Always on the Right) */}
      <div className='grid grid-cols-1 md:grid-cols-12 gap-6'>
        <div className='md:col-span-8'>
          {viewMode === 'Applicants' ? (
            // Owner view: Group applications by project
            Object.keys(grouped).length === 0 ? (
              <p className='p-4'>No candidates match your filters.</p>
            ) : (
              Object.keys(grouped).map(postId => {
                const apps = grouped[postId];
                const projectName =
                  apps[0].post?.projectName || 'Untitled Project';
                return (
                  <div key={postId} className='mb-8'>
                    <div className='mb-2'>
                      <h2 className='text-xl font-semibold text-gray-800'>
                        Project: {projectName}
                      </h2>
                      <p className='text-sm text-gray-600'>
                        Number of Candidates: {apps.length}
                      </p>
                    </div>
                    <TransitionGroup>
                      {apps.map(app => {
                        const { id, status, applicant } = app;
                        const fullName = `${applicant.firstName} ${applicant.lastName}`;
                        const userImage = applicant.imageUrl || fallbackAvatar;
                        const userBio = applicant.bio || 'No bio provided.';
                        return (
                          <CSSTransition
                            key={id}
                            timeout={300}
                            classNames='fade'
                          >
                            <div className='bg-white rounded-md shadow p-4 flex items-center mb-4'>
                              <img
                                src={userImage}
                                alt='Applicant Avatar'
                                className='w-16 h-16 rounded-full object-cover mr-4 cursor-pointer'
                                onClick={() =>
                                  navigate(`/profile/${applicant.id}`)
                                }
                              />
                              <div className='flex-1'>
                                <div className='flex items-center justify-between mb-1'>
                                  <h3 className='text-md font-bold text-gray-800'>
                                    {fullName}
                                  </h3>
                                  <span className='text-sm text-gray-500 italic'>
                                    {applicant.jobTitle || 'Web Developer'}
                                  </span>
                                </div>
                                <p className='text-sm text-gray-700'>
                                  {userBio.length > 100
                                    ? userBio.substring(0, 100) + '...'
                                    : userBio}
                                </p>
                              </div>
                              <div className='flex flex-col items-end space-y-2 ml-4'>
                                <div className='flex space-x-2'>
                                  {status === 'PENDING' && (
                                    <span className='px-2 py-1 text-xs font-semibold text-white bg-blue-500 rounded-full'>
                                      Pending
                                    </span>
                                  )}
                                  {status === 'APPROVED' && (
                                    <span className='px-2 py-1 text-xs font-semibold text-white bg-green-600 rounded-full'>
                                      Approved
                                    </span>
                                  )}
                                  {status === 'REJECTED' && (
                                    <span className='px-2 py-1 text-xs font-semibold text-white bg-red-600 rounded-full'>
                                      Rejected
                                    </span>
                                  )}
                                </div>
                                <div className='flex space-x-2'>
                                  <button
                                    onClick={() =>
                                      handleUpdateStatus(app.id, 'REJECTED')
                                    }
                                    className='px-3 py-1 text-xs bg-red-100 text-red-600 border border-red-300 rounded hover:bg-red-200'
                                  >
                                    Reject
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleUpdateStatus(app.id, 'APPROVED')
                                    }
                                    className='px-3 py-1 text-xs bg-green-100 text-green-600 border border-green-300 rounded hover:bg-green-200'
                                  >
                                    Approve
                                  </button>
                                </div>
                              </div>
                            </div>
                          </CSSTransition>
                        );
                      })}
                    </TransitionGroup>
                  </div>
                );
              })
            )
          ) : (
            // Candidate view: My Applications (flat list)
            <div className='space-y-8'>
              <TransitionGroup>
                {filteredApps.map(app => {
                  const { id, status, post } = app;
                  const projectName = post?.projectName || 'Untitled Project';
                  const projectDesc =
                    post?.projectDescription || 'No description available.';
                  return (
                    <CSSTransition key={id} timeout={300} classNames='fade'>
                      <div
                        className='bg-white rounded-md shadow p-4 mb-4 flex items-center cursor-pointer'
                        onClick={() => navigate(`/projects/detail/${post.id}`)}
                      >
                        <div className='w-24 h-24 mr-4'>
                          {post?.fileUrl ? (
                            <img
                              src={post.fileUrl}
                              alt='Project'
                              className='w-full h-full rounded-md object-cover'
                            />
                          ) : (
                            <img
                              src={fallbackAvatar}
                              alt='Default'
                              className='w-full h-full rounded-md'
                            />
                          )}
                        </div>
                        <div className='flex-1'>
                          <h2 className='text-lg font-bold text-gray-800'>
                            {projectName}
                          </h2>
                          <p className='text-sm text-gray-600'>
                            {projectDesc.length > 100
                              ? projectDesc.substring(0, 100) + '...'
                              : projectDesc}
                          </p>
                          <p className='text-sm text-gray-600'>
                            Application Status:{' '}
                            <span
                              className={
                                status === 'PENDING'
                                  ? 'text-blue-600'
                                  : status === 'APPROVED'
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }
                            >
                              {status}
                            </span>
                          </p>
                        </div>
                      </div>
                    </CSSTransition>
                  );
                })}
              </TransitionGroup>
            </div>
          )}
        </div>

        {/* Right Column: Filter Panel */}
        <div className='md:col-span-4 mt-8'>
          <div className='bg-white rounded-md shadow p-4 mb-6'>
            <h2 className='text-xl font-semibold text-gray-800 mb-4'>
              Filter Candidates
            </h2>
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700'>
                Search by Name or Job Title
              </label>
              <input
                type='text'
                value={filterText}
                onChange={e => setFilterText(e.target.value)}
                className='mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                placeholder='Enter name or job title'
              />
            </div>
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700'>
                Application Status
              </label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className='mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
              >
                <option value='All'>All</option>
                <option value='PENDING'>Pending</option>
                <option value='APPROVED'>Approved</option>
                <option value='REJECTED'>Rejected</option>
              </select>
            </div>
            <button
              onClick={() => {
                // Filtering is handled automatically via useEffect
              }}
              className='w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
            >
              Apply Filter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyCandidatesPage;
