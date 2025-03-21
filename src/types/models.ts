export interface User {
  id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: 'work' | 'personal' | 'shopping' | 'others';
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  userId: string;
  teamId?: string;
  assignedTo?: string[];
  attachments?: Attachment[];
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  status: 'todo' | 'inProgress' | 'completed';
  completionDetails?: {
    description: string;
    attachments: Attachment[];
    completedAt: Date;
    completedBy: string;
  };
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  members: TeamMember[];
  memberEmails: string[]; // Array of member emails for efficient querying
  invitedEmails: string[];
  settings?: TeamSettings;
}

export interface TeamMember {
  id: string;
  email: string;
  displayName: string | null;
  role: 'admin' | 'member';
  photoURL?: string;
  joinedAt: Date;
}

export interface TeamSettings {
  allowMemberInvites: boolean;
  allowTaskAssignment: boolean;
  allowAttachments: boolean;
  maxAttachmentSize: number;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  teams: string[];
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
  desktopNotifications: boolean;
  defaultTaskView: 'list' | 'board';
  defaultTaskCategory: 'work' | 'personal' | 'shopping' | 'others';
}