import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate
} from 'react-router-dom';
import PropTypes from 'prop-types';
import HomePage from './pages/Home';
import SignUpPage from './pages/SignUp';
import SignInPage from './pages/SignIn';
import NavBar from './components/NavBar';
import ProjectManagement from './components/ProjectManagement';
import ApplyJob from './pages/ApplyPage';
import Profile from './pages/ProfilePage';
import CandidatePage from './pages/CandidatesPage';
import NetworkPage from './pages/NetworkPage';
import NotificationPage from './pages/NotificationPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import MyProjects from './pages/MyProjects';
import MyProjectDetailPage from './pages/MyProjectDetailPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  console.log('Token:', token);

  if (!token) {
    return <Navigate to='/signin' replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired
};

function App() {
  const location = window.location.pathname;
  const showNavBar = !['/signup', '/signin'].includes(location);

  return (
    <Router>
      <div className='App'>
        {showNavBar && <NavBar />}
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/signup' element={<SignUpPage />} />
          <Route path='/signin' element={<SignInPage />} />
          <Route
            path='/projects/*'
            element={
              <ProtectedRoute>
                <ProjectManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path='/network'
            element={
              <ProtectedRoute>
                <NetworkPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/projects/detail/:id'
            element={
              <ProtectedRoute>
                <ProjectDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/apply'
            element={
              <ProtectedRoute>
                <ApplyJob />
              </ProtectedRoute>
            }
          />
          <Route
            path='/profile/:id'
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path='/notifications'
            element={
              <ProtectedRoute>
                <NotificationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/candidates'
            element={
              <ProtectedRoute>
                <CandidatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/my-projects'
            element={
              <ProtectedRoute>
                <MyProjects />
              </ProtectedRoute>
            }
          />
          <Route
            path='/my-projects/:id'
            element={
              <ProtectedRoute>
                <MyProjectDetailPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
