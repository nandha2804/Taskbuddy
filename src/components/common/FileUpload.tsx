import React, { useRef, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Icon,
  IconButton,
  Progress,
  Text,
  VStack,
  Tooltip,
} from '@chakra-ui/react';
import { FiUpload, FiX, FiFile, FiPaperclip } from 'react-icons/fi';
import { useStorage } from '../../hooks/useStorage';
import { config } from '../../config/config';
import { useUploadToast } from './CustomToast';

interface FileUploadProps {
  onUploadComplete: (urls: string[]) => void;
  folder: string;
  maxFiles?: number;
  accept?: string;
  currentFiles?: string[];
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  folder,
  maxFiles = config.defaults.maxFiles,
  accept = config.defaults.acceptedFileTypes.all.join(','),
  currentFiles = [],
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<string[]>(currentFiles);
  const { uploadFile, deleteFile, progress, isUploading } = useStorage();
  const toast = useUploadToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    if (files.length + selectedFiles.length > maxFiles) {
      toast.maxFilesError(maxFiles);
      return;
    }

    for (const file of selectedFiles) {
      if (file.size > config.defaults.maxAttachmentSize) {
        toast.sizeError();
        return;
      }

      if (!config.defaults.acceptedFileTypes.all.includes(file.type)) {
        toast.typeError();
        return;
      }
    }

    try {
      const uploadPromises = selectedFiles.map(async (file) => {
        try {
          const url = await uploadFile(file, folder);
          toast.uploadSuccess();
          return url;
        } catch (error) {
          toast.uploadError(error instanceof Error ? error.message : undefined);
          return null;
        }
      });

      const uploadedUrls = (await Promise.all(uploadPromises)).filter((url): url is string => url !== null);
      const newFiles = [...files, ...uploadedUrls];
      setFiles(newFiles);
      onUploadComplete(newFiles);
    } catch (error) {
      toast.uploadError(error instanceof Error ? error.message : undefined);
    }
  };

  const handleDelete = async (url: string) => {
    try {
      await deleteFile(url);
      const newFiles = files.filter((fileUrl) => fileUrl !== url);
      setFiles(newFiles);
      onUploadComplete(newFiles);
      toast.deleteSuccess();
    } catch (error) {
      toast.deleteError(error instanceof Error ? error.message : undefined);
    }
  };

  const getFileNameFromUrl = (url: string): string => {
    try {
      const decodedUrl = decodeURIComponent(url);
      return decodedUrl.split('/').pop()?.split('?')[0] || 'file';
    } catch {
      return 'file';
    }
  };

  return (
    <Box>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        multiple={files.length < maxFiles}
        style={{ display: 'none' }}
      />

      <VStack spacing={4} align="stretch">
        {files.map((url) => (
          <Flex
            key={url}
            p={2}
            borderWidth={1}
            borderRadius="md"
            align="center"
            justify="space-between"
            bg="white"
            borderColor="gray.200"
            shadow="sm"
            _hover={{
              borderColor: 'brand.200',
              shadow: 'md'
            }}
          >
            <Flex align="center">
              <Icon as={FiFile} mr={2} />
              <Tooltip label={getFileNameFromUrl(url)}>
                <Text noOfLines={1} maxW="200px">
                  {getFileNameFromUrl(url)}
                </Text>
              </Tooltip>
            </Flex>
            <IconButton
              aria-label="Remove file"
              icon={<FiX />}
              size="sm"
              variant="ghost"
              onClick={() => handleDelete(url)}
              isDisabled={isUploading}
            />
          </Flex>
        ))}

        {isUploading && (
          <Progress
            value={progress}
            size="sm"
            colorScheme="blue"
            borderRadius="full"
            hasStripe
            isAnimated
          />
        )}

        {files.length < maxFiles && (
          <Button
            leftIcon={<FiPaperclip />}
            onClick={() => fileInputRef.current?.click()}
            isDisabled={isUploading}
            variant="outline"
            w="full"
          >
            Attach File
          </Button>
        )}

        <Text fontSize="sm" color="gray.500">
          {`${files.length}/${maxFiles} files attached • Max size: ${
            config.defaults.maxAttachmentSize / 1024 / 1024
          }MB each`}
        </Text>
      </VStack>
    </Box>
  );
};