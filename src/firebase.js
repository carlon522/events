import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCDnCceoPkxneEN_GO4fSUgIVSq0fzRaGs",
    authDomain: "testapp-e41d5.firebaseapp.com",
    projectId: "testapp-e41d5",
    storageBucket: "testapp-e41d5.appspot.com",
    messagingSenderId: "905132711526",
    appId: "1:905132711526:web:6654834a9d3d82bb3217a7"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

import { getAuth } from "firebase/auth";
const auth = getAuth(app);
export { auth };
