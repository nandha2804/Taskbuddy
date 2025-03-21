import { useState, useMemo } from 'react';
import { Task } from '../types';
import { filterTasks, sortTasks } from '../utils/taskUtils';
import { SortOption } from '../constants';

export interface TaskFilters {
  searchQuery: string;
  category: string;
  priority: string;
  status: 'all' | 'completed' | 'incomplete';
}

interface TaskCounts {
  all: number;
  completed: number;
  incomplete: number;
  [category: string]: number;
}

interface UseTaskFiltersReturn {
  filters: TaskFilters;
  sortConfig: {
    sortBy: SortOption;
    ascending: boolean;
  };
  filteredTasks: Task[];
  taskCounts: TaskCounts;
  setSearchQuery: (query: string) => void;
  setCategory: (category: string) => void;
  setPriority: (priority: string) => void;
  setStatus: (status: 'all' | 'completed' | 'incomplete') => void;
  setSortBy: (sortBy: SortOption) => void;
  toggleSortDirection: () => void;
  resetFilters: () => void;
}

const defaultFilters: TaskFilters = {
  searchQuery: '',
  category: 'all',
  priority: 'all',
  status: 'all',
};

export const useTaskFilters = (tasks: Task[] | undefined): UseTaskFiltersReturn => {
  const [filters, setFilters] = useState<TaskFilters>(defaultFilters);
  const [sortBy, setSortBy] = useState<SortOption>('createdAt');
  const [ascending, setAscending] = useState(false);

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    return sortTasks(
      filterTasks(tasks, filters),
      sortBy,
      ascending
    );
  }, [tasks, filters, sortBy, ascending]);

  const taskCounts: TaskCounts = useMemo(() => {
    const counts: TaskCounts = {
      all: filteredTasks.length,
      completed: filteredTasks.filter(task => task.completed).length,
      incomplete: filteredTasks.filter(task => !task.completed).length,
    };

    filteredTasks.forEach((task) => {
      if (task.category) {
        counts[task.category] = (counts[task.category] || 0) + 1;
      }
    });

    return counts;
  }, [filteredTasks]);

  const setSearchQuery = (query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
  };

  const setCategory = (category: string) => {
    setFilters(prev => ({ ...prev, category }));
  };

  const setPriority = (priority: string) => {
    setFilters(prev => ({ ...prev, priority }));
  };

  const setStatus = (status: 'all' | 'completed' | 'incomplete') => {
    setFilters(prev => ({ ...prev, status }));
  };

  const toggleSortDirection = () => {
    setAscending(prev => !prev);
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    setSortBy('createdAt');
    setAscending(false);
  };

  return {
    filters,
    sortConfig: {
      sortBy,
      ascending,
    },
    filteredTasks,
    taskCounts,
    setSearchQuery,
    setCategory,
    setPriority,
    setStatus,
    setSortBy,
    toggleSortDirection,
    resetFilters,
  };
};

// Helper function to check if any filters are active
export const hasActiveFilters = (filters: TaskFilters): boolean => {
  return (
    filters.searchQuery !== '' ||
    filters.category !== 'all' ||
    filters.priority !== 'all' ||
    filters.status !== 'all'
  );
};

// Helper function to get filter description
export const getFilterDescription = (filters: TaskFilters): string => {
  const activeFilters: string[] = [];

  if (filters.category !== 'all') activeFilters.push(`Category: ${filters.category}`);
  if (filters.priority !== 'all') activeFilters.push(`Priority: ${filters.priority}`);
  if (filters.status !== 'all') activeFilters.push(`Status: ${filters.status}`);
  if (filters.searchQuery) activeFilters.push(`Search: "${filters.searchQuery}"`);

  return activeFilters.join(' • ');
};

// Export types
export type { TaskCounts };