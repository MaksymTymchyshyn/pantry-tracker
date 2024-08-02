// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDZmdZ0whM-_r50OWzpzM_OOtvrDMkIAIY",
  authDomain: "inventory-management-app-3d0ff.firebaseapp.com",
  projectId: "inventory-management-app-3d0ff",
  storageBucket: "inventory-management-app-3d0ff.appspot.com",
  messagingSenderId: "808223919908",
  appId: "1:808223919908:web:c4c6a2b4ffd22a77fe2db1",
  measurementId: "G-5ZX73D0RX8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export { firestore }