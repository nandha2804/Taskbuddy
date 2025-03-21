const requireEnvVar = (name: string): string => {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

// Validate Firebase configuration
const validateFirebaseConfig = () => {
  const required = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];

  const missing = required.filter(key => !import.meta.env[key]);
  if (missing.length > 0) {
    throw new Error(`
      Missing required Firebase configuration. Please check your .env file.
      Missing variables: ${missing.join(', ')}
      
      1. Create a Firebase project at https://console.firebase.google.com
      2. Get your configuration from Project Settings > Your Apps
      3. Copy the values to your .env file
    `);
  }
};

// Run validation
validateFirebaseConfig();

export const config = {
  env: process.env.NODE_ENV || 'development',
  firebase: {
    apiKey: requireEnvVar('VITE_FIREBASE_API_KEY'),
    authDomain: requireEnvVar('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: requireEnvVar('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: requireEnvVar('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: requireEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: requireEnvVar('VITE_FIREBASE_APP_ID'),
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID, // Optional
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Task Manager',
    version: '1.0.0',
    description: import.meta.env.VITE_APP_DESCRIPTION || 'A modern task management application',
  },
  defaults: {
    avatar: 'https://bit.ly/broken-link', // Fallback avatar URL
    tasksPerPage: 10,
    maxAttachmentSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 5, // Maximum number of files per task
    acceptedFileTypes: {
      images: ['image/jpeg', 'image/png', 'image/gif'],
      documents: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ],
      all: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]
    }
  },
  routes: {
    home: '/',
    login: '/login',
    tasks: '/tasks',
    board: '/board',
    profile: '/profile',
    team: '/team',
  },
  storage: {
    attachments: 'attachments',
    avatars: 'avatars',
    maxRetries: 3,
    retryDelay: 1000, // milliseconds
  },
  toast: {
    defaultDuration: 3000,
    errorDuration: 5000,
    successDuration: 2000,
  },
  cache: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  },
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 50,
  },
};

export const isProduction = config.env === 'production';
export const isDevelopment = config.env === 'development';
export const isTest = config.env === 'test';

// Type-safe route access
export type AppRoutes = typeof config.routes;
export type RouteKeys = keyof AppRoutes;
export type RoutePaths = AppRoutes[RouteKeys];

// Type-safe storage folder access
export type StorageFolders = typeof config.storage;
export type StorageFolderKeys = keyof StorageFolders;
export type StorageFolderPaths = StorageFolders[StorageFolderKeys];