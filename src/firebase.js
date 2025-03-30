import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { 
  initializeFirestore,
  persistentLocalCache,
  collection, 
  addDoc, 
  getDocs,
  getDoc,
  setDoc,
  doc, 
  updateDoc,
  onSnapshot,
  where,
  query
} from "firebase/firestore";
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL,
  uploadBytesResumable
} from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAz8ySbJhiwwaKjEoptC1Ouv_o_TV8Y21U",
  authDomain: "e-service-82a5c.firebaseapp.com",
  databaseURL: "https://e-service-82a5c-default-rtdb.firebaseio.com",
  projectId: "e-service-82a5c",
  storageBucket: "e-service-82a5c.firebasestorage.app",
  messagingSenderId: "833159150238",
  appId: "1:833159150238:web:7a9f8cdb4dc62cdc59198f",
  measurementId: "G-RY54C8YHNX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);

// Initialize Firestore with persistent cache
const db = initializeFirestore(app, {
  localCache: persistentLocalCache()
});

// Initialize Storage
const storage = getStorage(app);

// Enhanced file upload function with progress tracking
const uploadFileWithProgress = (file, path = 'documents') => {
  const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
  const uploadTask = uploadBytesResumable(storageRef, file);
  
  return {
    task: uploadTask,
    promise: new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        null, // Progress handled externally
        (error) => reject(error),
        async () => resolve(await getDownloadURL(uploadTask.snapshot.ref))
      );
    })
  };
};

export {
  // Authentication
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  GoogleAuthProvider,
  signInWithPopup,
  
  // Firestore
  db,
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  setDoc,
  onSnapshot,
  
  // Storage
  storage,
  ref,
  uploadBytes,
  getDownloadURL,
  uploadBytesResumable,
  uploadFileWithProgress,
  where,
  query,// Enhanced upload function
};