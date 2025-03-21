import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  useDisclosure,
  Divider,
} from '@chakra-ui/react';
import { FiCheckCircle } from 'react-icons/fi';
import { Task } from '../../types';
import { taskStatusColumns } from '../../constants/taskStatus';
import { TaskStatusBadge } from './TaskStatusBadge';
import { TaskCompletionModal } from './TaskCompletionModal';

interface TaskDetailPageProps {
  task: Task;
  onUpdateTask: (taskId: string, data: Partial<Task>) => Promise<void>;
}

export const TaskDetailPage: React.FC<TaskDetailPageProps> = ({
  task,
  onUpdateTask,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleStatusChange = async (newStatus: Task['status']) => {
    if (newStatus === 'completed') {
      onOpen();
    } else {
      try {
        await onUpdateTask(task.id, { status: newStatus });
      } catch (error) {
        console.error('Failed to update task status:', error);
      }
    }
  };

  return (
    <Box p={6}>
      <VStack align="stretch" spacing={6}>
        {/* Task Status Section */}
        <Box>
          <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={3}>
            Status
          </Text>
          <HStack spacing={4}>
            {taskStatusColumns.map((statusConfig) => (
              <TaskStatusBadge
                key={statusConfig.id}
                status={statusConfig.id as Task['status']}
                isSelected={task.status === statusConfig.id}
                onClick={() => handleStatusChange(statusConfig.id as Task['status'])}
              />
            ))}
          </HStack>
        </Box>

        <Divider />

        {/* Task Details Section */}
        <VStack align="stretch" spacing={4}>
          <Text fontSize="2xl" fontWeight="bold">
            {task.title}
          </Text>
          <Text color="gray.600">
            {task.description}
          </Text>
        </VStack>

        {/* Completion Details Section */}
        {task.completionDetails && (
          <>
            <Divider />
            <Box>
              <HStack spacing={2} mb={3}>
                <FiCheckCircle color="green.500" />
                <Text fontSize="sm" fontWeight="medium">
                  Completion Details
                </Text>
              </HStack>
              <Text color="gray.600">
                {task.completionDetails.description}
              </Text>
              {task.completionDetails.attachments.length > 0 && (
                <VStack align="stretch" mt={4}>
                  <Text fontSize="sm" fontWeight="medium">
                    Attachments:
                  </Text>
                  {task.completionDetails.attachments.map((attachment, index) => (
                    <HStack key={index} p={2} bg="gray.50" rounded="md">
                      <Text fontSize="sm">{attachment.name}</Text>
                      <Text fontSize="xs" color="gray.500">
                        ({Math.round(attachment.size / 1024)} KB)
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              )}
            </Box>
          </>
        )}

        {/* Action Buttons */}
        {task.status !== 'completed' && (
          <Button
            colorScheme="green"
            leftIcon={<FiCheckCircle />}
            onClick={() => handleStatusChange('completed')}
          >
            Mark as Completed
          </Button>
        )}
      </VStack>

      <TaskCompletionModal
        task={task}
        isOpen={isOpen}
        onClose={onClose}
        onUpdateTask={onUpdateTask}
      />
    </Box>
  );
};