import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';
import { Task } from '../types';

export const formatDueDate = (date: string | null): string => {
  if (!date) return '';
  const parsedDate = parseISO(date);
  
  if (isToday(parsedDate)) {
    return 'Today';
  }
  if (isTomorrow(parsedDate)) {
    return 'Tomorrow';
  }
  return format(parsedDate, 'MMM d, yyyy');
};

export const getDueDateStatus = (date: string | null): 'overdue' | 'upcoming' | 'none' => {
  if (!date) return 'none';
  const parsedDate = parseISO(date);
  
  if (isPast(parsedDate) && !isToday(parsedDate)) {
    return 'overdue';
  }
  return 'upcoming';
};

type SortOption = 'dueDate' | 'priority' | 'createdAt' | 'title';

export const sortTasks = (tasks: Task[], sortBy: SortOption, ascending = true): Task[] => {
  const sortedTasks = [...tasks];

  const priorityValues = {
    high: 3,
    medium: 2,
    low: 1,
  };

  const compareValues = (a: any, b: any): number => {
    if (a === null || a === undefined) return ascending ? 1 : -1;
    if (b === null || b === undefined) return ascending ? -1 : 1;
    if (a < b) return ascending ? -1 : 1;
    if (a > b) return ascending ? 1 : -1;
    return 0;
  };

  sortedTasks.sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        return compareValues(a.dueDate, b.dueDate);
      case 'priority':
        return compareValues(
          priorityValues[a.priority as keyof typeof priorityValues],
          priorityValues[b.priority as keyof typeof priorityValues]
        );
      case 'createdAt':
        return compareValues(a.createdAt, b.createdAt);
      case 'title':
        return compareValues(a.title.toLowerCase(), b.title.toLowerCase());
      default:
        return 0;
    }
  });

  return sortedTasks;
};

export const filterTasks = (
  tasks: Task[],
  {
    searchQuery = '',
    category = 'all',
    priority = 'all',
    status = 'all',
  }: {
    searchQuery?: string;
    category?: string;
    priority?: string;
    status?: 'all' | 'completed' | 'incomplete';
  }
): Task[] => {
  return tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = category === 'all' || task.category === category;
    const matchesPriority = priority === 'all' || task.priority === priority;
    const matchesStatus =
      status === 'all' ||
      (status === 'completed' && task.completed) ||
      (status === 'incomplete' && !task.completed);

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });
};

export const groupTasksByCategory = (tasks: Task[]): Record<string, Task[]> => {
  return tasks.reduce((grouped, task) => {
    const category = task.category;
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(task);
    return grouped;
  }, {} as Record<string, Task[]>);
};