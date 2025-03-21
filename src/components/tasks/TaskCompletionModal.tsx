import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Textarea,
  Select,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { Task } from '../../types/models';
import { useAuth } from '../../context/AuthContext';
import { FileUpload } from '../common/FileUpload';
import { config } from '../../config/config';
import { useCustomToast } from '../common/CustomToast';

interface TaskCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onUpdate: (status: Task['status'], completionDetails?: Task['completionDetails']) => Promise<void>;
}

export const TaskCompletionModal: React.FC<TaskCompletionModalProps> = ({
  isOpen,
  onClose,
  task,
  onUpdate,
}) => {
  const [status, setStatus] = useState<Task['status']>(task.status);
  const [completionDescription, setCompletionDescription] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const toast = useCustomToast();
  const bgColor = useColorModeValue('white', 'gray.700');

  useEffect(() => {
    if (task) {
      setStatus(task.status);
      setCompletionDescription(task.completionDetails?.description || '');
      setAttachments(task.completionDetails?.attachments?.map(a => a.url) || []);
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsSubmitting(true);

      const completionDetails = status === 'completed' ? {
        description: completionDescription.trim(),
        attachments: attachments.map((url, index) => ({
          id: `${task.id}-completion-${index}`,
          url,
          name: url.split('/').pop() || 'file',
          type: 'completion-attachment',
          size: 0, // Size is not relevant for completion attachments
          uploadedBy: user.uid,
          uploadedAt: new Date(),
        })),
        completedAt: new Date().toISOString(),
        completedBy: user.uid,
      } : undefined;

      await onUpdate(status, completionDetails);
      toast.success('Task status updated successfully');
      onClose();
    } catch (error) {
      toast.error(
        'Failed to update task status',
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (urls: string[]) => {
    setAttachments(urls);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <form onSubmit={handleSubmit}>
          <ModalHeader>Update Task Status</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Status</FormLabel>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Task['status'])}
                >
                  <option value="todo">To Do</option>
                  <option value="inProgress">In Progress</option>
                  <option value="completed">Completed</option>
                </Select>
              </FormControl>

              {status === 'completed' && (
                <>
                  <FormControl>
                    <FormLabel>Completion Details</FormLabel>
                    <Textarea
                      value={completionDescription}
                      onChange={(e) => setCompletionDescription(e.target.value)}
                      placeholder="Add details about task completion..."
                      resize="vertical"
                      minH="100px"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Attachments</FormLabel>
                    <FileUpload
                      onUploadComplete={handleFileUpload}
                      folder={config.storage.attachments}
                      maxFiles={config.defaults.maxFiles}
                      currentFiles={attachments}
                    />
                  </FormControl>
                </>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              type="submit"
              isLoading={isSubmitting}
              loadingText="Updating..."
            >
              Update Status
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};