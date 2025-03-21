import React, { Component, ErrorInfo } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  Code,
  useColorModeValue,
} from '@chakra-ui/react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface ErrorContentProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

const ErrorContent = ({ error, errorInfo }: ErrorContentProps) => {
  const bgColor = useColorModeValue('gray.100', 'gray.700');
  
  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={6} align="stretch">
        <Heading size="xl" color="red.500">
          Oops! Something went wrong
        </Heading>
        
        <Box as="p" fontSize="lg">
          We're sorry for the inconvenience. Please try refreshing the page or contact support if the problem persists.
        </Box>

        {process.env.NODE_ENV === 'development' && (
          <>
            <Box
              bg={bgColor}
              p={4}
              borderRadius="md"
              maxH="200px"
              overflowY="auto"
            >
              <Box as="p" fontWeight="bold" mb={2}>
                Error Details:
              </Box>
              <Code colorScheme="red" display="block" whiteSpace="pre-wrap">
                {error?.toString()}
              </Code>
            </Box>

            {errorInfo && (
              <Box
                bg={bgColor}
                p={4}
                borderRadius="md"
                maxH="300px"
                overflowY="auto"
              >
                <Box as="p" fontWeight="bold" mb={2}>
                  Stack Trace:
                </Box>
                <Code colorScheme="red" display="block" whiteSpace="pre-wrap">
                  {errorInfo.componentStack}
                </Code>
              </Box>
            )}
          </>
        )}

        <Button
          colorScheme="blue"
          onClick={() => window.location.reload()}
          size="lg"
        >
          Refresh Page
        </Button>

        <Button
          variant="outline"
          onClick={() => window.location.href = '/'}
          size="lg"
        >
          Return to Home
        </Button>
      </VStack>
    </Container>
  );
};

class ErrorBoundaryInner extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });
    
    // Log error to your error reporting service
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return <ErrorContent error={this.state.error} errorInfo={this.state.errorInfo} />;
    }

    return this.props.children;
  }
}

export const ErrorBoundary: React.FC<Props> = ({ children }) => {
  return (
    <ErrorBoundaryInner>
      {children}
    </ErrorBoundaryInner>
  );
};