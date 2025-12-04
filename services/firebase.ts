// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "",
  authDomain: "fitflowhub-79cfa.firebaseapp.com",
  projectId: "fitflowhub-79cfa",
  storageBucket: "fitflowhub-79cfa.firebasestorage.app",
  messagingSenderId: "794194139137",
  appId: "",
  measurementId: "G-QN9FDHJ6V9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const storage = getStorage(app);
