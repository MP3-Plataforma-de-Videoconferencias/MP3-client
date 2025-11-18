import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAQ3fzJAKT_6CsNQRvKkEksetxcoD6urj8",
  authDomain: "videoconferencias-s1.firebaseapp.com",
  projectId: "videoconferencias-s1",
  storageBucket: "videoconferencias-s1.firebasestorage.app",
  messagingSenderId: "776620691061",
  appId: "1:776620691061:web:42035eb288edba3046f23c",
  measurementId: "G-KHW52BTRD1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();