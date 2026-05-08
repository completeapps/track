// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
