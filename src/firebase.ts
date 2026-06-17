import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCR01ISx8_x9UhprkTHH0NvYdgGVAZmmqk",
  authDomain: "auth-niklaus.firebaseapp.com",
  projectId: "auth-niklaus",
  storageBucket: "auth-niklaus.firebasestorage.app",
  messagingSenderId: "198056193558",
  appId: "1:198056193558:web:ee3a39fd1308ab11f90f37"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Custom UI helper for default setup scopes
googleProvider.setCustomParameters({
  prompt: "select_account"
});

export default app;
