import React from 'react';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Container,
  VStack,
} from '@chakra-ui/react';
import { LoadingState } from './LoadingState';

interface WithLoadingAndErrorProps {
  loading?: boolean;
  error?: Error | null;
  loadingMessage?: string;
  minHeight?: string;
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function withLoadingAndError<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithLoadingAndError({
    loading = false,
    error = null,
    loadingMessage = 'Loading...',
    minHeight = '200px',
    containerSize = 'xl',
    ...props
  }: P & WithLoadingAndErrorProps) {
    if (loading) {
      return (
        <Container maxW={containerSize}>
          <LoadingState message={loadingMessage} minHeight={minHeight} />
        </Container>
      );
    }

    if (error) {
      return (
        <Container maxW={containerSize}>
          <VStack spacing={4} align="stretch" minH={minHeight} justify="center">
            <Alert
              status="error"
              variant="subtle"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              borderRadius="lg"
              py={6}
            >
              <AlertIcon boxSize="40px" mr={0} />
              <AlertTitle mt={4} mb={1} fontSize="lg">
                Something went wrong
              </AlertTitle>
              <AlertDescription maxWidth="sm">
                {error.message || 'An unexpected error occurred. Please try again.'}
              </AlertDescription>
            </Alert>
          </VStack>
        </Container>
      );
    }

    return <WrappedComponent {...(props as P)} />;
  };
}

// Example usage with default props
interface ExampleProps {
  title: string;
}

export const ExampleComponent: React.FC<ExampleProps> = ({ title }) => (
  <Box>{title}</Box>
);

export const ExampleWithLoadingAndError = withLoadingAndError(ExampleComponent);

// Usage:
// <ExampleWithLoadingAndError
//   loading={isLoading}
//   error={error}
//   loadingMessage="Loading data..."
//   title="Example"
// />

// HOC Type helper
export type WithLoadingAndErrorType<P> = P & WithLoadingAndErrorProps;

// Custom hook to handle loading and error states
export const useLoadingAndError = (
  loading: boolean,
  error: Error | null,
  loadingMessage?: string
) => ({
  loading,
  error,
  loadingMessage,
});

// Wrapper component for common use cases
interface LoadingAndErrorWrapperProps extends WithLoadingAndErrorProps {
  children: React.ReactNode;
}

export const LoadingAndErrorWrapper: React.FC<LoadingAndErrorWrapperProps> = ({
  children,
  loading = false,
  error = null,
  loadingMessage = 'Loading...',
  minHeight = '200px',
  containerSize = 'xl',
}) => {
  if (loading) {
    return (
      <Container maxW={containerSize}>
        <LoadingState message={loadingMessage} minHeight={minHeight} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW={containerSize}>
        <VStack spacing={4} align="stretch" minH={minHeight} justify="center">
          <Alert
            status="error"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            borderRadius="lg"
            py={6}
          >
            <AlertIcon boxSize="40px" mr={0} />
            <AlertTitle mt={4} mb={1} fontSize="lg">
              Something went wrong
            </AlertTitle>
            <AlertDescription maxWidth="sm">
              {error.message || 'An unexpected error occurred. Please try again.'}
            </AlertDescription>
          </Alert>
        </VStack>
      </Container>
    );
  }

  return <>{children}</>;
};