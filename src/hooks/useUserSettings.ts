import { useState, useEffect } from 'react';
import { getFirebaseDb } from '../config/firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { useAuth } from '../context/AuthContext';
import { UserSettings, UserSettingsUpdate, defaultSettings } from '../types/settings';

export const useUserSettings = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const db = getFirebaseDb();
  const storage = getStorage();

  useEffect(() => {
    if (!user) {
      setSettings(null);
      setLoading(false);
      return;
    }

    const userSettingsRef = doc(db, 'userSettings', user.uid);
    
    const unsubscribe = onSnapshot(
      userSettingsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setSettings(snapshot.data() as UserSettings);
        } else {
          // Initialize with default settings if none exist
          setDoc(userSettingsRef, defaultSettings)
            .then(() => setSettings(defaultSettings))
            .catch((err) => setError(err.message));
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching settings:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, db]);

  const updateSettings = async (updates: UserSettingsUpdate) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      const userSettingsRef = doc(db, 'userSettings', user.uid);
      await updateDoc(userSettingsRef, updates);
    } catch (err) {
      console.error('Error updating settings:', err);
      throw err;
    }
  };

  const uploadProfilePhoto = async (file: File) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      const storageRef = ref(storage, `avatars/${user.uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Update user profile photo URL
      const { updateProfile } = await import('firebase/auth');
      await updateProfile(user, {
        photoURL: downloadURL,
      });

      return downloadURL;
    } catch (err) {
      console.error('Error uploading profile photo:', err);
      throw err;
    }
  };

  return {
    settings,
    loading,
    error,
    updateSettings,
    uploadProfilePhoto,
  };
};