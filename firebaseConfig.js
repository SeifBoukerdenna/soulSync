// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_apiKey,
    authDomain: process.env.EXPO_PUBLIC_authDomain,
    projectId: process.env.EXPO_PUBLIC_projectId,
    storageBucket: process.env.EXPO_PUBLIC_storageBucket,
    messagingSenderId: process.env.EXPO_PUBLIC_messagingSenderId,
    appId: process.env.EXPO_PUBLIC_appId,
    measurementId: process.env.EXPO_PUBLIC_measurementId,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage and Realtime Database
const storage = getStorage(app);
const database = getDatabase(app);

export { storage, database };
