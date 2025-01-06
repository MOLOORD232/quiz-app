// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore'; // إضافة هذا السطر

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCwzlPEjZr17k1UluCpihOqMDeBWLksqOs",
  authDomain: "quiz-app-16a91.firebaseapp.com",
  projectId: "quiz-app-16a91",
  storageBucket: "quiz-app-16a91.firebasestorage.app",
  messagingSenderId: "377285727065",
  appId: "1:377285727065:web:42f4cb74113fd580003248",
  measurementId: "G-TSX9M7R0N5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// تهيئة Analytics فقط في جانب العميل
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// تهيئة Firestore وتصديره
export const db = getFirestore(app); // إضافة هذا السطر
