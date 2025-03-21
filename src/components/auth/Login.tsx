import { useState, useEffect } from 'react';
import { Box, Button, Heading, Icon, useToast } from '@chakra-ui/react';
import { FaGoogle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Login = () => {
  const { signInWithGoogle, loading, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/overview');
    }
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      toast({
        title: 'Welcome back!',
        description: 'Successfully signed in to Task Manager',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/overview');
    } catch (error) {
      let errorMessage = 'Unable to sign in. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('not ready')) {
          errorMessage = 'Authentication system is initializing. Please try again in a moment.';
        } else if (error.message.includes('cancelled')) {
          errorMessage = 'Sign in was cancelled.';
        } else {
          errorMessage = error.message;
        }
      }
      toast({
        title: 'Sign in failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
      p={4}
    >
      <Box
        bg="white"
        p={8}
        borderRadius="xl"
        boxShadow="xl"
        maxW="400px"
        w="full"
        textAlign="center"
      >
        <Heading
          mb={8}
          size="lg"
          color="gray.700"
        >
          TaskBuddy
        </Heading>
        <Button
          onClick={handleGoogleSignIn}
          isLoading={loading}
          loadingText="Signing in..."
          leftIcon={<Icon as={FaGoogle} boxSize={5} />}
          size="lg"
          colorScheme="brand"
          w="full"
          h="50px"
          borderRadius="lg"
          boxShadow="md"
          _hover={{
            boxShadow: 'lg',
            transform: 'translateY(-2px)'
          }}
        >
          Sign in with Google
        </Button>
      </Box>
    </Box>
  );
};