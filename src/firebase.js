import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDZW6yQnMzQValfJBtEbjGN_Y3ewtjj1FI",
  authDomain: "fatura-app-d9d0e.firebaseapp.com",
  projectId: "fatura-app-d9d0e",
  storageBucket: "fatura-app-d9d0e.firebasestorage.app",
  messagingSenderId: "365467161368",
  appId: "1:365467161368:web:d3e432cbc5358b4b8ec46d",
  measurementId: "G-MQFCTVY3JZ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;