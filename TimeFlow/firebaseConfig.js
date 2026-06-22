import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage' 

const firebaseConfig = {
  apiKey: "AIzaSyCP1ykE1bXt2YqjGfIHfuzth5Wu9D4ZFVA",
  authDomain: "timeflow-6712e.firebaseapp.com",
  projectId: "timeflow-6712e",
  storageBucket: "timeflow-6712e.firebasestorage.app",
  messagingSenderId: "180357702030",
  appId: "1:180357702030:web:8cbf15c2b551a705ca84df"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export { db };
export {auth};