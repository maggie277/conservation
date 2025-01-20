import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

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

export { db, auth };
