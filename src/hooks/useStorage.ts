import { useState } from 'react';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  StorageError,
} from 'firebase/storage';
import { getFirebaseStorage, isFirebaseInitialized } from '../config/firebase';
import { config } from '../config/config';
import { ERROR_MESSAGES, UploadErrorMessage } from '../constants';

export interface UseStorageReturn {
  uploadFile: (
    file: File,
    folder: string,
    customFileName?: string
  ) => Promise<string>;
  deleteFile: (url: string) => Promise<void>;
  progress: number;
  error: Error | null;
  isUploading: boolean;
}

interface StorageProgressState {
  progress: number;
  error: Error | null;
  isUploading: boolean;
}

class StorageUploadError extends Error {
  constructor(message: UploadErrorMessage) {
    super(message);
    this.name = 'StorageUploadError';
  }
}

export const useStorage = (): UseStorageReturn => {
  const [state, setState] = useState<StorageProgressState>({
    progress: 0,
    error: null,
    isUploading: false,
  });

  const validateFile = (file: File): void => {
    if (file.size > config.defaults.maxAttachmentSize) {
      throw new StorageUploadError(ERROR_MESSAGES.upload.sizeTooLarge);
    }

    if (!config.defaults.acceptedFileTypes.all.includes(file.type)) {
      throw new StorageUploadError(ERROR_MESSAGES.upload.invalidType);
    }
  };

  const generateFileName = (file: File, customFileName?: string): string => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop();
    
    return customFileName
      ? `${customFileName}.${extension}`
      : `${timestamp}-${randomString}.${extension}`;
  };

  const handleStorageError = (error: StorageError): never => {
    switch (error.code) {
      case 'storage/unauthorized':
        throw new StorageUploadError(ERROR_MESSAGES.upload.unauthorized);
      case 'storage/canceled':
        throw new StorageUploadError(ERROR_MESSAGES.upload.uploadCanceled);
      case 'storage/retry-limit-exceeded':
        throw new StorageUploadError(ERROR_MESSAGES.upload.retryLimitExceeded);
      case 'storage/invalid-checksum':
        throw new StorageUploadError(ERROR_MESSAGES.upload.integrityCheckFailed);
      default:
        throw new StorageUploadError(ERROR_MESSAGES.upload.unknown);
    }
  };

  const uploadFile = async (
    file: File,
    folder: string,
    customFileName?: string
  ): Promise<string> => {
    try {
      setState(prev => ({ ...prev, isUploading: true, error: null }));

      validateFile(file);

      if (!isFirebaseInitialized()) {
        throw new StorageUploadError(ERROR_MESSAGES.upload.unknown);
      }

      const fileName = generateFileName(file, customFileName);
      const storageRef = ref(getFirebaseStorage(), `${folder}/${fileName}`);
      
      return new Promise((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setState(prev => ({ ...prev, progress }));
          },
          (error: StorageError) => {
            const uploadError = handleStorageError(error);
            setState(prev => ({
              ...prev,
              error: uploadError,
              isUploading: false,
            }));
            reject(uploadError);
          },
          async () => {
            try {
              const url = await getDownloadURL(storageRef);
              setState(prev => ({
                ...prev,
                progress: 100,
                isUploading: false,
              }));
              resolve(url);
            } catch (error) {
              const uploadError = new StorageUploadError(ERROR_MESSAGES.upload.uploadFailed);
              setState(prev => ({
                ...prev,
                error: uploadError,
                isUploading: false,
              }));
              reject(uploadError);
            }
          }
        );
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as Error,
        isUploading: false,
      }));
      throw error;
    }
  };

  const deleteFile = async (url: string): Promise<void> => {
    try {
      if (!isFirebaseInitialized()) {
        throw new StorageUploadError(ERROR_MESSAGES.upload.unknown);
      }
      const fileRef = ref(getFirebaseStorage(), url);
      await deleteObject(fileRef);
    } catch (error) {
      const deleteError = new StorageUploadError(ERROR_MESSAGES.upload.uploadFailed);
      setState(prev => ({ ...prev, error: deleteError }));
      throw deleteError;
    }
  };

  return {
    uploadFile,
    deleteFile,
    progress: state.progress,
    error: state.error,
    isUploading: state.isUploading,
  };
};

// Helper function to extract file path from Firebase Storage URL
export const getFilePathFromUrl = (url: string): string => {
  try {
    const baseUrl = `https://firebasestorage.googleapis.com/v0/b/${config.firebase.storageBucket}/o/`;
    const filePathEncoded = url.replace(baseUrl, '').split('?')[0];
    return decodeURIComponent(filePathEncoded);
  } catch (error) {
    console.error('Error extracting file path from URL:', error);
    return '';
  }
};