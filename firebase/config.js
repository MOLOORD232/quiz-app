// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);
