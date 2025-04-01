// src/components/Toastify.jsx
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Toastify() {
  return (
    <ToastContainer
      position="top-right" // Default position
      autoClose={5000}    // Default autoClose duration (5 seconds)
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"       
    />
  );
}

export default Toastify;

