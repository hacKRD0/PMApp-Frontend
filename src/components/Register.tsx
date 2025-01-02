// src/components/Register.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp } from '../services/authService';
import { addUser } from '../services/apiService';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';

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
      await addUser(email, email.split('@')[0], password); // Add user to the database
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
            {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
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
            {showConfirmPassword ? <FaRegEye /> : <FaRegEyeSlash />}
          </button>
        </div>

        <button
          type="submit"
          className={`bg-green-500 text-white p-2 w-full mb-4 ${
            !isFormValid ? 'opacity-50 cursor-not-allowed' : ''
          }`}
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
