import React, { useContext, useEffect, useState, createContext } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../firebase";
import { Navigate } from "react-router-dom";

interface AuthContextProps {
  currentUser: User | null;
  getAuthToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false); // Loading is complete after checking the auth state
      console.log('User:', user);
    });

    return unsubscribe; // Clean up the listener on unmount
  }, []);

  const getAuthToken = async (): Promise<string | null> => {
    if (currentUser) {
      return currentUser.getIdToken();
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-lg font-semibold">Loading...</h1>
      </div>
    ); // Replace with a styled spinner or skeleton screen if needed
  }

  if (!currentUser) {
    // return <Navigate to="/login" replace />;
  }

  return (
    <AuthContext.Provider value={{ currentUser, getAuthToken }}>
      {children}
    </AuthContext.Provider>
  );
};
