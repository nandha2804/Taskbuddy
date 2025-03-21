import { createContext, useContext, useEffect, useState, useCallback, useTransition } from 'react';
import { Box } from '@chakra-ui/react';
import { LoadingState } from '../components/common/LoadingState';
import { User, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { getFirebaseAuth, getFirebaseGoogleProvider, isFirebaseInitialized } from '../config/firebase';
import { config } from '../config/config';

// Rate limiting configuration
const RATE_LIMIT_MS = 60000; // 1 minute
const MAX_ATTEMPTS = 5;

interface RateLimitState {
  attempts: number;
  lastAttempt: number;
}

const useRateLimit = () => {
  const [state, setState] = useState<RateLimitState>({
    attempts: 0,
    lastAttempt: 0
  });

  const checkRateLimit = useCallback(() => {
    const now = Date.now();
    if (now - state.lastAttempt > RATE_LIMIT_MS) {
      setState({ attempts: 0, lastAttempt: now });
      return true;
    }
    
    if (state.attempts >= MAX_ATTEMPTS) {
      const remainingTime = Math.ceil((RATE_LIMIT_MS - (now - state.lastAttempt)) / 1000);
      throw new Error(`Too many attempts. Please try again in ${remainingTime} seconds.`);
    }

    setState(prev => ({
      attempts: prev.attempts + 1,
      lastAttempt: now
    }));
    return true;
  }, [state]);

  const resetRateLimit = useCallback(() => {
    setState({ attempts: 0, lastAttempt: 0 });
  }, []);

  return { checkRateLimit, resetRateLimit };
};

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
  const [isPending, startTransition] = useTransition();
  const { checkRateLimit, resetRateLimit } = useRateLimit();

  // Initialize Firebase and set up auth listener
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let initializationTimer: NodeJS.Timeout | undefined;

    const setupAuthListener = () => {
      try {
        const auth = getFirebaseAuth();
        unsubscribe = auth.onAuthStateChanged(
          (user: User | null) => {
            startTransition(() => {
              setUser(user);
              setLoading(false);
              setIsInitialized(true);
            });
          },
          (error: Error) => {
            startTransition(() => {
              setError(error);
              setLoading(false);
              setIsInitialized(true);
            });
          }
        );
      } catch (error) {
        startTransition(() => {
          setError(error as Error);
          setLoading(false);
          setIsInitialized(true);
        });
      }
    };

    // Check for initialization with exponential backoff
    const checkInitialization = (attempt = 0) => {
      if (isFirebaseInitialized()) {
        setupAuthListener();
        return;
      }

      const delay = Math.min(1000 * Math.pow(2, attempt), 10000); // Max 10 second delay
      initializationTimer = setTimeout(() => checkInitialization(attempt + 1), delay);
    };

    checkInitialization();

    return () => {
      if (initializationTimer) clearTimeout(initializationTimer);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const attemptOperation = async <T extends unknown>(
    operation: () => Promise<T>,
    maxAttempts = 3
  ): Promise<T> => {
    checkRateLimit();
    
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const result = await operation();
        resetRateLimit(); // Reset on success
        return result;
      } catch (error: any) {
        lastError = error;
        if (error.code === 'auth/network-request-failed') {
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
          continue;
        }
        throw error;
      }
    }
    
    throw lastError || new Error('Operation failed after multiple attempts');
  };

  const signInWithGoogle = async () => {
    if (!isInitialized || !isFirebaseInitialized()) {
      throw new Error('Authentication system is not ready yet. Please try again in a moment.');
    }

    startTransition(() => {
      setLoading(true);
      setError(null);
    });

    try {
      await attemptOperation(async () => {
        const auth = getFirebaseAuth();
        const provider = getFirebaseGoogleProvider();
        const result = await signInWithPopup(auth, provider);
        startTransition(() => {
          setUser(result.user);
        });
      });
    } catch (error: any) {
      const errorMessages: Record<string, string> = {
        'auth/configuration-not-found': 'Authentication configuration error. Please contact support.',
        'auth/popup-closed-by-user': 'Sign-in was cancelled.',
        'auth/popup-blocked': 'Sign-in popup was blocked. Please allow popups for this site.',
        'auth/unauthorized-domain': `This domain is not authorized for authentication. Domain: ${window.location.origin}`,
        'auth/network-request-failed': 'Network error. Please check your connection.'
      };
      const errorMessage = errorMessages[error.code] || 'Sign-in failed. Please try again.';
      startTransition(() => {
        setError(new Error(errorMessage));
      });
      throw new Error(errorMessage);
    } finally {
      startTransition(() => {
        setLoading(false);
      });
    }
  };

  const signOut = async () => {
    if (!isInitialized || !isFirebaseInitialized()) {
      throw new Error('Authentication system is not ready yet. Please try again in a moment.');
    }

    startTransition(() => {
      setLoading(true);
      setError(null);
    });

    try {
      await attemptOperation(async () => {
        const auth = getFirebaseAuth();
        if (auth.currentUser) {
          await firebaseSignOut(auth);
        }
        startTransition(() => {
          setUser(null);
        });
      });
    } catch (error) {
      const errorMessage = 'Failed to sign out. Please try again.';
      startTransition(() => {
        setError(new Error(errorMessage));
      });
      throw new Error(errorMessage);
    } finally {
      startTransition(() => {
        setLoading(false);
      });
    }
  };

  const value = {
    user,
    loading: loading || isPending,
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

  const shouldShowLoading = !isInitialized || loading || isPending;
  const loadingMessage = getLoadingMessage();

  return (
    <AuthContext.Provider value={value}>
      {shouldShowLoading ? (
        <Box minH="100vh">
          <LoadingState message={loadingMessage} />
        </Box>
      ) : children}
    </AuthContext.Provider>
  );
};