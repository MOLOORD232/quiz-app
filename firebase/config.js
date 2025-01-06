import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

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
export const db = getFirestore(app);
