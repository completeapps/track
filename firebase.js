// firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCAqmHDZQWBUTcXqYCRQqjGnAtoecIUTb4",
  authDomain: "track-d51cd.firebaseapp.com",
  projectId: "track-d51cd",
  storageBucket: "track-d51cd.firebasestorage.app",
  messagingSenderId: "214424222026",
  appId: "1:214424222026:web:334fed279997ba60b3e9b3",
  measurementId: "G-WQG5XBB65Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Auth
const auth = getAuth(app);

// Sign in anonymously
signInAnonymously(auth).catch((error) => {
  console.error("Anon sign-in error", error);
});

// Expose a promise so app.js can wait for UID if needed
export const authReady = new Promise((resolve) => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("Signed in as", user.uid);
      resolve(user);
    }
  });
});

export { app, auth };
