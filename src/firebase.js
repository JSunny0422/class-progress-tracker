import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBLAFTK9QyxHJ_9cvkU-mi9ZYSqv5ac0B8",
  authDomain: "class-progress-tracker-c67ce.firebaseapp.com",
  projectId: "class-progress-tracker-c67ce",
  storageBucket: "class-progress-tracker-c67ce.firebasestorage.app",
  messagingSenderId: "214911797225",
  appId: "1:214911797225:web:570bb2b0b26715504c6d78",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
