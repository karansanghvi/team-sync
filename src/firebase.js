import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBZeq-rqdcjZOVgi-VvX4FC_leRMGSD37A",
  authDomain: "teamsync-2e23b.firebaseapp.com",
  projectId: "teamsync-2e23b",
  storageBucket: "teamsync-2e23b.firebasestorage.app",
  messagingSenderId: "980693897819",
  appId: "1:980693897819:web:f26f9acfc59e95502c657e",
  measurementId: "G-NX8EF0SHRT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
