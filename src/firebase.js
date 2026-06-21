import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Fallback to local demo config if env variables are not supplied
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key-mock",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo-interntrack.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-interntrack",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo-interntrack.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:demo"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Firestore database
export const auth = getAuth(app);
export const db = getFirestore(app);

// Connect to local emulators if run on localhost with missing config, or if explicitly requested
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const missingEnvConfig = !import.meta.env.VITE_FIREBASE_API_KEY;
const forceEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true';

if (forceEmulator || (isLocalhost && missingEnvConfig)) {
  console.log("⚠️ Connecting to local Firebase Auth & Firestore Emulators...");
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
  } catch (err) {
    console.warn("Emulators already connected or connection failed:", err);
  }
}

export default app;
