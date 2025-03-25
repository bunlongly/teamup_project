// MyProjectDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Chart } from 'react-google-charts';
import MyProjectHeader from '../components/MyProjectHeader';
import MyProjectTabs from '../components/MyProjectTabs';
import fallbackLogo from '../assets/logo.png';

function MyProjectDetailPage() {
  const { id } = useParams(); // project ID from URL
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const userId = localStorage.getItem('userId'); 
  const currentUser = { id: userId };

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // States for tabs and tasks/team members
  const [activeTab, setActiveTab] = useState('Task');
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);

  // New task form state (if needed to be passed down)
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState('Pending');

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:5200/api/post/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const proj = response.data.data;
        console.log('Fetched project:', proj);
        setProject(proj);

        // Set tasks if available
        if (proj.tasks) {
          setTasks(proj.tasks);
          console.log('Fetched tasks:', proj.tasks);
        } else {
          console.log('No tasks found in project.');
        }

        // Extract approved team members from applications
        if (proj.applications) {
          const approvedMembers = proj.applications
            .filter(app => app.status === 'APPROVED' && app.applicant)
            .map(app => app.applicant);
          console.log('Approved team members:', approvedMembers);
          setTeamMembers(approvedMembers);
        } else {
          console.log('No applications found in project.');
        }
      } catch (error) {
        console.error('Error fetching project details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, token]);

  const ownerName = project?.user
    ? `${project.user.firstName} ${project.user.lastName}`
    : 'Unknown Owner';

  // Prepare timeline chart data from project tasks
  const timelineData = [
    [
      { type: 'string', id: 'Assigned To' },
      { type: 'string', id: 'Task' },
      { type: 'date', id: 'Start' },
      { type: 'date', id: 'End' }
    ]
  ];

  if (project && project.tasks && project.tasks.length > 0) {
    project.tasks.forEach(task => {
      if (task.startDate && task.endDate) {
        const start = new Date(task.startDate);
        const end = new Date(task.endDate);
        if (start <= end) {
          timelineData.push([
            task.assignedTo
              ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
              : 'Unassigned',
            task.name,
            start,
            end
          ]);
        } else {
          console.warn(
            `Skipping task "${task.name}" because start date (${start}) is after end date (${end}).`
          );
        }
      }
    });
  }

  // -- PIE CHART #1: Finished vs Remaining --
  const totalTasks = tasks.length;
  const finishedCount = tasks.filter(task => task.status === 'FINISHED').length;
  const remainingCount = totalTasks - finishedCount;

  const pieDataFinished = [
    ['Status', 'Count'],
    ['Finished', finishedCount],
    ['Remaining', remainingCount]
  ];

  const pieOptionsFinished = {
    title: 'Finished vs. Remaining',
    pieHole: 0.4,
    slices: {
      0: { color: '#4CAF50' }, // green
      1: { color: '#F44336' } // red
    },
    animation: {
      startup: true,
      duration: 1000,
      easing: 'out'
    },
    chartArea: { width: '90%', height: '80%' },
    legend: { position: 'right' }
  };

  // -- PIE CHART #2: Breakdown by Task Status --
  const backlogCount = tasks.filter(t => t.status === 'BACKLOG').length;
  const reviewCount = tasks.filter(t => t.status === 'REVIEW').length;
  const inProgressCount = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  // We already have finishedCount from above

  const pieDataStatus = [
    ['Status', 'Count'],
    ['Backlog', backlogCount],
    ['Review', reviewCount],
    ['In Progress', inProgressCount],
    ['Finished', finishedCount]
  ];

  const pieOptionsStatus = {
    title: 'Task Status Breakdown',
    pieHole: 0.4,
    slices: {
      0: { color: '#FFC107' }, // backlog => amber
      1: { color: '#9C27B0' }, // review => purple
      2: { color: '#2196F3' }, // in progress => blue
      3: { color: '#4CAF50' } // finished => green
    },
    animation: {
      startup: true,
      duration: 1000,
      easing: 'out'
    },
    chartArea: { width: '90%', height: '80%' },
    legend: { position: 'right' }
  };

  if (loading) return <p className='p-4'>Loading project details...</p>;
  if (!project) return <p className='p-4'>Project not found.</p>;

  return (
    <div className='container mx-auto p-4'>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className='mb-4 text-blue-500 hover:underline'
      >
        &larr; Back
      </button>

      {/* Project Header */}
      <MyProjectHeader project={project} ownerName={ownerName} />

      {/* Timeline Chart Section */}
      <div className='mb-8'>
        <h2 className='text-2xl font-bold mb-4'>Project Timeline</h2>
        {timelineData.length > 1 ? (
          <div style={{ overflowX: 'auto' }}>
            <Chart
              chartType='Timeline'
              width='2000px'
              height='200px'
              data={timelineData}
              loader={<div>Loading Timeline...</div>}
              options={{
                timeline: { colorByRowLabel: true },
                chartArea: { left: 50, top: 20, width: '90%', height: '80%' },
                animation: {
                  startup: true,
                  duration: 1000,
                  easing: 'out'
                }
              }}
            />
          </div>
        ) : (
          <p>No task timeline data available.</p>
        )}
      </div>

      {/* Pie Charts Section: side by side */}
      <div className='mb-8'>
        <h2 className='text-2xl font-bold mb-4'>Task Overview</h2>

        {totalTasks > 0 ? (
          <div className='flex flex-col md:flex-row md:space-x-6'>
            {/* Pie Chart #1: Finished vs. Remaining */}
            <div className='md:w-1/2 mb-4 md:mb-0'>
              <Chart
                chartType='PieChart'
                width='100%'
                height='250px'
                data={pieDataFinished}
                loader={<div>Loading Chart...</div>}
                options={pieOptionsFinished}
              />
            </div>

            {/* Pie Chart #2: Breakdown by Status */}
            <div className='md:w-1/2'>
              <Chart
                chartType='PieChart'
                width='100%'
                height='250px'
                data={pieDataStatus}
                loader={<div>Loading Chart...</div>}
                options={pieOptionsStatus}
              />
            </div>
          </div>
        ) : (
          <p>No tasks data available for charts.</p>
        )}
      </div>

      {/* Tabs Section */}
      <MyProjectTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tasks={tasks}
        teamMembers={teamMembers}
        newTaskName={newTaskName}
        setNewTaskName={setNewTaskName}
        newTaskDueDate={newTaskDueDate}
        setNewTaskDueDate={setNewTaskDueDate}
        newTaskDescription={newTaskDescription}
        setNewTaskDescription={setNewTaskDescription}
        newTaskAssignedTo={newTaskAssignedTo}
        setNewTaskAssignedTo={setNewTaskAssignedTo}
        newTaskStatus={newTaskStatus}
        setNewTaskStatus={setNewTaskStatus}
        currentUser={currentUser}
        handleAddTask={() => {
          if (
            !newTaskName ||
            !newTaskDueDate ||
            !newTaskAssignedTo ||
            !newTaskDescription
          ) {
            alert('Please fill in all fields');
            return;
          }
          const newTask = {
            id: Date.now(), // For demo; in a real app, use a backend-generated ID.
            name: newTaskName,
            dueDate: newTaskDueDate,
            description: newTaskDescription,
            attachment: null,
            status: newTaskStatus,
            assignedTo: newTaskAssignedTo
          };
          setTasks(prev => [...prev, newTask]);
          
          // Clear form fields.
          setNewTaskName('');
          setNewTaskDueDate('');
          setNewTaskDescription('');
          setNewTaskAssignedTo('');
          setNewTaskStatus('Pending');
          alert('Task created successfully!');
        }}
        project={project}
        ownerName={ownerName}
      />
    </div>
  );
}

export default MyProjectDetailPage;
