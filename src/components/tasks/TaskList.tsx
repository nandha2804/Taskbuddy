import React, { useState } from 'react';
import { Task } from '../../types/models';
import {
  Box,
  Button,
  Grid,
  HStack,
  Text,
  VStack,
  useDisclosure,
  Heading,
  Stack,
  Select,
  useColorModeValue,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { TaskCard } from './TaskCard';
import { useTasks } from '../../hooks/useTasks';
import { useAuth } from '../../context/AuthContext';
import { AddTaskModal } from './AddTaskModal';
import { LoadingState } from '../common/LoadingState';
import { EmptyState } from '../common/EmptyState';

type FilterOption = 'all' | 'work' | 'personal' | 'name' | 'date';

export const TaskList = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<FilterOption>('all');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { tasks, loading, error, deleteTask, updateTask } = useTasks({
    userId: user?.uid,
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const bgColor = useColorModeValue('white', 'gray.800');

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <EmptyState title="Error" message={error.message} />;
  }

  const filteredAndSortedTasks = (tasks || [])
    .filter(task => {
      if (filter === 'work') return task.category === 'work';
      if (filter === 'personal') return task.category === 'personal';
      return true;
    })
    .sort((a, b) => {
      if (filter === 'name') {
        return a.title.localeCompare(b.title);
      } 
      if (filter === 'date') {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      }
      return 0;
    });

  return (
    <Box>
      <Stack
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        align={{ base: 'flex-start', md: 'center' }}
        mb={6}
        spacing={4}
      >
        <Heading size="lg">Tasks</Heading>
        <HStack spacing={4} w={{ base: 'full', md: 'auto' }}>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterOption)}
            w={{ base: 'full', md: '200px' }}
          >
            <option value="all">All Tasks</option>
            <option value="work">Work Tasks</option>
            <option value="personal">Personal Tasks</option>
            <option value="name">Sort by Name (A-Z)</option>
            <option value="date">Sort by Date</option>
          </Select>

          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={onOpen}
            w={{ base: 'full', md: 'auto' }}
          >
            Add Task
          </Button>
        </HStack>
      </Stack>

      {filteredAndSortedTasks.length === 0 ? (
        <EmptyState
          title="No tasks found"
          message="Start by creating your first task"
        />
      ) : (
        <Grid
          templateColumns={{
            base: '1fr',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
          }}
          gap={6}
        >
          {filteredAndSortedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={(task) => {
                setEditingTask(task);
                onOpen();
              }}
              onDelete={async (taskId) => {
                try {
                  await deleteTask(taskId);
                } catch (error) {
                  console.error('Failed to delete task:', error);
                }
              }}
            />
          ))}
        </Grid>
      )}

      <AddTaskModal 
        isOpen={isOpen} 
        onClose={() => {
          onClose();
          setEditingTask(null);
        }}
        editTask={editingTask}
        onEditComplete={() => setEditingTask(null)}
      />
    </Box>
  );
};