import React from 'react';
import {
  Box,
  Center,
  Spinner,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  size = 'xl',
}) => {
  const textColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Center minH="60vh">
      <VStack spacing={4}>
        <Spinner
          size={size}
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
        />
        <Text color={textColor} fontSize="lg">
          {message}
        </Text>
      </VStack>
    </Center>
  );
};