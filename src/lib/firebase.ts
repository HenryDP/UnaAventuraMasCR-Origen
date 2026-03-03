import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
import { getStorage, FirebaseStorage } from "firebase/storage";

// Configuration for Firebase
// Users must provide these values in their environment variables or .env file
const firebaseConfig = {
  apiKey: "AIzaSyDcYfZAQX5VtN8HQKVh1d7_pgTPye2r49U",
  authDomain: "una-aventura-mas-cr.firebaseapp.com",
  projectId: "una-aventura-mas-cr",
  storageBucket: "una-aventura-mas-cr.firebasestorage.app",
  messagingSenderId: "82072938954",
  appId: "1:82072938954:web:16cc57d495aa80ff8f0733",
  measurementId: "G-TD6N4F4YVR"
};


// Initialize Firebase
let app: FirebaseApp | undefined;
let db: Firestore;
let auth: Auth;
let storage: FirebaseStorage;

if (import.meta.env.VITE_FIREBASE_API_KEY) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
} else {
  console.warn("Firebase API keys not found. App running in demo mode.");
}

export { app, db, auth, storage };
