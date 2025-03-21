import React from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../hooks/useTasks';
import { TaskBoard } from './TaskBoard';
import { LoadingState } from '../common/LoadingState';

export const TaskBoardPage: React.FC = (): React.ReactElement => {
  const { user } = useAuth();
  const {
    tasks = [], // Provide default empty array
    loading,
    error,
    updateTask
  } = useTasks({
    userId: user?.uid,
    enabled: !!user // Only fetch when user is authenticated
  });

  const handleUpdateTask = async (taskId: string, data: Partial<Task>) => {
    if (!user) return;
    await updateTask({ id: taskId, data });
  };

  const bgColor = useColorModeValue('gray.50', 'gray.900');

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <Box p={8} textAlign="center" color="red.500">
        Error loading tasks: {error.message}
      </Box>
    );
  }

  return (
    <Box
      p={4}
      minH="calc(100vh - 64px)"
      bg={bgColor}
    >
      <TaskBoard
        tasks={tasks || []}
        onUpdateTask={handleUpdateTask}
      />
    </Box>
  );
};