import React from 'react';
import { Badge } from '@chakra-ui/react';
import { TaskStatus } from '../../types';

interface TaskStatusBadgeProps {
  status: TaskStatus;
  isSelected?: boolean;
  onClick?: () => void;
}

export const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({
  status,
  isSelected = false,
  onClick
}) => {
  const getStatusConfig = (status: TaskStatus) => {
    switch (status) {
      case 'active':
        return {
          color: 'blue.500',
          bgColor: 'blue.50',
          label: 'To Do'
        };
      case 'inProgress':
        return {
          color: 'orange.500',
          bgColor: 'orange.50',
          label: 'In Progress'
        };
      case 'completed':
        return {
          color: 'green.500',
          bgColor: 'green.50',
          label: 'Completed'
        };
      case 'deleted':
        return {
          color: 'red.500',
          bgColor: 'red.50',
          label: 'Deleted'
        };
      default:
        return {
          color: 'gray.500',
          bgColor: 'gray.50',
          label: status
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge
      bg={isSelected ? config.color : config.bgColor}
      color={isSelected ? 'white' : config.color}
      px={3}
      py={1}
      borderRadius="md"
      cursor={onClick ? 'pointer' : 'default'}
      onClick={onClick}
      _hover={
        onClick
          ? {
              bg: config.color,
              color: 'white',
            }
          : undefined
      }
    >
      {config.label}
    </Badge>
  );
};