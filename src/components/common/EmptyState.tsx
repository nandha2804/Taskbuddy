import React from 'react';
import {
  Box,
  VStack,
  Text,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiInbox } from 'react-icons/fi';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: React.ElementType;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon = FiInbox,
}) => {
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <Box
      p={8}
      bg={bgColor}
      borderRadius="xl"
      textAlign="center"
      width="100%"
    >
      <VStack spacing={4}>
        <Icon
          as={icon}
          boxSize={12}
          color={textColor}
        />
        <Text
          fontSize="xl"
          fontWeight="bold"
          color={textColor}
        >
          {title}
        </Text>
        <Text
          color={textColor}
          fontSize="md"
        >
          {message}
        </Text>
      </VStack>
    </Box>
  );
};