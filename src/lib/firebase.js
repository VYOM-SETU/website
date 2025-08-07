// Import Firebase functions from ES modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js';
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js';
import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  query,
  where,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  orderBy,
  Timestamp
} from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js';

// Get the firebase config from the Vercel environment variable
let firebaseConfig;
try {
  firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG);
  console.log('Firebase config loaded successfully');
} catch (error) {
  console.error('Error loading Firebase config:', error);
  // Fallback config for development
  firebaseConfig = {
    apiKey: "AIzaSyCbUaM3BtSLsijul4kfEfX37q1CVlke-lI",
    authDomain: "vyom-setu-website.firebaseapp.com",
    projectId: "vyom-setu-website",
    storageBucket: "vyom-setu-website.firebasestorage.app",
    messagingSenderId: "706422243230",
    appId: "1:706422243230:web:36985f2e33ab31df6f608f",
    measurementId: "G-QDEQJL56ZG"
  };
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Export Firebase functions
export {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  collection,
  doc,
  onSnapshot,
  query,
  where,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  orderBy,
  Timestamp
};