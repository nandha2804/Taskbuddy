import {
  Box,
  Flex,
  Button,
  Text,
  Avatar,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  HStack,
  VStack,
  Divider,
  Image,
  Tooltip,
  useBreakpointValue,
  Input,
  Icon,
} from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  FiMenu,
  FiHome,
  FiCalendar,
  FiClipboard,
  FiUsers,
  FiSettings,
  FiSearch,
  FiBell
} from 'react-icons/fi';

export const Layout = () => {
  const { user, signOut } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const NavContent = () => (
    <VStack align="stretch" spacing={1} w="full">
      <Text color="gray.500" fontSize="sm" fontWeight="medium" px={4} py={2}>
        MENU
      </Text>
      <Button
        leftIcon={<FiHome />}
        variant="ghost"
        justifyContent="flex-start"
        onClick={() => navigate('/')}
        w="full"
        h="44px"
        borderRadius="xl"
        bg={isActive('/') ? 'brand.50' : undefined}
        color={isActive('/') ? 'brand.600' : 'gray.600'}
        _hover={{
          bg: isActive('/') ? 'brand.100' : 'gray.50',
        }}
        fontSize="sm"
        fontWeight="medium"
      >
        Overview
      </Button>
      <Button
        leftIcon={<FiCalendar />}
        variant="ghost"
        justifyContent="flex-start"
        onClick={() => navigate('/tasks')}
        w="full"
        h="44px"
        borderRadius="xl"
        bg={isActive('/tasks') ? 'brand.50' : undefined}
        color={isActive('/tasks') ? 'brand.600' : 'gray.600'}
        _hover={{
          bg: isActive('/tasks') ? 'brand.100' : 'gray.50',
        }}
        fontSize="sm"
        fontWeight="medium"
      >
        Tasks
      </Button>
      <Button
        leftIcon={<FiClipboard />}
        variant="ghost"
        justifyContent="flex-start"
        onClick={() => navigate('/board')}
        w="full"
        h="44px"
        borderRadius="xl"
        bg={isActive('/board') ? 'brand.50' : undefined}
        color={isActive('/board') ? 'brand.600' : 'gray.600'}
        _hover={{
          bg: isActive('/board') ? 'brand.100' : 'gray.50',
        }}
        fontSize="sm"
        fontWeight="medium"
      >
        Board
      </Button>

      <Divider my={4} />

      <Text color="gray.500" fontSize="sm" fontWeight="medium" px={4} py={2}>
        WORKSPACE
      </Text>
      <Button
        leftIcon={<FiUsers />}
        variant="ghost"
        justifyContent="flex-start"
        onClick={() => navigate('/team')}
        w="full"
        h="44px"
        borderRadius="xl"
        bg={isActive('/team') ? 'brand.50' : undefined}
        color={isActive('/team') ? 'brand.600' : 'gray.600'}
        _hover={{
          bg: isActive('/team') ? 'brand.100' : 'gray.50',
        }}
        fontSize="sm"
        fontWeight="medium"
      >
        Team
      </Button>
      <Button
        leftIcon={<FiSettings />}
        variant="ghost"
        justifyContent="flex-start"
        onClick={() => navigate('/settings')}
        w="full"
        h="44px"
        borderRadius="xl"
        bg={isActive('/settings') ? 'brand.50' : undefined}
        color={isActive('/settings') ? 'brand.600' : 'gray.600'}
        _hover={{
          bg: isActive('/settings') ? 'brand.100' : 'gray.50',
        }}
        fontSize="sm"
        fontWeight="medium"
      >
        Settings
      </Button>
    </VStack>
  );

  return (
    <Flex minH="100vh">
      {/* Sidebar */}
      {!isMobile && (
        <Box
          w="280px"
          bg="white"
          boxShadow="sm"
          py={8}
          px={4}
          position="sticky"
          top={0}
          h="100vh"
          overflowY="auto"
          css={{
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'var(--chakra-colors-gray-50)',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'var(--chakra-colors-gray-300)',
              borderRadius: '4px',
            },
          }}
        >
          <VStack spacing={8} align="stretch" h="full">
            <HStack spacing={3} px={4}>
              <Box
                w="32px"
                h="32px"
                bg="brand.500"
                borderRadius="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize="lg" fontWeight="bold" color="white">T</Text>
              </Box>
              <Text fontSize="xl" fontWeight="bold" color="gray.900">
                TaskBuddy
              </Text>
            </HStack>

            <NavContent />
          </VStack>
        </Box>
      )}

      {/* Main Content */}
      <Box flex={1} bg="gray.50">
        {/* Header */}
        <Flex
          w="full"
          h="72px"
          px={8}
          bg="white"
          boxShadow="sm"
          position="sticky"
          top={0}
          zIndex={10}
          backdropFilter="blur(8px)"
          align="center"
          justify="space-between"
        >
          <HStack spacing={4}>
            {isMobile && (
              <IconButton
                aria-label="Menu"
                icon={<FiMenu />}
                variant="ghost"
                onClick={onOpen}
                borderRadius="xl"
                h="44px"
                w="44px"
                fontSize="xl"
                color="gray.600"
                _hover={{ bg: 'gray.50' }}
              />
            )}
            <Box position="relative" maxW="400px">
              <IconButton
                aria-label="Search"
                icon={<FiSearch />}
                position="absolute"
                left={3}
                top="50%"
                transform="translateY(-50%)"
                h="auto"
                minW="auto"
                variant="ghost"
                color="gray.400"
                zIndex={2}
              />
              <Input
                pl={12}
                h="44px"
                placeholder="Search tasks..."
                variant="filled"
                bg="gray.50"
                borderRadius="xl"
                fontSize="sm"
                _placeholder={{ color: 'gray.400' }}
                _hover={{ bg: 'gray.100' }}
                _focus={{
                  bg: 'white',
                  borderColor: 'brand.500',
                  boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)'
                }}
              />
            </Box>
          </HStack>

          <HStack spacing={4}>
            <Tooltip label="Notifications">
              <IconButton
                aria-label="Notifications"
                icon={<FiBell />}
                variant="ghost"
                color="gray.600"
                borderRadius="xl"
                h="44px"
                w="44px"
                fontSize="xl"
                _hover={{ bg: 'gray.50' }}
              />
            </Tooltip>

            <Menu>
              <MenuButton
                as={Button}
                variant="ghost"
                p={2}
                height="auto"
                borderRadius="xl"
                _hover={{ bg: 'gray.50' }}
              >
                <HStack spacing={3}>
                  <Box textAlign="right">
                    <Text fontWeight="semibold" color="gray.700" fontSize="sm">
                      {user?.displayName}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {user?.email}
                    </Text>
                  </Box>
                  <Avatar
                    size="sm"
                    name={user?.displayName || undefined}
                    src={user?.photoURL || undefined}
                  />
                </HStack>
              </MenuButton>
              <MenuList shadow="lg" py={2}>
                <MenuItem
                  onClick={() => navigate('/settings')}
                  fontSize="sm"
                  icon={<Icon as={FiSettings} color="gray.400" />}
                >
                  Account Settings
                </MenuItem>
                <MenuItem
                  onClick={handleSignOut}
                  fontSize="sm"
                  color="red.500"
                  icon={<Icon as={FiMenu} color="red.400" />}
                >
                  Sign Out
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>

        {/* Page Content */}
        <Box p={8}>
          <Outlet />
        </Box>
      </Box>

      {/* Mobile Navigation Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">
            <HStack spacing={3}>
              <Box
                w="32px"
                h="32px"
                bg="brand.500"
                borderRadius="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize="lg" fontWeight="bold" color="white">T</Text>
              </Box>
              <Text fontSize="xl" fontWeight="bold">
                TaskBuddy
              </Text>
            </HStack>
          </DrawerHeader>
          <DrawerCloseButton />
          <DrawerBody>
            <NavContent />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
};