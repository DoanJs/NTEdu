// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// config for hoabanmaiedu-mobile
const firebaseConfig = {
  apiKey: "AIzaSyBneelps2P-qPFG5h3VSPYTwJRtx0u4n80",
  authDomain: "hoabanmaiedu-mobile.firebaseapp.com",
  projectId: "hoabanmaiedu-mobile",
  storageBucket: "hoabanmaiedu-mobile.firebasestorage.app",
  messagingSenderId: "465303174037",
  appId: "1:465303174037:web:c9ab7e49f2105a5a86149c",
  measurementId: "G-P113B6FJ95",
  databaseURL:
    "https://hoabanmaiedu-mobile-default-rtdb.asia-southeast1.firebasedatabase.app",
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
