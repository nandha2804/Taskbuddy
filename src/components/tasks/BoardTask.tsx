import React from 'react';
import {
  Box,
  HStack,
  VStack,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useDisclosure,
  Icon,
  Badge,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
} from '@chakra-ui/react';
import { FiMoreHorizontal, FiPaperclip, FiAlignLeft, FiAlertCircle } from 'react-icons/fi';
import { Task } from '../../types';
import { taskStatusColumns } from '../../constants/taskStatus';
import { TaskCompletionModal } from './TaskCompletionModal';

interface BoardTaskProps {
  task: Task;
  onUpdateTask: (taskId: string, data: Partial<Task>) => Promise<void>;
}

export const BoardTask: React.FC<BoardTaskProps> = ({ task, onUpdateTask }) => {
  const { 
    isOpen: isCompletionModalOpen, 
    onOpen: openCompletionModal, 
    onClose: closeCompletionModal 
  } = useDisclosure();
  
  const {
    isOpen: isConfirmOpen,
    onOpen: openConfirm,
    onClose: closeConfirm
  } = useDisclosure();

  const [pendingStatus, setPendingStatus] = React.useState<Task['status'] | null>(null);
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const handleStatusChange = async (newStatus: Task['status']) => {
    try {
      if (newStatus === 'completed') {
        openCompletionModal();
      } else if (task.status === 'completed') {
        setPendingStatus(newStatus);
        openConfirm();
      } else {
        await onUpdateTask(task.id, { status: newStatus });
      }
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleConfirmStatusChange = async () => {
    if (!pendingStatus) return;
    
    try {
      await onUpdateTask(task.id, {
        status: pendingStatus,
        completionDetails: null // Use null instead of undefined for Firestore
      });
      closeConfirm();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  return (
    <>
      <Box
        p={4}
        bg="white"
        borderRadius="md"
        boxShadow="sm"
        borderWidth="1px"
        _hover={{ boxShadow: 'md' }}
        cursor="grab"
        _active={{ cursor: 'grabbing' }}
      >
        <VStack align="stretch" spacing={3}>
          <HStack justify="space-between" align="start">
            <Text fontWeight="medium">{task.title}</Text>
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<FiMoreHorizontal />}
                variant="ghost"
                size="sm"
                aria-label="Task options"
              />
              <MenuList>
                {taskStatusColumns.map((status) => (
                  <MenuItem
                    key={status.id}
                    icon={<status.icon />}
                    onClick={() => handleStatusChange(status.id as Task['status'])}
                    color={status.color}
                    bg={task.status === status.id ? status.bgColor : undefined}
                  >
                    Move to {status.title}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          </HStack>

          <Text fontSize="sm" color="gray.600" noOfLines={2}>
            {task.description}
          </Text>

          {task.completionDetails && (
            <VStack align="stretch" spacing={2}>
              <Badge colorScheme="green" alignSelf="flex-start">
                Completed
              </Badge>
              {task.completionDetails.description && (
                <HStack fontSize="sm" color="gray.600">
                  <Icon as={FiAlignLeft} />
                  <Text noOfLines={1}>{task.completionDetails.description}</Text>
                </HStack>
              )}
              {task.completionDetails.attachments?.length > 0 && (
                <HStack fontSize="sm" color="gray.600">
                  <Icon as={FiPaperclip} />
                  <Text>{task.completionDetails.attachments.length} attachments</Text>
                </HStack>
              )}
            </VStack>
          )}
        </VStack>
      </Box>

      <TaskCompletionModal
        task={task}
        isOpen={isCompletionModalOpen}
        onClose={closeCompletionModal}
        onUpdateTask={onUpdateTask}
      />

      <AlertDialog
        isOpen={isConfirmOpen}
        leastDestructiveRef={cancelRef}
        onClose={closeConfirm}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Change Task Status
            </AlertDialogHeader>

            <AlertDialogBody>
              <VStack align="stretch" spacing={3}>
                <HStack>
                  <Icon as={FiAlertCircle} color="orange.500" />
                  <Text>This task is currently marked as completed.</Text>
                </HStack>
                <Text>
                  Moving it back to {pendingStatus === 'active' ? 'To Do' : 'In Progress'} will remove the completion details and attachments. 
                  Are you sure you want to continue?
                </Text>
              </VStack>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={closeConfirm}>
                Cancel
              </Button>
              <Button colorScheme="orange" onClick={handleConfirmStatusChange} ml={3}>
                Yes, Change Status
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};