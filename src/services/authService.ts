// src/services/authService.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User as FirebaseUser,
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

/**
 * Change the user's password.
 *
 * @param currentPassword - The user's current password.
 * @param newPassword - The new password to set.
 * @returns A promise that resolves if the password is successfully updated.
 * @throws An error if re-authentication fails or password update fails.
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const user: FirebaseUser | null = auth.currentUser;

  if (!user || !user.email) {
    throw new Error("No authenticated user found.");
  }

  // Create credential using the user's email and current password
  const credential = EmailAuthProvider.credential(user.email, currentPassword);

  try {
    // Re-authenticate the user
    await reauthenticateWithCredential(user, credential);

    // Update the user's password
    await updatePassword(user, newPassword);
  } catch (error: any) {
    // Handle specific Firebase Auth errors
    if (error.code === "auth/wrong-password") {
      throw new Error("Current password is incorrect.");
    } else if (error.code === "auth/weak-password") {
      throw new Error("New password is too weak. Please choose a stronger password.");
    } else {
      // Generic error message for other cases
      throw new Error("Failed to update password. Please try again.");
    }
  }
};