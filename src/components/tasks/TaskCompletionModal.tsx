import { useState, useCallback } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Textarea,
  VStack,
  HStack,
  Text,
  useToast,
  Box,
  IconButton,
} from '@chakra-ui/react';
import { FiUpload, FiX, FiCheckCircle } from 'react-icons/fi';
import { useDropzone } from 'react-dropzone';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Task, AttachmentMetadata, TaskCompletionDetails } from '../../types';

interface TaskCompletionModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (taskId: string, data: Partial<Task>) => Promise<void>;
}

export const TaskCompletionModal: React.FC<TaskCompletionModalProps> = ({
  task,
  isOpen,
  onClose,
  onUpdateTask,
}): React.ReactElement => {
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<AttachmentMetadata[]>([]);
  const toast = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      setUploading(true);
      const storage = getStorage();
      const newFiles: AttachmentMetadata[] = [];

      for (const file of acceptedFiles) {
        const storageRef = ref(storage, `task-completions/${task.id}/${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        newFiles.push({
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date(),
          uploadedBy: task.userId,
        });
      }

      setFiles((prev) => [...prev, ...newFiles]);
      toast({
        title: 'Files uploaded successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error uploading files',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setUploading(false);
    }
  }, [task.id, task.userId, toast]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: true,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleComplete = async () => {
    try {
      const completionDetails: TaskCompletionDetails = {
        description,
        completedAt: new Date().toISOString(),
        completedBy: task.userId,
        attachments: files,
      };

      await onUpdateTask(task.id, {
        status: 'completed',
        completionDetails,
      });

      toast({
        title: 'Task marked as completed',
        status: 'success',
        duration: 3000,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error completing task',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Complete Task</ModalHeader>
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Completion Description</FormLabel>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add details about task completion..."
              />
            </FormControl>

            <Box
              {...getRootProps()}
              p={4}
              border="2px dashed"
              borderColor="gray.200"
              borderRadius="md"
              cursor="pointer"
            >
              <input {...getInputProps()} />
              <VStack spacing={2}>
                <FiUpload size={24} />
                <Text>Drop files here or click to upload</Text>
              </VStack>
            </Box>

            {files.length > 0 && (
              <VStack align="stretch" spacing={2}>
                {files.map((file, index) => (
                  <HStack key={index} justify="space-between" p={2} bg="gray.50" rounded="md">
                    <Text>{file.name}</Text>
                    <IconButton
                      aria-label="Remove file"
                      icon={<FiX />}
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFile(index)}
                    />
                  </HStack>
                ))}
              </VStack>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="green"
              onClick={handleComplete}
              isLoading={uploading}
              leftIcon={<FiCheckCircle />}
            >
              Complete Task
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};