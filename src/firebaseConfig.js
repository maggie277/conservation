import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  deleteDoc,
  updateDoc,
  arrayUnion,
  runTransaction
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBzIGrUOr7ax5_YPxGP1_JqW9E15VsKSa8",
  authDomain: "crowdfunding-platform-f86e3.firebaseapp.com",
  projectId: "crowdfunding-platform-f86e3",
  storageBucket: "crowdfunding-platform-f86e3.appspot.com",
  messagingSenderId: "1020363160332",
  appId: "1:1020363160332:web:7d16dbfd16be95ffd46729",
  measurementId: "G-9B363VGHCH"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Utility function for user type validation
const getUserType = async (uid) => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  return userDoc.exists() ? userDoc.data().type : null;
};

export { 
  db, 
  auth, 
  storage, 
  getUserType,
  // Export all Firestore functions you need
  doc, 
  getDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  deleteDoc,
  updateDoc,
  arrayUnion,
  runTransaction
};