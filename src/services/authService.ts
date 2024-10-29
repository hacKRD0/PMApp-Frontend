// src/services/authService.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";

// Sign up with email and password
export const signUp = async (email: string, password: string) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

// Sign in with email and password
export const signIn = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

// Google Sign-In
export const signInWithGoogle = async () => {
  return await signInWithPopup(auth, googleProvider);
};

// Sign out the user
export const logout = async () => {
  return await signOut(auth);
};
