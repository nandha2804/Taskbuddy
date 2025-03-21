export interface TaskInput {
  title: string;
  description: string;
  category: 'work' | 'personal' | 'shopping' | 'others';
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  dueDate: string | null;
  labels: string[];
  attachments: string[];
  teamId?: string;
  assignedTo?: string[];
  status?: TaskStatus;
}

export interface Task extends Omit<TaskInput, 'dueDate'> {
  id: string;
  userId: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  dueDate: string | null;
  teamId?: string;
  assignedTo: string[];
}

export type TaskStatus = 'active' | 'inProgress' | 'completed' | 'deleted';

export interface TaskFilter {
  category?: string;
  priority?: string;
  status?: 'all' | 'active' | 'completed';
  search?: string;
  teamId?: string;
  assignedTo?: string;
}

export interface TaskSort {
  field: string;
  direction: 'asc' | 'desc';
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttachmentMetadata {
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  uploadedBy: string;
}