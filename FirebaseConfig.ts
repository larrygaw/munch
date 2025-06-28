// Import the functions you need from the SDKs you need
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAelyykWwqvETEiv5QmbvhM1GXDbKE627A",
  authDomain: "munch-86292.firebaseapp.com",
  projectId: "munch-86292",
  storageBucket: "munch-86292.firebasestorage.app",
  messagingSenderId: "900250767425",
  appId: "1:900250767425:web:a3d0707e6522737388f6c0",
  measurementId: "G-29NJE7X58Z"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const db = getFirestore(app);
export const storage = getStorage(app);