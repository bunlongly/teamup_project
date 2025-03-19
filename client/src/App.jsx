import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/Home";
import SignUpPage from "./pages/SignUp";
import NavBar from "./components/NavBar";
import ProjectManagement from "./components/ProjectManagement";
import ApplyJob from "./pages/ApplyPage";
import Profile from "./pages/ProfilePage";
import CandidatePage from "./pages/CandidatesPage";
import NetworkPage from "./pages/NetworkPage";


function App() {
  return (
    <Router>
      <div className="App">
        <NavBar />

        {/* Define the routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/projects/*" element={<ProjectManagement />} />
          <Route path="/apply" element={<ApplyJob />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/candidates" element={<CandidatePage />} />
          <Route path="/network" element={<NetworkPage />} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;