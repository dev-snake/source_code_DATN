// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCXw94OtxT2CHgneKW1pVCFFm4sYhO48-M",
  authDomain: "an-bakery.firebaseapp.com",
  projectId: "an-bakery",
  storageBucket: "an-bakery.firebasestorage.app",
  messagingSenderId: "708263032213",
  appId: "1:708263032213:web:242309f94abc051e55329c",
  measurementId: "G-T44K6V5W8Q",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebaseApp);
// Initialize Firebase Auth provider
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
// whenever a user interacts with the provider, we force them to select an account
googleProvider.setCustomParameters({
  prompt: "select_account ",
});
export const auth = getAuth();
export const signInWithGooglePopup = () => signInWithPopup(auth, googleProvider);
export const signInWithFacebookPopup = () => signInWithPopup(auth, facebookProvider);
