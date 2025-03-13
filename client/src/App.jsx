import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate
} from 'react-router-dom';
import PropTypes from 'prop-types'; // Import PropTypes
import Cookies from 'js-cookie'; // Import js-cookie
import HomePage from './pages/Home';
import SignUpPage from './pages/SignUp';
import SignInPage from './pages/SignIn'; // Assuming you have a SignInPage
import NavBar from './components/NavBar';
import ProjectManagement from './components/ProjectManagement';
import ApplyJob from './pages/ApplyPage';
import Profile from './pages/ProfilePage';
import CandidatePage from './pages/CandidatesPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = Cookies.get('token'); // Get the token cookie

  if (!token) {
    // If not authenticated, redirect to the sign-in page
    return <Navigate to='/signin' replace />;
  }

  // If authenticated, render the children (protected component)
  return children;
};

// Add PropTypes validation for the ProtectedRoute component
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired // Validate that children is a valid React node and is required
};

function App() {
  const location = window.location.pathname; // Get the current route

  // Conditionally render the NavBar
  const showNavBar = !['/signup', '/signin'].includes(location);

  return (
    <Router>
      <div className='App'>
        {showNavBar && <NavBar />} {/* Render NavBar conditionally */}
        {/* Define the routes */}
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/signup' element={<SignUpPage />} />
          <Route path='/signin' element={<SignInPage />} />

          {/* Protected Routes */}
          <Route
            path='/projects/*'
            element={
              <ProtectedRoute>
                <ProjectManagement />
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
            path='/profile'
            element={
              <ProtectedRoute>
                <Profile />
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
