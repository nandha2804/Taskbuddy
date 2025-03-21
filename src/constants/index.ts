export const TASK_CATEGORIES = {
  work: {
    label: 'Work',
    color: 'brand',
    bg: 'brand.50',
    textColor: 'brand.700',
  },
  personal: {
    label: 'Personal',
    color: 'purple',
    bg: 'purple.50',
    textColor: 'purple.700',
  },
  shopping: {
    label: 'Shopping',
    color: 'blue',
    bg: 'blue.50',
    textColor: 'blue.700',
  },
  others: {
    label: 'Others',
    color: 'gray',
    bg: 'gray.50',
    textColor: 'gray.700',
  },
} as const;

export const TASK_PRIORITIES = {
  low: {
    label: 'Low',
    color: 'green',
    bg: 'green.50',
    textColor: 'green.700',
  },
  medium: {
    label: 'Medium',
    color: 'orange',
    bg: 'orange.50',
    textColor: 'orange.700',
  },
  high: {
    label: 'High',
    color: 'red',
    bg: 'red.50',
    textColor: 'red.700',
  },
} as const;

export const TASK_STATUS = {
  all: {
    label: 'All Tasks',
    color: 'gray',
    bg: 'gray.50',
    textColor: 'gray.700',
  },
  completed: {
    label: 'Completed',
    color: 'green',
    bg: 'green.50',
    textColor: 'green.700',
  },
  incomplete: {
    label: 'In Progress',
    color: 'brand',
    bg: 'brand.50',
    textColor: 'brand.700',
  },
} as const;

export const SORT_OPTIONS = {
  dueDate: 'Due Date',
  priority: 'Priority',
  createdAt: 'Created Date',
  title: 'Title',
} as const;

export const DATE_FORMAT = {
  display: 'MMM d, yyyy',
  input: 'yyyy-MM-dd',
} as const;

// Constants for form validation
export const MAX_TITLE_LENGTH = 100;
export const MAX_DESCRIPTION_LENGTH = 500;
export const MAX_ATTACHMENTS = 5;
export const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024; // 5MB

// File types
export const FILE_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
} as const;

// Error messages
export const ERROR_MESSAGES = {
  auth: {
    notSignedIn: 'You must be signed in to perform this action',
    sessionExpired: 'Your session has expired. Please sign in again',
  },
  task: {
    createFailed: 'Failed to create task. Please try again',
    updateFailed: 'Failed to update task. Please try again',
    deleteFailed: 'Failed to delete task. Please try again',
    notFound: 'Task not found',
  },
  upload: {
    sizeTooLarge: `File size must be less than ${MAX_ATTACHMENT_SIZE / 1024 / 1024}MB`,
    invalidType: 'Invalid file type',
    uploadFailed: 'Failed to upload file. Please try again',
    uploadCanceled: 'Upload was canceled',
    unauthorized: 'User not authorized to perform this action',
    retryLimitExceeded: 'Upload failed: too many retries',
    integrityCheckFailed: 'Upload failed: file integrity check failed',
    unknown: 'An unknown error occurred during upload',
  },
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  task: {
    created: 'Task created successfully',
    updated: 'Task updated successfully',
    deleted: 'Task deleted successfully',
    statusChanged: 'Task status updated',
  },
  upload: {
    completed: 'File uploaded successfully',
    deleted: 'File deleted successfully',
  },
} as const;

// Type exports
export type TaskCategory = keyof typeof TASK_CATEGORIES;
export type TaskPriority = keyof typeof TASK_PRIORITIES;
export type TaskStatus = keyof typeof TASK_STATUS;
export type SortOption = keyof typeof SORT_OPTIONS;
export type UploadErrorMessage = typeof ERROR_MESSAGES.upload[keyof typeof ERROR_MESSAGES.upload];

// Helper types
export type ColorScheme =
  | 'brand'
  | 'blue'
  | 'purple'
  | 'gray'
  | 'green'
  | 'orange'
  | 'red';

export interface BaseConfig {
  label: string;
  color: ColorScheme;
  bg: string;
  textColor: string;
}

export interface CategoryConfig extends BaseConfig {
  icon?: string;
}

export interface PriorityConfig extends BaseConfig {
  icon?: string;
}

export interface StatusConfig extends BaseConfig {
}