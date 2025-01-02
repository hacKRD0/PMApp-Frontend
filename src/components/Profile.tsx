// src/components/Profile.tsx

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { getUserData } from '../services/apiService';
import { format } from 'date-fns';
import { auth } from '../firebase'; // Ensure correct path
import { changePassword } from '../services/authService'; // Import the new function
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';

interface Brokerage {
  code: string;
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  role: string;
  id: number;
  name: string;
  email: string;
  defaultBrokerage: Brokerage;
  defaultBrokerageId: number;
  createdAt: string;
  updatedAt: string;
  // Other fields as necessary
}

const Profile: React.FC = () => {
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Password change form states
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // Validation states
  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
    passwordsMatch: false,
  });

  // Feedback states
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<
    string | null
  >(null);
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(
    null
  );
  const [isUpdatingPassword, setIsUpdatingPassword] = useState<boolean>(false);

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] =
    useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUserData();
        setUserData(data.user); // Adjust based on actual API response structure
        setLoading(false);
      } catch (error: any) {
        setFetchError('Failed to load user data. Please try again later.');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Password validation logic
  useEffect(() => {
    const length = newPassword.length >= 8;
    const uppercase = /[A-Z]/.test(newPassword);
    const lowercase = /[a-z]/.test(newPassword);
    const number = /[0-9]/.test(newPassword);
    const specialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    const passwordsMatch =
      newPassword === confirmPassword && newPassword !== '';

    setPasswordValidations({
      length,
      uppercase,
      lowercase,
      number,
      specialChar,
      passwordsMatch,
    });
  }, [newPassword, confirmPassword]);

  // Handle password change form submission
  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();

    // Reset feedback messages
    setPasswordChangeSuccess(null);
    setPasswordChangeError(null);

    // Final Validation Check
    const allValid = Object.values(passwordValidations).every(Boolean);

    if (!allValid) {
      setPasswordChangeError(
        'Please ensure all password requirements are met.'
      );
      return;
    }

    setIsUpdatingPassword(true);

    try {
      await changePassword(currentPassword, newPassword);
      setPasswordChangeSuccess('Password updated successfully.');
      // Reset form fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setPasswordChangeError(
        error.message || 'Failed to update password. Please try again.'
      );
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl">Loading user data...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-red-500">{fetchError}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-center">User Profile</h1>

      {/* User Details Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">
              Name:
            </label>
            <p className="text-gray-800">{userData?.name}</p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">
              Email:
            </label>
            <p className="text-gray-800">{userData?.email}</p>
          </div>

          {/* Role */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">
              Role:
            </label>
            <p className="text-gray-800">{userData?.role}</p>
          </div>

          {/* Default Brokerage */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">
              Default Brokerage:
            </label>
            <p className="text-gray-800">
              {userData?.defaultBrokerage.name} (
              {userData?.defaultBrokerage.code})
            </p>
          </div>

          {/* Account Created At */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">
              Account Created:
            </label>
            <p className="text-gray-800">
              {userData?.createdAt
                ? format(new Date(userData.createdAt), 'PPP')
                : 'N/A'}
            </p>
          </div>

          {/* Last Updated At */}
          {/* <div>
            <label className="block text-gray-600 font-medium mb-1">
              Last Updated:
            </label>
            <p className="text-gray-800">
              {userData?.updatedAt
                ? format(new Date(userData.updatedAt), 'PPP p')
                : 'N/A'}
            </p>
          </div> */}
        </div>
      </div>

      {/* Password Change Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {/* Current Password */}
          <div className="relative flex">
            <label
              htmlFor="currentPassword"
              className="w-2/12 block text-gray-600 font-medium mb-1"
            >
              Current Password:
            </label>
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              id="currentPassword"
              value={currentPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setCurrentPassword(e.target.value)
              }
              required
              className="w-full pr-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Enter your current password"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute inset-y-0 right-0 px-3 flex items-center justify-center text-gray-600 text-lg"
              aria-label={
                showCurrentPassword
                  ? 'Hide current password'
                  : 'Show current password'
              }
            >
              {showCurrentPassword ? <FaRegEye /> : <FaRegEyeSlash />}
            </button>
          </div>

          {/* New Password */}
          <div className="relative flex">
            <label
              htmlFor="newPassword"
              className="w-2/12 block text-gray-600 font-medium mb-1"
            >
              New Password:
            </label>
            <input
              type={showNewPassword ? 'text' : 'password'}
              id="newPassword"
              value={newPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setNewPassword(e.target.value)
              }
              required
              className="w-full pr-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Enter your new password"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute inset-y-0 right-0 px-3 flex items-center justify-center text-gray-600 text-lg"
              aria-label={
                showNewPassword ? 'Hide new password' : 'Show new password'
              }
            >
              {showNewPassword ? <FaRegEye /> : <FaRegEyeSlash />}
            </button>
          </div>

          {/* Password Requirements */}
          <div className="mb-4">
            <p className="text-gray-600 font-medium mb-2">
              Password must contain:
            </p>
            <ul className="list-disc list-inside">
              <li
                className={`${
                  passwordValidations.length ? 'text-green-600' : 'text-red-600'
                }`}
              >
                Minimum 8 characters
              </li>
              <li
                className={`${
                  passwordValidations.uppercase
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                At least one uppercase letter
              </li>
              <li
                className={`${
                  passwordValidations.lowercase
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                At least one lowercase letter
              </li>
              <li
                className={`${
                  passwordValidations.number ? 'text-green-600' : 'text-red-600'
                }`}
              >
                At least one number
              </li>
              <li
                className={`${
                  passwordValidations.specialChar
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                At least one special character (e.g., !@#$%^&*)
              </li>
            </ul>
          </div>

          {/* Confirm New Password */}
          <div className="relative flex">
            <label
              htmlFor="confirmPassword"
              className="w-2/12 block text-gray-600 font-medium mb-1"
            >
              Confirm New Password:
            </label>

            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setConfirmPassword(e.target.value)
              }
              required
              className="w-full pr-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Re-enter your new password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 px-3 flex items-center justify-center text-gray-600 text-lg"
              aria-label={
                showConfirmPassword
                  ? 'Hide confirm password'
                  : 'Show confirm password'
              }
            >
              {showConfirmPassword ? <FaRegEye /> : <FaRegEyeSlash />}
            </button>
          </div>
          <div className="flex items-center justify-center">
            {confirmPassword && (
              <p
                className={`mt-1 text-sm ${
                  passwordValidations.passwordsMatch
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {passwordValidations.passwordsMatch
                  ? 'Passwords match.'
                  : 'Passwords do not match.'}
              </p>
            )}
          </div>

          {/* Feedback Messages */}
          {passwordChangeSuccess && (
            <div className="p-3 bg-green-100 text-green-700 rounded-md">
              {passwordChangeSuccess}
            </div>
          )}
          {passwordChangeError && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md">
              {passwordChangeError}
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={
                isUpdatingPassword ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword ||
                !Object.values(passwordValidations).every(Boolean)
              }
              className={`w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-200 ${
                (isUpdatingPassword ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword ||
                  !Object.values(passwordValidations).every(Boolean)) &&
                'opacity-50 cursor-not-allowed'
              }`}
            >
              {isUpdatingPassword ? 'Updating...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
