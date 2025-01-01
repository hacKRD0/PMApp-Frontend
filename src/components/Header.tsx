// src/components/Header.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Custom context for auth
import { logout } from '../services/authService'; // Logout function from Firebase
import { FaUser } from 'react-icons/fa6';
import { FiLogOut } from 'react-icons/fi';

const Header = () => {
  const { currentUser } = useAuth(); // Get the current user from the context
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false); // For dropdown menu toggle
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref to detect clicks outside

  const handleLogout = async () => {
    try {
      await logout(); // Log out the user
      navigate('/login'); // Redirect to login page
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-blue-600 text-white py-4 z-50">
      <div className="container mx-auto px-6">
        <h1 className="text-3xl font-bold">Portfolio Manager</h1>
      </div>
      <div className="container mx-auto flex justify-around items-end">
        {/* Centered navigation */}
        <div className="text-center flex-grow">
          <Link to="/" className="mx-4 text-lg hover:underline">
            Home
          </Link>
          <Link to="/upload" className="mx-4 text-lg hover:underline">
            Upload
          </Link>
          <Link to="/portfolio" className="mx-4 text-lg hover:underline">
            Portfolio
          </Link>
          <Link to="/stockmapper" className="mx-4 text-lg hover:underline">
            Stock Mapper
          </Link>
          <Link to="/sectormaster" className="mx-4 text-lg hover:underline">
            Sector Master
          </Link>
          <Link to="/stockmaster" className="mx-4 text-lg hover:underline">
            Stock Master
          </Link>
        </div>

        {/* User profile picture on the right */}
        <div ref={dropdownRef} className="justify-end relative mr-4">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="focus:outline-none"
          >
            {/* Display user profile picture */}
            {currentUser?.photoURL ? (
              <img
                src={currentUser?.photoURL || '/default-profile.png'} // Fallback image if photoURL is not available
                alt="Profile"
                className="w-10 h-10 rounded-full"
              />
            ) : (
              // Fallback icon if photoURL is not available
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                <FaUser className="h-5 w-5 text-gray-500" />
              </div>
            )}
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 text-black z-50">
              <Link
                to="/profile"
                className="flex px-4 py-2 text-left hover:bg-gray-200"
                onClick={() => setDropdownOpen(false)}
              >
                <FaUser className="h-5 w-5 mr-2 text-gray-500" />
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full text-left px-4 py-2 hover:bg-gray-200"
              >
                <FiLogOut className="h-5 w-5 mr-2 text-gray-500" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
