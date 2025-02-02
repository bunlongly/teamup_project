import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import HomePage from './pages/Home';

function App() {
  return (
    <Router>
      <div className='App'>
        <nav className='p-4 bg-indigo-600 text-white'>
          <ul className='flex space-x-4'>
            <li>
              <Link to='/' className='hover:text-indigo-200'>
                Home
              </Link>
            </li>
          </ul>
        </nav>

        {/* Define the routes */}
        <Routes>
          <Route path='/' element={<HomePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
