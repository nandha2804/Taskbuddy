import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAnalytics, Analytics } from 'firebase/analytics';
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  connectAuthEmulator,
  browserLocalPersistence
} from 'firebase/auth';
import { 
  getFirestore, 
  Firestore, 
  connectFirestoreEmulator 
} from 'firebase/firestore';
import { 
  getStorage, 
  FirebaseStorage, 
  connectStorageEmulator 
} from 'firebase/storage';
import { config, isDevelopment } from './config';

// Track initialization state
let initialized = false;

// Firebase instances
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let analytics: Analytics | null = null;
let googleProvider: GoogleAuthProvider | null = null;

// Initialize Firebase with config
const firebaseConfig = {
  apiKey: config.firebase.apiKey,
  authDomain: config.firebase.authDomain,
  projectId: config.firebase.projectId,
  storageBucket: config.firebase.storageBucket,
  messagingSenderId: config.firebase.messagingSenderId,
  appId: config.firebase.appId,
  measurementId: config.firebase.measurementId
};

if (!firebaseConfig.apiKey || !firebaseConfig.authDomain) {
  throw new Error('Missing required Firebase configuration');
}

// Initialize Firebase
const initializeFirebase = async () => {
  try {
    app = initializeApp(firebaseConfig);
    
    // Initialize services
    auth = getAuth(app);
    await auth.setPersistence(browserLocalPersistence);
    
    db = getFirestore(app);
    storage = getStorage(app);
    
    if (!isDevelopment) {
      analytics = getAnalytics(app);
    }
    
    // Initialize Google Auth Provider
    googleProvider = new GoogleAuthProvider();
    googleProvider.addScope('profile');
    googleProvider.addScope('email');
    
    console.log('Firebase initialized successfully', {
      authDomain: auth.config.authDomain,
      projectId: firebaseConfig.projectId
    });
    
    initialized = true;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    initialized = false;
    throw error;
  }
};

// Initialize immediately
initializeFirebase().catch(error => {
  console.error('Failed to initialize Firebase:', error);
});


// Helper function to ensure Firebase is initialized
const ensureInitialized = () => {
  if (!initialized) {
    throw new Error('Firebase is not yet initialized');
  }
};

// Export Firebase instances
export const getFirebaseApp = () => {
  ensureInitialized();
  return app!;
};

export const getFirebaseAuth = () => {
  ensureInitialized();
  return auth!;
};

export const getFirebaseDb = () => {
  ensureInitialized();
  return db!;
};

export const getFirebaseStorage = () => {
  ensureInitialized();
  return storage!;
};

export const getFirebaseAnalytics = () => {
  ensureInitialized();
  return analytics!;
};

export const getFirebaseGoogleProvider = () => {
  ensureInitialized();
  return googleProvider!;
};

export const isFirebaseInitialized = () => {
  const isReady = initialized &&
    app !== null &&
    auth !== null &&
    db !== null &&
    auth.app === app;
  
  if (!isReady) {
    console.warn('Firebase not fully initialized:', {
      initialized,
      hasApp: !!app,
      hasAuth: !!auth,
      hasDb: !!db,
      authDomain: auth?.config?.authDomain,
      projectId: app?.options.projectId
    });
  }
  
  return isReady;
};

// Export type-safe collection references
export type Collections = {
  tasks: 'tasks';
  userProfiles: 'userProfiles';
  teams: 'teams';
};

export const collections: Collections = {
  tasks: 'tasks',
  userProfiles: 'userProfiles',
  teams: 'teams'
};

// Export storage folders
export const storageFolders = {
  attachments: 'attachments',
  avatars: 'avatars'
} as const;
