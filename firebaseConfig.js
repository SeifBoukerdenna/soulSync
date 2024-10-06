// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration from the Firebase console
const firebaseConfig = {
    apiKey: "AIzaSyB5BrruE_WquI850I1Sdyw4M6drhIordks",
    authDomain: "soulsync-db4ba.firebaseapp.com",
    projectId: "soulsync-db4ba",
    storageBucket: "soulsync-db4ba.appspot.com",
    messagingSenderId: "977770924346",
    appId: "1:977770924346:web:78787aff57e5abf157e803",
    measurementId: "G-4VZGNLBHQJ"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Get a reference to the storage service
const storage = getStorage(app);

export { storage };
