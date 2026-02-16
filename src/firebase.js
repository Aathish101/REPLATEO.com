// Firebase v9+ Modular SDK Setup


import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";



/*
  IMPORTANT:
  Replace the firebaseConfig object below with YOUR project credentials
  from Firebase Console → Project Settings → General → SDK Setup
*/

const firebaseConfig = {
  apiKey: "AIzaSyCRopzTmLLunMb6QJV_9EnTd2qiqaOBol4",
  authDomain: "repletaodatastore.firebaseapp.com",
  projectId: "repletaodatastore",
  storageBucket: "repletaodatastore.firebasestorage.app",
  messagingSenderId: "88604146047",
  appId: "1:88604146047:web:a4b9f0f3f5784935f0824a",
  measurementId:"G-FQF609DDGF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth & Firestore services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();


export default app;
