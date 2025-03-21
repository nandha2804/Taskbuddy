import { useCallback } from 'react';
import { useTasks } from './useTasks';
import { useCustomToast } from '../components/common/CustomToast';
import { Task, TaskInput } from '../types';
import { useAuth } from '../context/AuthContext';

interface UseTaskActionsProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useTaskActions = ({
  onSuccess,
  onError,
}: UseTaskActionsProps = {}) => {
  const { user } = useAuth();
  const taskToast = useCustomToast();
  const { addTask, updateTask, deleteTask } = useTasks(user?.uid);

  const handleCreateTask = useCallback(async (taskData: TaskInput) => {
    try {
      const newTask = await addTask(taskData);
      taskToast.success('Task created successfully');
      onSuccess?.();
      return newTask;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to create task');
      taskToast.error('Failed to create task', err.message);
      onError?.(err);
      throw err;
    }
  }, [addTask, taskToast, onSuccess, onError]);

  const handleUpdateTask = useCallback(async (taskId: string, data: Partial<TaskInput>) => {
    try {
      await updateTask({ id: taskId, data });
      taskToast.success('Task updated successfully');
      onSuccess?.();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to update task');
      taskToast.error('Failed to update task', err.message);
      onError?.(err);
      throw err;
    }
  }, [updateTask, taskToast, onSuccess, onError]);

  const handleDeleteTask = useCallback(async (taskId: string) => {
    try {
      await deleteTask(taskId);
      taskToast.success('Task deleted successfully');
      onSuccess?.();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to delete task');
      taskToast.error('Failed to delete task', err.message);
      onError?.(err);
      throw err;
    }
  }, [deleteTask, taskToast, onSuccess, onError]);

  const handleToggleComplete = useCallback(async (task: Task) => {
    try {
      await handleUpdateTask(task.id, {
        completed: !task.completed,
      });
      taskToast.success(`Task marked as ${task.completed ? 'incomplete' : 'complete'}`);
    } catch (error) {
      // Error is already handled in handleUpdateTask
      throw error;
    }
  }, [handleUpdateTask, taskToast]);

  const handleDuplicateTask = useCallback(async (task: Task) => {
    try {
      const duplicateData: TaskInput = {
        ...task,
        title: `Copy of ${task.title}`,
        completed: false,
        dueDate: null,
      };
      const newTask = await handleCreateTask(duplicateData);
      taskToast.success('Task duplicated successfully');
      return newTask;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to duplicate task');
      taskToast.error('Failed to duplicate task', err.message);
      throw err;
    }
  }, [handleCreateTask, taskToast]);

  const handleArchiveTask = useCallback(async (task: Task) => {
    try {
      await handleUpdateTask(task.id, {
        status: 'archived',
      });
      taskToast.success('Task archived successfully');
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to archive task');
      taskToast.error('Failed to archive task', err.message);
      throw err;
    }
  }, [handleUpdateTask, taskToast]);

  const handleShareTask = useCallback(async (task: Task) => {
    try {
      // This is a placeholder for task sharing functionality
      // Implement actual sharing logic here
      const shareUrl = `${window.location.origin}/tasks/${task.id}`;
      await navigator.clipboard.writeText(shareUrl);
      taskToast.success('Task link copied to clipboard');
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to share task');
      taskToast.error('Failed to share task', err.message);
      throw err;
    }
  }, [taskToast]);

  return {
    createTask: handleCreateTask,
    updateTask: handleUpdateTask,
    deleteTask: handleDeleteTask,
    toggleComplete: handleToggleComplete,
    duplicateTask: handleDuplicateTask,
    archiveTask: handleArchiveTask,
    shareTask: handleShareTask,
  };
};

// Export types
export interface UseTaskActionsReturn {
  createTask: (taskData: TaskInput) => Promise<Task>;
  updateTask: (taskId: string, data: Partial<TaskInput>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleComplete: (task: Task) => Promise<void>;
  duplicateTask: (task: Task) => Promise<Task>;
  archiveTask: (task: Task) => Promise<void>;
  shareTask: (task: Task) => Promise<void>;
}

export type { UseTaskActionsProps };