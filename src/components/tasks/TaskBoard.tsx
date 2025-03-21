import React from 'react';
import {
  Box,
  Grid,
  Heading,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { Task } from '../../types';
import { taskStatusColumns } from '../../constants/taskStatus';
import { BoardTask } from './BoardTask';
import { EmptyState } from '../common/EmptyState';

interface TaskBoardProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, data: Partial<Task>) => Promise<void>;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, onUpdateTask }) => {
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const columnBgColor = useColorModeValue('gray.100', 'gray.700');

  const getTasksByStatus = (status: string) => {
    if (!tasks) return [];
    
    // Map board status to task status
    const statusMap: Record<string, Task['status']> = {
      'todo': 'active',
      'inProgress': 'inProgress',
      'completed': 'completed'
    };

    return tasks.filter(task => task.status === statusMap[status] || task.status === status);
  };

  return (
    <Grid
      templateColumns={`repeat(${taskStatusColumns.length}, 1fr)`}
      gap={4}
      p={4}
      bg={bgColor}
      borderRadius="lg"
      minH="calc(100vh - 200px)"
    >
      {taskStatusColumns.map(status => (
        <Box
          key={status.id}
          bg={columnBgColor}
          p={4}
          borderRadius="md"
          minH="full"
        >
          <VStack spacing={4} align="stretch">
            <Heading
              size="sm"
              color={status.color}
              display="flex"
              alignItems="center"
              gap={2}
            >
              <status.icon />
              {status.title}
            </Heading>

            {getTasksByStatus(status.id).length === 0 ? (
              <EmptyState
                title={status.title}
                message={`No tasks in ${status.title.toLowerCase()}`}
                height="100px"
              />
            ) : (
              getTasksByStatus(status.id).map(task => (
                <BoardTask
                  key={task.id}
                  task={task}
                  onUpdateTask={onUpdateTask}
                />
              ))
            )}
          </VStack>
        </Box>
      ))}
    </Grid>
  );
};