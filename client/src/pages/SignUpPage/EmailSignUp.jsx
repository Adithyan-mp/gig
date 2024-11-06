import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function EmailSignUp() {
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setError(""); // Clear error when user changes role
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setError(""); // Clear error when user changes email
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role) {
      setError("Please select a role.");
      return;
    }
    if (!email) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setSuccess(""); // Clear previous success message

    // Send data to backend for email sending with Axios
    try {
      const response = await axios.post("/send-registration-email", {
        email,
        role,
      });

      if (response.data.success) {
        setSuccess("Check your email for Registration.");
        setEmail(""); // Clear email input after successful submission
        setRole(""); // Reset role selection
      } else {
        setError("Failed to send email. Please try again.");
      }
    } catch (err) {
      setError("Error sending email. Please try again.");
    }
  };

  return (
    <form className="flex flex-col mt-4 w-full text-sm text-white" onSubmit={handleSubmit}>
      <div className="flex flex-col justify-center w-full">
        <div className="bg-gray-800 border border-slate-600 rounded h-[56px] w-full">
          <label htmlFor="email" className="sr-only">Enter your email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="Enter your email"
            className="w-full h-full bg-transparent text-white px-4"
            required
          />
        </div>
        <div className="mt-2 bg-gray-800 border border-slate-600 rounded h-[56px] w-full">
          <label htmlFor="role" className="sr-only">Select your role</label>
          <select
            id="role"
            value={role}
            onChange={handleRoleChange}
            className="w-full h-full bg-transparent text-white px-4"
            required
          >
            <option value="" disabled>Select your role</option>
            <option value="seeker" className="text-black">Seeker</option>
            <option value="provider" className="text-black">Provider</option>
          </select>
        </div>
      </div>
      {error && (
        <p className="text-red-500 mt-2" aria-live="polite">
          {error}
        </p>
      )}
      {success && (
        <p className="text-green-500 mt-2" aria-live="polite">
          {success}
        </p>
      )}
      <button type="submit" className="px-6 py-4 mt-2 w-full bg-teal-600 rounded-lg hover:opacity-80 text-center">
        Sign up
      </button>
      <Link to="/login" className="self-center mt-2 text-zinc-100 hover:opacity-80">
        Already have an account? Login
      </Link>
    </form>
  );
}

export default EmailSignUp;
