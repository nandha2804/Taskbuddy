import React from 'react';
import {
  Box,
  Text,
  HStack,
  VStack,
  Icon,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useColorModeValue,
  Tooltip,
  Avatar,
  AvatarGroup,
} from '@chakra-ui/react';
import { TaskMenu } from './TaskMenu';
import { TaskStatusBadge } from './TaskStatusBadge';
import { Task } from '../../types';
import { format } from 'date-fns';
import { TASK_CATEGORIES, TASK_PRIORITIES } from '../../constants';
import { useTeams } from '../../hooks/useTeams';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
  const { teams } = useTeams();
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const taskTeam = teams.find(team => team.id === task.teamId);
  const assignedUsers = taskTeam?.members.filter(member => 
    task.assignedTo?.includes(member.id)
  ) || [];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  return (
    <Box
      p={4}
      bg={bgColor}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      shadow="sm"
      transition="all 0.2s"
      _hover={{
        transform: 'translateY(-2px)',
        shadow: 'md',
      }}
    >
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between" align="start">
          <VStack align="start" spacing={1} flex={1}>
            <Text fontSize="lg" fontWeight="semibold" noOfLines={2}>
              {task.title}
            </Text>
            {taskTeam && (
              <Badge variant="subtle" colorScheme="gray" fontSize="xs">
                {taskTeam.name}
              </Badge>
            )}
          </VStack>

          <TaskMenu
            task={task}
            onEdit={() => onEdit?.(task)}
            onDelete={() => onDelete?.(task.id)}
          />
        </HStack>

        <Text noOfLines={2} color={useColorModeValue('gray.600', 'gray.300')}>
          {task.description}
        </Text>

        <HStack spacing={2} wrap="wrap">
          <TaskStatusBadge status={task.status} />
          <Badge
            colorScheme={TASK_CATEGORIES[task.category].color}
            variant="subtle"
          >
            {TASK_CATEGORIES[task.category].label}
          </Badge>
          <Badge
            colorScheme={TASK_PRIORITIES[task.priority].color}
            variant="subtle"
          >
            {TASK_PRIORITIES[task.priority].label}
          </Badge>
        </HStack>

        {assignedUsers.length > 0 && (
          <HStack justify="space-between" align="center">
            <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
              Assigned to:
            </Text>
            <AvatarGroup size="sm" max={3}>
              {assignedUsers.map(user => (
                <Tooltip key={user.id} label={user.displayName || user.email}>
                  <Avatar
                    name={user.displayName || undefined}
                    src={user.photoURL || undefined}
                  />
                </Tooltip>
              ))}
            </AvatarGroup>
          </HStack>
        )}

        {task.dueDate && (
          <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
            Due: {formatDate(task.dueDate)}
          </Text>
        )}
      </VStack>
    </Box>
  );
};