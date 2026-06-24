// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// config for NTEdu
const firebaseConfig = {
  apiKey: "AIzaSyCsl0sGTkSd_QbCAeSCJc06-S4d6XqE5rQ",
  authDomain: "ntedu-a6190.firebaseapp.com",
  projectId: "ntedu-a6190",
  storageBucket: "ntedu-a6190.firebasestorage.app",
  messagingSenderId: "630886903047",
  appId: "1:630886903047:web:0255e76565999e2159a9a2",
  measurementId: "G-HJV8L82D8X",
  databaseURL:
    "https://ntedu-a6190-default-rtdb.asia-southeast1.firebasedatabase.app",
};

// setLogLevel("debug");
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const functions = getFunctions(app, "asia-southeast1");
const rtdb = getDatabase(app);
// const analytics = getAnalytics(app);
export { auth, db, functions, rtdb };
