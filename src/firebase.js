import {initializeApp} from "firebase/app";
import {getStorage} from "firebase/storage";
import {getFirestore} from "firebase/firestore";
import {config} from "./config";

// Initialize Firebase
export const app = initializeApp(config.firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);