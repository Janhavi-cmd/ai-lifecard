// ─── FIREBASE AUTHENTICATION SETUP ──────────────────────────────────────────
//
// SETUP INSTRUCTIONS (5 minutes):
// 1. Go to https://console.firebase.google.com
// 2. Create new project → "ai-lifecard"
// 3. Enable Authentication → Google Sign-In
// 4. Go to Project Settings → Web App → Copy config
// 5. Replace the config below with YOUR config
// 6. In .env file set: REACT_APP_USE_FIREBASE=true
//
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

// 🔴 REPLACE WITH YOUR FIREBASE CONFIG:
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "YOUR_APP_ID",
};

const USE_FIREBASE = 
  process.env.REACT_APP_USE_FIREBASE === 'true' ||
  // Auto-detect: if real API key is present (not the placeholder), enable Firebase
  (!!process.env.REACT_APP_FIREBASE_API_KEY && 
   !process.env.REACT_APP_FIREBASE_API_KEY.includes('your_api_key') &&
   process.env.REACT_APP_FIREBASE_API_KEY !== 'YOUR_API_KEY');

let auth = null;
let googleProvider = null;

if (USE_FIREBASE) {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.addScope('email');
    googleProvider.addScope('profile');
  } catch (e) {
    console.warn('Firebase init failed — running without auth:', e.message);
  }
}

export const signInWithGoogle = async () => {
  if (!auth) {
    // Demo mode — simulate login
    return {
      uid: 'demo-user-001',
      displayName: 'Demo User',
      email: 'demo@lifecard.ai',
      photoURL: null
    };
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    console.error('Google sign-in error:', err);
    throw err;
  }
};

export const signOutUser = async () => {
  if (!auth) return;
  await signOut(auth);
};

export const onAuthChange = (callback) => {
  if (!auth) {
    // No auth — call with null immediately
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

export { USE_FIREBASE };
