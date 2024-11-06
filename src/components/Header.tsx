// src/components/Header.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Custom context for auth
import { logout } from '../services/authService'; // Logout function from Firebase

const Header = () => {
  const { currentUser } = useAuth(); // Get the current user from the context
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false); // For dropdown menu toggle

  const handleLogout = async () => {
    try {
      await logout(); // Log out the user
      navigate('/login'); // Redirect to login page
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <header className="bg-gray-800 text-white py-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Centered navigation */}
        <div className="text-center flex-grow">
          <Link to="/" className="mx-4 text-lg hover:underline">
            Upload
          </Link>
          <Link to="/portfolio" className="mx-4 text-lg hover:underline">
            Portfolio
          </Link>
          <Link to="/stockmaster" className="mx-4 text-lg hover:underline">
            Stockmaster
          </Link>
          <Link to="/sectormaster" className="mx-4 text-lg hover:underline">
            Sectormaster
          </Link>
        </div>

        {/* User profile picture on the right */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="focus:outline-none"
          >
            {/* Display user profile picture */}
            <img
              src={currentUser?.photoURL || '/default-profile.png'} // Fallback image if photoURL is not available
              alt="Profile"
              className="w-10 h-10 rounded-full"
            />
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 text-black">
              <Link
                to="/profile"
                className="block px-4 py-2 hover:bg-gray-200"
                onClick={() => setDropdownOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 hover:bg-gray-200"
              >
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
