import React from 'react';
import { Badge } from '@chakra-ui/react';
import { TaskStatus } from '../../types';

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

export const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({ status }) => {
  const getStatusConfig = (status: TaskStatus) => {
    switch (status) {
      case 'active':
        return {
          colorScheme: 'blue',
          label: 'To Do'
        };
      case 'inProgress':
        return {
          colorScheme: 'orange',
          label: 'In Progress'
        };
      case 'completed':
        return {
          colorScheme: 'green',
          label: 'Completed'
        };
      case 'deleted':
        return {
          colorScheme: 'red',
          label: 'Deleted'
        };
      default:
        return {
          colorScheme: 'gray',
          label: status
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge
      colorScheme={config.colorScheme}
      variant="subtle"
      px={2}
      py={0.5}
      borderRadius="full"
    >
      {config.label}
    </Badge>
  );
};