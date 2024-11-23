// src/components/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn, signInWithGoogle } from '../services/authService';
import { addUser } from '../services/apiService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      navigate('/'); // Redirect to home on success
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const res = await signInWithGoogle();
      // console.log('Google sign in successful', res?.user?.email);
      const gmail = res?.user?.email;
      if (!gmail) {
        throw new Error('Google sign in failed');
      }
      try {
        const response = await addUser(gmail, gmail.split('@')[0], '');
        // if (response.status === 201) {
        //   console.log('User successfully added');
        // }
      } catch (addUserError) {
        if (addUserError.response?.status === 400) {
          console.log('User already exists');
        } else {
          console.error('Error adding user:', addUserError);
          throw new Error('Unexpected error while adding user');
        }
      }
      navigate('/'); // Redirect to home on success
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl mb-4">Login</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-4"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full mb-4"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 w-full mb-4"
        >
          Log In
        </button>
      </form>

      <hr className="my-4" />

      <button
        onClick={handleGoogleSignIn}
        className="bg-red-500 text-white p-2 w-full"
      >
        Sign In with Google
      </button>

      <hr className="my-4" />

      <p className="text-center">
        Don't have an account?{' '}
        <a href="/register" className="text-blue-500 hover:underline">
          Sign up
        </a>
      </p>
    </div>
  );
};

export default Login;
