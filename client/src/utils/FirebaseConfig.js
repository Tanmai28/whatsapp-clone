import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
const firebaseConfig = {
    apiKey: "AIzaSyAmzgb0zC1q_StbElJQk3G7C8lF9Gf0_KA",
    authDomain: "whatsapp-clone-f30b2.firebaseapp.com",
    projectId: "whatsapp-clone-f30b2",
    storageBucket: "whatsapp-clone-f30b2.firebasestorage.app",
    messagingSenderId: "585120557579",
    appId: "1:585120557579:web:b3f76f682f4d5a40e5f50e",
    measurementId: "G-2P47V8X3VW"
  };

const app = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);