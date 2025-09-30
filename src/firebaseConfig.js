// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAvDQjV3Jc-qIS1oPg55IwaEDZZe_-O_sc",
    authDomain: "gifchat-de06d.firebaseapp.com",
    projectId: "gifchat-de06d",
    storageBucket: "gifchat-de06d.appspot.com",
    messagingSenderId: "969707637357",
    appId: "1:969707637357:web:0ef80d90be0e61bf804d64",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
