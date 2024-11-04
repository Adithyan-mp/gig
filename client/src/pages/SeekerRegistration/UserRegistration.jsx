import React, { useState } from 'react';
import InputField from './InputField';
import CheckboxField from './CheckboxField';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const inputFields = [
  { label: 'NAME', type: 'text', name: 'name' },
  { label: 'EMAIL ID', type: 'email', name: 'email' },
  { label: 'UserId', type: 'text', name: 'userId' },
  { label: 'Address', type: 'text', name: 'address' },
  { label: 'City', type: 'text', name: 'city' },
  { label: 'ph-No', type: 'tel', name: 'phone' },
  { label: 'Password', type: 'password', name: 'password' },
  { label: 'Confirm Password', type: 'password', name: 'confirmPassword' },
];

function UserRegistration() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    userId: '',
    address: '',
    city: '',
    phone: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    setFormData({ ...formData, termsAccepted: e.target.checked });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!formData.termsAccepted) {
      setError('You must agree to the terms.');
      return;
    }

    try {
      const response = await axios.post('/api/userCreation', formData);
      if (response.status === 201) {
        setSuccess('Registration successful!');
        setFormData({
          name: '',
          email: '',
          userId: '',
          address: '',
          city: '',
          phone: '',
          password: '',
          confirmPassword: '',
          termsAccepted: false,
        });
        navigate('/login');
      }
    } catch (err) {
      // Extract specific error messages
      const errorMessages = err.response?.data?.errors || [];
      setError(errorMessages.length > 0 ? errorMessages.join(', ') : 'Registration failed. Try again.');
    }
  };

  return (
    <main className="flex overflow-hidden flex-col items-center px-20 pt-16 pb-72 bg-gray-800 max-md:px-5 max-md:pb-24">
      <div className="flex flex-col ml-6 w-full max-w-[1120px] max-md:max-w-full">
        <h1 className="text-4xl font-semibold text-white max-md:max-w-full">
          Create your account today and unlock endless opportunities!
        </h1>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center self-center py-20 pr-20 pl-9 mt-16 max-w-full text-xl font-medium text-black bg-white rounded-[30px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] w-[656px] max-md:px-5 max-md:mt-10"
        >
          <div className="flex flex-wrap gap-0.5 items-start self-stretch h-[807px] max-md:max-w-full">
            <h2 className="grow shrink text-2xl font-semibold text-center text-teal-600 w-[518px] max-md:max-w-full">
              USER DETAILS
            </h2>
            {inputFields.map((field, index) => (
              <InputField
                key={index}
                label={field.label}
                type={field.type}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
              />
            ))}
          </div>
          <CheckboxField
            label="By confirming you agree to our terms"
            checked={formData.termsAccepted}
            onChange={handleCheckboxChange}
          />
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {success && <p style={{ color: 'green' }}>{success}</p>}
          <button className="px-16 py-8 mt-16 w-48 max-w-full font-semibold leading-tight text-white whitespace-nowrap bg-teal-600 rounded-[30px] max-md:px-5 max-md:mt-10">
            CREATE
          </button>
        </form>
      </div>
    </main>
  );
}

export default UserRegistration;
