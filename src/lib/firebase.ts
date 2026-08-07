import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit,
  DocumentData
} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCKJzQYESRUapotXUmPamJd2HXen87tujA",
  authDomain: "fsmec-us.firebaseapp.com",
  projectId: "fsmec-us",
  storageBucket: "fsmec-us.firebasestorage.app",
  messagingSenderId: "177466914693",
  appId: "1:177466914693:web:b8bdd515983aeeda2af6ec"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Simple document and query caching layer to limit reads as requested
// "cachewhatever they view so it count as 1 reads alone"
const docCache = new Map<string, { data: any, timestamp: number }>();
const queryCache = new Map<string, { data: any[], timestamp: number }>();

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache TTL

export function getCachedDoc(collectionName: string, docId: string): any | null {
  const cacheKey = `${collectionName}:${docId}`;
  const cached = docCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

export function setCachedDoc(collectionName: string, docId: string, data: any) {
  const cacheKey = `${collectionName}:${docId}`;
  docCache.set(cacheKey, { data, timestamp: Date.now() });
}

export function invalidateDocCache(collectionName: string, docId: string) {
  docCache.delete(`${collectionName}:${docId}`);
  // Also clear any query caches for this collection to stay fresh
  for (const key of Array.from(queryCache.keys())) {
    if (key.startsWith(`${collectionName}:`)) {
      queryCache.delete(key);
    }
  }
}

export function getCachedQuery(collectionName: string, queryParamsKey: string): any[] | null {
  const cacheKey = `${collectionName}:query:${queryParamsKey}`;
  const cached = queryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

export function setCachedQuery(collectionName: string, queryParamsKey: string, data: any[]) {
  const cacheKey = `${collectionName}:query:${queryParamsKey}`;
  queryCache.set(cacheKey, { data, timestamp: Date.now() });
  
  // Also populate individual document caches to avoid double-fetching if they view them individually!
  data.forEach(item => {
    if (item && item.id) {
      setCachedDoc(collectionName, item.id, item);
    } else if (item && item.uid) {
      setCachedDoc(collectionName, item.uid, item);
    }
  });
}

export function clearAllCaches() {
  docCache.clear();
  queryCache.clear();
}
