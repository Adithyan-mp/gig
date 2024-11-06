import React, { useState, useEffect } from 'react';
import InputField from './InputField'; // Reusable input component
import CheckboxField from './CheckboxField'; // Reusable checkbox component
import axios from 'axios'; // For making API requests
import { useNavigate, useLocation } from 'react-router-dom';

const inputFields = [
  { label: 'NAME', type: 'text', name: 'name' },
  { label: 'EMAIL ID', type: 'email', name: 'email' },
  { label: 'UserId', type: 'text', name: 'userId' },
  { label: 'Company', type: 'text', name: 'company' },
  { label: 'Industry', type: 'text', name: 'industry' },
  { label: 'Location', type: 'text', name: 'location' },
  { label: 'Address', type: 'text', name: 'address' },
  { label: 'ph-No', type: 'tel', name: 'phone' },
  { label: 'Password', type: 'password', name: 'password' },
  { label: 'Confirm Password', type: 'password', name: 'confirmPassword' }
];

function UserRegistration() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    userId: '',
    company: '',
    industry: '',
    location: '',
    address: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [token, setToken] = useState('');

  // Extract token from the URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenFromUrl = params.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [location.search]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Function to verify token
  const verifyToken = async (token) => {
    try {
      const response = await axios.post('/verify-token', { token });
      return response.data.isValid;
    } catch (error) {
      console.error("Token verification error:", error);
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Password match validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      // Verify the token from the URL
      const isTokenValid = await verifyToken(token);
      if (isTokenValid) {
        // Proceed to create the provider
        const response = await axios.post('/api/providerCreation', formData);

        if (response.status === 201) {
          // Token is valid, store the token
          localStorage.setItem('authToken', token);
          setSuccess('Registration successful!');

          // Reset form fields
          setFormData({
            name: '',
            email: '',
            userId: '',
            company: '',
            industry: '',
            location: '',
            address: '',
            phone: '',
            password: '',
            confirmPassword: ''
          });

          // Navigate to login page after successful registration
          navigate('/login');
        }
      } else {
        setError('Token verification failed. Please try registering again.');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Registration failed. Try again.');
      }
    }
  };

  return (
    <main className="flex flex-col rounded-none bg-gray-800 min-h-screen">
      <header className="z-10 -mt-3 text-4xl font-semibold text-white max-md:max-w-full">
        Create your account today and unlock endless opportunities!
      </header>
      <section className="flex flex-col self-center py-16 pr-20 pl-9 mt-16 max-w-full text-xl font-medium text-black bg-white rounded-[30px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] w-[656px] max-md:px-5 max-md:mt-10">
        <h1 className="text-2xl font-semibold text-center text-teal-600 w-[518px] max-md:max-w-full mb-[20px]">
          USER DETAILS
        </h1>
        <form className="text-left flex flex-wrap gap-0.5 items-start max-md:max-w-full mb-[10px]" onSubmit={handleSubmit}>
          {inputFields.map((field, index) => (
            <InputField 
              key={index} 
              label={field.label} 
              type={field.type} 
              name={field.name}
              onChange={handleInputChange}
            />
          ))}
          <CheckboxField />
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {success && <p style={{ color: 'green' }}>{success}</p>}
          <div className="w-full flex justify-center">
            <button
              type="submit"
              className="self-center px-16 py-9 mt-10 font-semibold leading-tight text-white bg-teal-600 rounded-[30px] max-md:px-5 max-md:mt-10"
            >
              CREATE
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default UserRegistration;
