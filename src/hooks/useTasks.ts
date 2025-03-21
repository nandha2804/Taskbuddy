import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  serverTimestamp,
  DocumentReference,
  Timestamp,
  Query,
} from 'firebase/firestore';
import { getFirebaseDb, isFirebaseInitialized, collections } from '../config/firebase';
import { Task, TaskInput, TaskStatus } from '../types';

export interface UseTasksParams {
  userId?: string;
  teamId?: string;
  assignedToMe?: boolean;
}

export interface UseTasksReturn {
  tasks: Task[] | undefined;
  loading: boolean;
  error: Error | null;
  addTask: (task: TaskInput) => Promise<Task>;
  updateTask: (params: { id: string; data: Partial<TaskInput> }) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  batchDeleteTasks: (ids: string[]) => Promise<void>;
}

export const useTasks = ({ userId, teamId, assignedToMe }: UseTasksParams): UseTasksReturn => {
  const queryClient = useQueryClient();
  
  const getTasksCollection = () => {
    if (!isFirebaseInitialized()) {
      throw new Error('Firebase is not initialized');
    }
    return collection(getFirebaseDb(), collections.tasks);
  };

  // Check initialization status
  const checkFirebaseInit = () => {
    if (!isFirebaseInitialized()) {
      throw new Error('Firebase is not fully initialized. Please try again in a moment.');
    }
  };

  // Build query based on parameters
  const buildTasksQuery = () => {
    const tasksCollection = getTasksCollection();
    const conditions = [];

    // Base conditions
    conditions.push(where('status', '!=', 'deleted'));

    if (userId) {
      conditions.push(where('userId', '==', userId));
    }

    if (teamId) {
      conditions.push(where('teamId', '==', teamId));
    }

    if (assignedToMe && userId) {
      conditions.push(where('assignedTo', 'array-contains', userId));
    }

    return query(
      tasksCollection,
      ...conditions,
      orderBy('status'),
      orderBy('createdAt', 'desc')
    );
  };

  // Fetch tasks
  const {
    data: tasks,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ['tasks', { userId, teamId, assignedToMe }],
    queryFn: async () => {
      try {
        checkFirebaseInit();
        
        const q = buildTasksQuery();
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate().toISOString(),
          updatedAt: doc.data().updatedAt?.toDate().toISOString(),
          dueDate: doc.data().dueDate?.toDate().toISOString() || null,
        })) as Task[];
      } catch (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }
    },
    enabled: !!(userId || teamId || assignedToMe),
  });

  // Add task
  const addTaskMutation = useMutation({
    mutationFn: async (newTask: TaskInput): Promise<Task> => {
      if (!userId) throw new Error('User not authenticated');
      checkFirebaseInit();

      try {
        const now = Timestamp.now();
        const taskWithMetadata = {
          ...newTask,
          userId,
          status: newTask.status || 'active' as TaskStatus,
          createdAt: now,
          updatedAt: now,
          dueDate: newTask.dueDate ? Timestamp.fromDate(new Date(newTask.dueDate)) : null,
        };

        const taskCollection = getTasksCollection();
        const docRef = await addDoc(taskCollection, taskWithMetadata);
        
        return {
          id: docRef.id,
          ...newTask,
          userId,
          status: taskWithMetadata.status,
          createdAt: now.toDate().toISOString(),
          updatedAt: now.toDate().toISOString(),
          dueDate: newTask.dueDate,
        };
      } catch (error) {
        console.error('Error adding task:', error);
        throw new Error(
          error instanceof Error
            ? error.message
            : 'Failed to create task. Please try again.'
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // Update task
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TaskInput> }) => {
      if (!userId) throw new Error('User not authenticated');
      checkFirebaseInit();

      const taskRef = doc(getFirebaseDb(), collections.tasks, id);
      const updateData = {
        ...data,
        updatedAt: serverTimestamp(),
        dueDate: data.dueDate ? Timestamp.fromDate(new Date(data.dueDate)) : null,
      };

      await updateDoc(taskRef, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // Delete task (soft delete)
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      if (!userId) throw new Error('User not authenticated');
      checkFirebaseInit();

      const taskRef = doc(getFirebaseDb(), collections.tasks, taskId);
      await updateDoc(taskRef, {
        status: 'deleted' as TaskStatus,
        updatedAt: serverTimestamp(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // Batch delete tasks
  const batchDeleteMutation = useMutation({
    mutationFn: async (taskIds: string[]) => {
      if (!userId) throw new Error('User not authenticated');
      checkFirebaseInit();
      
      await Promise.all(
        taskIds.map((taskId) => 
          updateDoc(doc(getFirebaseDb(), collections.tasks, taskId), {
            status: 'deleted' as TaskStatus,
            updatedAt: serverTimestamp(),
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  return {
    tasks,
    loading,
    error: error as Error | null,
    addTask: addTaskMutation.mutateAsync,
    updateTask: updateTaskMutation.mutateAsync,
    deleteTask: deleteTaskMutation.mutateAsync,
    batchDeleteTasks: batchDeleteMutation.mutateAsync,
  };
};