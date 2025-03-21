import React from 'react';
import {
  Box,
  Flex,
  HStack,
  Link,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  useColorMode,
  Stack,
  Avatar,
  Text,
  Icon,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiList,
  FiGrid,
  FiUsers,
  FiSettings,
  FiSun,
  FiMoon,
  FiUser,
  FiLogOut,
  FiHome
} from 'react-icons/fi';

const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  const activeBg = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.100', 'gray.600');

  return (
    <Link
      as={RouterLink}
      to={to}
      px={4}
      py={2}
      rounded="sm"
      bg={isActive ? activeBg : 'transparent'}
      _hover={{
        bg: !isActive ? hoverBg : activeBg,
      }}
      display="flex"
      alignItems="center"
      gap={2}
    >
      {children}
    </Link>
  );
};

export const Navigation = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, signOut } = useAuth();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Box 
      bg={bgColor} 
      px={4} 
      borderBottom="1px" 
      borderColor={borderColor}
      position="sticky"
      top={0}
      zIndex="sticky"
    >
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <IconButton
          size="md"
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label="Open Menu"
          display={{ md: 'none' }}
          onClick={isOpen ? onClose : onOpen}
        />
        <HStack spacing={8} alignItems="center">
          <Text
            fontSize="lg"
            fontWeight="bold"
            color={useColorModeValue('gray.800', 'white')}
          >
            Task Manager
          </Text>
          <HStack as="nav" spacing={4} display={{ base: 'none', md: 'flex' }}>
            <NavLink to="/overview">
              <Icon as={FiHome} />
              Overview
            </NavLink>
            <NavLink to="/tasks">
              <Icon as={FiList} />
              List View
            </NavLink>
            <NavLink to="/board">
              <Icon as={FiGrid} />
              Board View
            </NavLink>
            <NavLink to="/team">
              <Icon as={FiUsers} />
              Teams
            </NavLink>
          </HStack>
        </HStack>

        <HStack spacing={4}>
          <Button
            leftIcon={colorMode === 'light' ? <Icon as={FiMoon} /> : <Icon as={FiSun} />}
            onClick={toggleColorMode}
            variant="ghost"
            size="sm"
            rounded="sm"
            aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
          >
            {colorMode === 'light' ? 'Dark' : 'Light'}
          </Button>

          <Menu>
            <MenuButton
              as={Button}
              rounded="sm"
              variant="link"
              cursor="pointer"
              minW={0}
            >
              <Avatar 
                size="sm"
                name={user?.displayName || undefined}
                src={user?.photoURL || undefined}
                borderRadius="sm"
              />
            </MenuButton>
            <MenuList>
              <MenuItem as={RouterLink} to="/settings" icon={<Icon as={FiSettings} />}>
                Settings
              </MenuItem>
              <MenuItem as={RouterLink} to="/profile" icon={<Icon as={FiUser} />}>
                Profile
              </MenuItem>
              <MenuDivider />
              <MenuItem onClick={handleSignOut} icon={<Icon as={FiLogOut} color="red.500" />}>
                Sign Out
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>

      {/* Mobile nav */}
      {isOpen && (
        <Box pb={4} display={{ md: 'none' }}>
          <Stack as="nav" spacing={4}>
            <NavLink to="/overview">
              <Icon as={FiHome} />
              Overview
            </NavLink>
            <NavLink to="/tasks">
              <Icon as={FiList} />
              List View
            </NavLink>
            <NavLink to="/board">
              <Icon as={FiGrid} />
              Board View
            </NavLink>
            <NavLink to="/team">
              <Icon as={FiUsers} />
              Teams
            </NavLink>
          </Stack>
        </Box>
      )}
    </Box>
  );
};