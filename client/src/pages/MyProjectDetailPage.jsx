import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MyProjectTabs from '../components/MyProjectTabs';
import MyProjectHeader from '../components/MyProjectHeader';
import fallbackLogo from '../assets/logo.png';

function MyProjectDetailPage() {
  const { id } = useParams(); // project ID from the URL
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // State for project data and loading
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // States for the tabs and task management
  const [activeTab, setActiveTab] = useState('Task');
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([
    { id: 'u1', name: 'John Doe', role: 'Project Manager' },
    { id: 'u2', name: 'Jane Smith', role: 'Developer' },
    { id: 'u3', name: 'Michael Brown', role: 'Designer' }
  ]);

  // New task form state
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState('Pending');

  // Fetch project details from the backend
  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:5200/api/post/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setProject(response.data.data);
        // If the backend returns tasks as a relation, you can set them:
        if (response.data.data.tasks) {
          setTasks(response.data.data.tasks);
        }
      } catch (error) {
        console.error('Error fetching project details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id, token]);

  // Compute owner name from project data
  const ownerName = project?.user
    ? `${project.user.firstName} ${project.user.lastName}`
    : 'Unknown Owner';

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

      {/* Project Header Section */}
      <MyProjectHeader project={project} ownerName={ownerName} />

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
            id: Date.now(), // For demo purposes; in a real app, use a backend-generated ID.
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
        }}
        project={project}
        ownerName={ownerName}
      />
    </div>
  );
}

export default MyProjectDetailPage;
