// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCFhuyA2nKN_cRPtfXJzPNLskl7f0ekrp4",
  authDomain: "gradgram-f8c04.firebaseapp.com",
  projectId: "gradgram-f8c04",
  storageBucket: "gradgram-f8c04.firebasestorage.app",
  messagingSenderId: "771838616841",
  appId: "1:771838616841:web:058f6b29579b0c2f079fd8",
  databaseURL: "https://gradgram-f8c04-default-rtdb.firebaseio.com/",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const rtdb = getDatabase(app);
