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

// Track initialization promise
let initializationPromise: Promise<void> | null = null;

// Initialize Firebase
const initializeFirebase = async (): Promise<void> => {
  // Return existing initialization promise if already in progress
  if (initializationPromise) return initializationPromise;
  
  // Return immediately if already initialized
  if (initialized && app && auth && db) return Promise.resolve();

  initializationPromise = (async () => {
    try {
      app = initializeApp(firebaseConfig);

      // Initialize auth first and wait for it
      auth = getAuth(app);
      await auth.setPersistence(browserLocalPersistence);
      
      // Wait for auth to be ready
      await new Promise<void>((resolve) => {
        const unsubscribe = auth!.onAuthStateChanged(() => {
          unsubscribe();
          resolve();
        });
      });

      // Initialize other services
      db = getFirestore(app);
      storage = getStorage(app);
      
      if (!isDevelopment) {
        analytics = getAnalytics(app);
      }

      // Configure Google Auth Provider with cookie-less compatibility
      googleProvider = new GoogleAuthProvider();
      googleProvider.addScope('profile');
      googleProvider.addScope('email');
      
      // Add security measures with SameSite cookie handling
      googleProvider.setCustomParameters({
        prompt: 'select_account',
        access_type: 'offline',
        // Enable cross-origin isolation compatibility
        authType: 'signInWithRedirect'
      });

      // Set up token refresh mechanism
      auth.onAuthStateChanged(async (user) => {
        if (user) {
          const refreshToken = async () => {
            try {
              await user.getIdToken(true);
            } catch (error) {
              console.error('Token refresh failed:', error);
            }
          };

          // Initial refresh
          await refreshToken();
          
          // Set up periodic refresh
          const tokenRefreshInterval = setInterval(refreshToken, 30 * 60 * 1000);
          return () => clearInterval(tokenRefreshInterval);
        }
      });

      initialized = true;
    } catch (error) {
      console.error('Firebase initialization error:', error);
      initialized = false;
      throw error;
    } finally {
      initializationPromise = null;
    }
  })();

  return initializationPromise;
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

// Export Firebase instances with better initialization checks
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
  return initialized && app !== null && auth !== null && db !== null && auth.app === app;
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
