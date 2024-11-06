// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCAQ4Yq6Zn3rLupAmFAgpVEciDh1x4X0yQ",
  authDomain: "pmapp-7cbf0.firebaseapp.com",
  projectId: "pmapp-7cbf0",
  storageBucket: "pmapp-7cbf0.appspot.com",
  messagingSenderId: "1062199495669",
  appId: "1:1062199495669:web:fdac8259808be1e81f6ebc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Google Provider
export const googleProvider = new GoogleAuthProvider();

export const getUserUid = (): Promise<string | null> => {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      resolve(user ? user.uid : null);
    });
  });
};

export const getAuthToken = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    return token;
  }
  return null;
}