import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
  Box,
  useColorModeValue,
} from '@chakra-ui/react';
import { useToast, UseToastOptions, ToastId } from '@chakra-ui/react';
import { config } from '../../config/config';

interface CustomToastProps {
  title: string;
  description?: string;
  status: 'info' | 'warning' | 'success' | 'error';
}

const ToastComponent = ({ title, description, status, onClose }: CustomToastProps & { onClose: () => void }) => {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Alert
      status={status}
      variant="solid"
      borderRadius="md"
      bg={bg}
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="sm"
      display="flex"
      alignItems="flex-start"
      pr={8}
    >
      <AlertIcon />
      <Box flex="1">
        <AlertTitle>{title}</AlertTitle>
        {description && (
          <AlertDescription display="block">
            {description}
          </AlertDescription>
        )}
      </Box>
      <CloseButton
        onClick={onClose}
        position="absolute"
        right={1}
        top={1}
      />
    </Alert>
  );
};

export const useCustomToast = () => {
  const toast = useToast();

  const showToast = ({
    title,
    description,
    status = 'info',
    duration,
    ...rest
  }: CustomToastProps & Partial<UseToastOptions>): ToastId => {
    let defaultDuration: number;

    switch (status) {
      case 'error':
        defaultDuration = config.toast.errorDuration;
        break;
      case 'success':
        defaultDuration = config.toast.successDuration;
        break;
      default:
        defaultDuration = config.toast.defaultDuration;
    }

    return toast({
      position: 'top-right',
      duration: duration || defaultDuration,
      isClosable: true,
      render: ({ onClose }) => (
        <ToastComponent
          title={title}
          description={description}
          status={status}
          onClose={onClose}
        />
      ),
      ...rest,
    });
  };

  const success = (title: string, description?: string): ToastId =>
    showToast({ title, description, status: 'success' });

  const error = (title: string, description?: string): ToastId =>
    showToast({ title, description, status: 'error' });

  const warning = (title: string, description?: string): ToastId =>
    showToast({ title, description, status: 'warning' });

  const info = (title: string, description?: string): ToastId =>
    showToast({ title, description, status: 'info' });

  return {
    showToast,
    success,
    error,
    warning,
    info,
  };
};

// Pre-configured toast hooks for specific use cases
export const useTaskToast = () => {
  const { success, error } = useCustomToast();

  return {
    createSuccess: () => success('Task created successfully'),
    updateSuccess: () => success('Task updated successfully'),
    deleteSuccess: () => success('Task deleted successfully'),
    createError: (description?: string) => error('Failed to create task', description),
    updateError: (description?: string) => error('Failed to update task', description),
    deleteError: (description?: string) => error('Failed to delete task', description),
  };
};

export const useUploadToast = () => {
  const { success, error, warning } = useCustomToast();

  return {
    uploadSuccess: () => success('File uploaded successfully'),
    uploadError: (description?: string) => error('Failed to upload file', description),
    deleteSuccess: () => success('File deleted successfully'),
    deleteError: (description?: string) => error('Failed to delete file', description),
    sizeError: () => warning('File size too large', `Maximum file size is ${config.defaults.maxAttachmentSize / 1024 / 1024}MB`),
    typeError: () => warning('Invalid file type', 'Please select a supported file type'),
    maxFilesError: (maxFiles: number) => warning('Maximum files limit', `You can upload up to ${maxFiles} files`),
    warning: (title: string, description?: string) => warning(title, description),
  };
};