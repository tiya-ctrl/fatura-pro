import { auth } from "./firebase";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";

/* ───── Google Login ───── */
const provider = new GoogleAuthProvider();

export const loginWithGoogle = () => {
  return signInWithPopup(auth, provider);
};

/* ───── Email/Password ───── */
export const registerUser = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const loginUser = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = () => {
  return signOut(auth);
};

/* ───── Auth Listener ───── */
export const listenToUser = (callback) => {
  return onAuthStateChanged(auth, callback);
};