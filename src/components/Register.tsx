// src/components/Register.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp } from '../services/authService';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false); // For toggling password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // For toggling confirm password visibility
  const [isFormValid, setIsFormValid] = useState(false); // For enabling/disabling the button
  const navigate = useNavigate();

  // Function to validate email format
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Function to validate password strength
  const isValidPassword = (password: string) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  // Check form validity whenever any field changes
  useEffect(() => {
    const isPasswordValid = isValidPassword(password);
    if (!isPasswordValid && password) {
      setPasswordError(
        'Password must be at least 8 characters long, include 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.'
      );
    } else {
      setPasswordError('');
    }

    const isValid = !!(
      email &&
      password &&
      confirmPassword &&
      password === confirmPassword &&
      isValidEmail(email) &&
      isPasswordValid
    );

    setIsFormValid(isValid);
  }, [email, password, confirmPassword]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return; // Prevent submission if the form is not valid
    try {
      await signUp(email, password);
      navigate('/'); // Redirect to home on success
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl mb-4">Register</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-4"
        />

        <div className="relative mb-4">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 w-full pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3"
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2C5.18 2 1 5.82 1 10c0 4.18 4.18 8 9 8s9-3.82 9-8c0-4.18-4.18-8-9-8zM3 10c0-3.47 3.13-6 7-6s7 2.53 7 6c0 3.47-3.13 6-7 6s-7-2.53-7-6zm7 3a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13.875 11.825a3 3 0 11-4.075-4.075L6.95 5.9a8.033 8.033 0 00-3.7 4.1c1.38 2.22 3.995 3.96 7 3.96 1.185 0 2.31-.24 3.3-.66l-1.675-1.475zm-2.7-.3a2 2 0 101.275-1.275l-1.275 1.275z" />
                <path d="M17.9 10a8.028 8.028 0 00-1.275-1.95l1.075-1.075a.75.75 0 10-1.075-1.075l-2.25 2.25a5.985 5.985 0 00-3.45-1.15 6 6 0 00-3.9 1.525l-2.25-2.25a.75.75 0 00-1.075 1.075l13.5 13.5a.75.75 0 001.075-1.075l-2.25-2.25A7.936 7.936 0 0017.9 10z" />
              </svg>
            )}
          </button>
        </div>

        {passwordError && (
          <p className="text-red-500 text-sm mb-4">{passwordError}</p>
        )}

        <div className="relative mb-4">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="border p-2 w-full pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3"
          >
            {showConfirmPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2C5.18 2 1 5.82 1 10c0 4.18 4.18 8 9 8s9-3.82 9-8c0-4.18-4.18-8-9-8zM3 10c0-3.47 3.13-6 7-6s7 2.53 7 6c0 3.47-3.13 6-7 6s-7-2.53-7-6zm7 3a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13.875 11.825a3 3 0 11-4.075-4.075L6.95 5.9a8.033 8.033 0 00-3.7 4.1c1.38 2.22 3.995 3.96 7 3.96 1.185 0 2.31-.24 3.3-.66l-1.675-1.475zm-2.7-.3a2 2 0 101.275-1.275l-1.275 1.275z" />
                <path d="M17.9 10a8.028 8.028 0 00-1.275-1.95l1.075-1.075a.75.75 0 10-1.075-1.075l-2.25 2.25a5.985 5.985 0 00-3.45-1.15 6 6 0 00-3.9 1.525l-2.25-2.25a.75.75 0 00-1.075 1.075l13.5 13.5a.75.75 0 001.075-1.075l-2.25-2.25A7.936 7.936 0 0017.9 10z" />
              </svg>
            )}
          </button>
        </div>

        <button
          type="submit"
          className={`bg-green-500 text-white p-2 w-full mb-4 ${!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!isFormValid} // Disable the button if the form is invalid
        >
          Register
        </button>
      </form>

      <hr className="my-4" />

      <p className="text-center">
        Already have an account?{' '}
        <a href="/login" className="text-blue-500 hover:underline">
          Log in
        </a>
      </p>
    </div>
  );
};

export default Register;
