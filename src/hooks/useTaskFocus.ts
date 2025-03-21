import { useCallback, useRef, useState, type RefObject, createRef } from 'react';
import { Task } from '../types';

interface UseTaskFocusProps {
  tasks: Task[];
  onTaskSelect?: (taskId: string) => void;
}

interface UseTaskFocusReturn {
  focusedTaskId: string | null;
  selectedTaskId: string | null;
  taskRefs: RefObject<HTMLDivElement>[];
  getTaskRef: (index: number) => RefObject<HTMLDivElement>;
  handleTaskFocus: (taskId: string) => void;
  handleTaskSelect: (taskId: string) => void;
  handleKeyNavigation: (event: React.KeyboardEvent) => void;
  clearSelection: () => void;
}

export const useTaskFocus = ({ tasks, onTaskSelect }: UseTaskFocusProps): UseTaskFocusReturn => {
  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const taskRefs = useRef<RefObject<HTMLDivElement>[]>([]);

  // Initialize refs for each task
  if (taskRefs.current.length !== tasks.length) {
    taskRefs.current = Array(tasks.length)
      .fill(null)
      .map((_, i) => taskRefs.current[i] || createRef<HTMLDivElement>());
  }

  const getTaskRef = useCallback(
    (index: number) => taskRefs.current[index],
    []
  );

  const handleTaskFocus = useCallback((taskId: string) => {
    setFocusedTaskId(taskId);
  }, []);

  const handleTaskSelect = useCallback(
    (taskId: string) => {
      setSelectedTaskId(taskId);
      onTaskSelect?.(taskId);
    },
    [onTaskSelect]
  );

  const focusTask = useCallback((index: number) => {
    const ref = taskRefs.current[index];
    if (ref && ref.current) {
      ref.current.focus();
      setFocusedTaskId(tasks[index].id);
    }
  }, [tasks]);

  const handleKeyNavigation = useCallback(
    (event: React.KeyboardEvent) => {
      if (!focusedTaskId) return;

      const currentIndex = tasks.findIndex(task => task.id === focusedTaskId);
      if (currentIndex === -1) return;

      switch (event.key) {
        case 'ArrowDown':
        case 'j':
          event.preventDefault();
          if (currentIndex < tasks.length - 1) {
            focusTask(currentIndex + 1);
          }
          break;

        case 'ArrowUp':
        case 'k':
          event.preventDefault();
          if (currentIndex > 0) {
            focusTask(currentIndex - 1);
          }
          break;

        case 'Home':
          event.preventDefault();
          if (tasks.length > 0) {
            focusTask(0);
          }
          break;

        case 'End':
          event.preventDefault();
          if (tasks.length > 0) {
            focusTask(tasks.length - 1);
          }
          break;

        case ' ':
        case 'Enter':
          event.preventDefault();
          handleTaskSelect(focusedTaskId);
          break;

        default:
          break;
      }
    },
    [tasks, focusedTaskId, focusTask, handleTaskSelect]
  );

  const clearSelection = useCallback(() => {
    setSelectedTaskId(null);
  }, []);

  return {
    focusedTaskId,
    selectedTaskId,
    taskRefs: taskRefs.current,
    getTaskRef,
    handleTaskFocus,
    handleTaskSelect,
    handleKeyNavigation,
    clearSelection,
  };
};

// Export types
export type { UseTaskFocusProps, UseTaskFocusReturn };