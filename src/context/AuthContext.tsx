import { createContext, useContext, useEffect, useState } from 'react';
import { LoadingState } from '../components/common/LoadingState';
import { User, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { getFirebaseAuth, getFirebaseGoogleProvider, isFirebaseInitialized } from '../config/firebase';
import { config } from '../config/config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { useAuth };

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Track initialization status
  useEffect(() => {
    if (isFirebaseInitialized()) {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let checkInterval: NodeJS.Timeout | undefined;

    const setupAuthListener = () => {
      try {
        const auth = getFirebaseAuth();
        console.log('Setting up auth state listener with auth instance:', {
          currentUser: auth.currentUser,
          settings: auth.config,
        });
        
        unsubscribe = auth.onAuthStateChanged(
          (user: User | null) => {
            console.log('Auth state changed:', user ? `User ${user.uid}` : 'No user');
            setUser(user);
            setLoading(false);
            setIsInitialized(true); // Mark as initialized once we get the first auth state
          },
          (error: Error) => {
            console.error('Auth state error:', error);
            const firebaseError = error as { code?: string };
            if (firebaseError.code === 'auth/configuration-not-found') {
              console.error('Firebase configuration error - check your Firebase config settings and ensure all values are set correctly');
            }
            setError(error);
            setLoading(false);
            setIsInitialized(true); // Mark as initialized even if there's an error
          }
        );
        console.log('Auth state listener set up');
      } catch (error) {
        console.error('Error setting up auth listener:', error);
        setError(error as Error);
        setLoading(false);
        setIsInitialized(true); // Mark as initialized even if setup fails
      }
    };

    if (!isFirebaseInitialized()) {
      checkInterval = setInterval(() => {
        if (isFirebaseInitialized()) {
          clearInterval(checkInterval);
          setupAuthListener();
        }
      }, 100);
    } else {
      setupAuthListener();
    }

    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      if (!isInitialized || !isFirebaseInitialized()) {
        console.error('Attempted to sign in before Firebase initialization');
        throw new Error('Authentication system is not ready yet. Please try again in a moment.');
      }

      setLoading(true);
      setError(null);
      
      console.log('Starting Google sign-in...');
      
      // Get Firebase auth instance
      const auth = getFirebaseAuth();

      // Log the current environment and config
      console.log('Starting authentication with:', {
        domain: window.location.origin,
        authConfig: {
          domain: auth.config.authDomain,
          apiKey: !!auth.config.apiKey
        }
      });

      // Add short delay to ensure auth is ready
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const provider = getFirebaseGoogleProvider();
      
      try {
        const result = await signInWithPopup(auth, provider);
        console.log('Sign-in successful:', result.user.uid);
        setUser(result.user);
      } catch (error: any) {
        console.error('Detailed sign-in error:', {
          name: error.name,
          code: error.code,
          message: error.message,
          customData: error.customData,
          stack: error.stack
        });
        
        // Provide more user-friendly error messages
        if (error.code === 'auth/configuration-not-found') {
          throw new Error('Firebase authentication is not properly configured. Please verify your Firebase setup.');
        } else if (error.code === 'auth/popup-closed-by-user') {
          throw new Error('Sign-in was cancelled. Please try again.');
        } else if (error.code === 'auth/popup-blocked') {
          throw new Error('Sign-in popup was blocked. Please allow popups for this site and try again.');
        } else if (error.code === 'auth/unauthorized-domain') {
          throw new Error(`This domain is not authorized for Firebase authentication. Please add "${window.location.origin}" to your Firebase console's authorized domains.`);
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Sign-in error:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        code: error instanceof Error ? (error as any).code : 'unknown',
        initialized: isInitialized,
        firebaseInitialized: isFirebaseInitialized()
      });
      setError(error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      if (!isInitialized || !isFirebaseInitialized()) {
        console.error('Attempted to sign out before Firebase initialization');
        throw new Error('Authentication system is not ready yet. Please try again in a moment.');
      }

      setLoading(true);
      setError(null);
      console.log('Starting sign out...');
      
      // Wait a short time to ensure Firebase is fully initialized
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const auth = getFirebaseAuth();
      
      if (!auth.currentUser) {
        console.log('No user currently signed in');
        setUser(null);
        return;
      }
      
      await firebaseSignOut(auth);
      console.log('Sign out successful');
      setUser(null);
    } catch (error: any) {
      console.error('Sign out error:', {
        name: error.name,
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      throw new Error('Failed to sign out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    signInWithGoogle,
    signOut,
  };

  const getLoadingMessage = () => {
    if (!isInitialized) {
      return "Initializing Firebase authentication...";
    }
    if (loading) {
      return user ? "Refreshing authentication..." : "Checking authentication status...";
    }
    return "";
  };

  const shouldShowLoading = !isInitialized || loading;
  const loadingMessage = getLoadingMessage();

  return (
    <AuthContext.Provider value={value}>
      {shouldShowLoading ? <LoadingState message={loadingMessage} minHeight="100vh" /> : children}
    </AuthContext.Provider>
  );
};