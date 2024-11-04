import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function LoginForm() {
  const [formData, setFormData] = useState({ email: '', password: '', role: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.role) {
      setError('Please select a role.');
      return;
    }

    try {
      const endpoint = formData.role === 'seeker' ? '/api/seekerLogin' : '/api/providerLogin';
      const response = await axios.post(endpoint, { email: formData.email, password: formData.password });

      if (response.status === 200) {
        const { token, userId } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        navigate(formData.role === 'seeker' ? `/gigPool/${userId}` : `/gigPost/${userId}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <form className="flex flex-col mt-4 w-full text-sm" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2 w-full text-white">
        <div className="bg-gray-800 border border-slate-600 rounded h-[56px]">
          <label htmlFor="role" className="sr-only">Role</label>
          <select id="role" className="w-full bg-transparent h-full px-4 text-black" value={formData.role} onChange={handleInputChange} required>
            <option value="" disabled>Select your role</option>
            <option value="seeker">Seeker</option>
            <option value="provider">Provider</option>
          </select>
        </div>
        
        <input id="email" type="email" className="bg-gray-800 border border-slate-600 rounded h-[56px] px-4 w-full" placeholder="your em@il" value={formData.email} onChange={handleInputChange} required />

        <input id="password" type="password" className="bg-gray-800 border border-slate-600 rounded h-[56px] px-4 w-full" placeholder="P@ssword" value={formData.password} onChange={handleInputChange} required />
      </div>

      {error && <p className="mt-2 text-center text-red-500">{error}</p>}
      <Link to="/signin" className="mt-2 text-center text-zinc-100 hover:opacity-80">Need Sign In?</Link>

      <button type="submit" className="self-center mt-4 py-3 px-5 bg-green-600 rounded-lg text-base font-bold text-white hover:opacity-80">
        Login
      </button>
    </form>
  );
}

export default LoginForm;