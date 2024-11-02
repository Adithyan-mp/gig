import React from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';

const JobDetailsCardDisplay = ({ job, onClose, onCancel, showCancel, isChecked, setIsChecked, loading, showChat }) => {
  const navigate = useNavigate();
  
  if (!job) return null;

  // Function to handle checkbox change
  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
    console.log('Checkbox is now:', !isChecked); // Log checkbox state
  };

  // Function to start chat
  const startChat = () => {
    navigate(`/seekerchat/${job.jobId}`); // Adjust as needed for route and ID structure
  };

  // Create a portal for the modal
  const modalContent = (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
        {/* Close Button */}
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-800" onClick={onClose}>
          &times;
        </button>
        
        {/* Job Title */}
        <h2 className="text-2xl font-semibold mb-4">{job.title}</h2>
        
        {/* Job Details */}
        <p className="mb-2 text-gray-700"><strong>Role: </strong>{job.role}</p>
        <p className="mb-2"><strong>Location:</strong> {job.location}</p>
        <p className="mb-2"><strong>Shift:</strong> {job.shift}</p>
        <p className="mb-2"><strong>Time:</strong> {job.time}</p>
        <p className="mb-2"><strong>Salary:</strong> {job.salary}</p>
        <p className="mb-2"><strong>Contact:</strong> {job.contact}</p>
        <p className='mb-2'><strong>Job Description:</strong></p>
        <p className='mb-4'>{job.description}</p>
        
        {/* Conditionally render the Cancel Application Button */}
        {showCancel && (
          <>
            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={handleCheckboxChange}
                className="mr-2"
              />
              <label className="text-gray-700">Check this box to confirm cancellation</label>
            </div>
            <button 
              className="w-full mt-2 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              onClick={onCancel} // Use the passed onCancel function
              disabled={!isChecked || loading} // Disable button if checkbox is not checked or if loading
            >
              {loading ? 'Cancelling...' : 'Cancel Application'}
            </button>
          </>
        )}
        
        {/* Conditionally render the Chat Now Button */}
        {showChat && (
          <button 
            onClick={startChat} 
            className="w-full mt-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Chat Now
          </button>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(
    modalContent,
    document.body // Render the modal in the body
  );
};

export default JobDetailsCardDisplay;
