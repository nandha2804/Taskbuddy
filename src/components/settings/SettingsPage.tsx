import React from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Switch,
  Select,
  Button,
  useColorMode,
  Divider,
  Card,
  CardHeader,
  CardBody,
  Text,
  useToast,
  HStack,
  Avatar,
  Input,
  IconButton,
} from '@chakra-ui/react';
import { FiCamera, FiSave } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useUserSettings } from '../../hooks/useUserSettings';
import { LoadingState } from '../common/LoadingState';

export const SettingsPage = () => {
  const { user } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();
  const { settings, loading, updateSettings, uploadProfilePhoto } = useUserSettings();

  if (loading || !settings) {
    return <LoadingState />;
  }

  const handleProfilePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    try {
      const file = e.target.files[0];
      await uploadProfilePhoto(file);
      toast({
        title: 'Profile photo updated',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error updating profile photo',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleSaveSettings = async () => {
    try {
      await updateSettings(settings);
      toast({
        title: 'Settings saved',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error saving settings',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg">Settings</Heading>

        {/* Profile Section */}
        <Card>
          <CardHeader>
            <Heading size="md">Profile</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <HStack spacing={4}>
                <Box position="relative">
                  <Avatar
                    size="xl"
                    name={user?.displayName || undefined}
                    src={user?.photoURL || undefined}
                  />
                  <IconButton
                    aria-label="Change profile photo"
                    icon={<FiCamera />}
                    size="sm"
                    position="absolute"
                    bottom={0}
                    right={0}
                    rounded="full"
                    onClick={() => document.getElementById('profile-photo')?.click()}
                  />
                  <Input
                    id="profile-photo"
                    type="file"
                    accept="image/*"
                    display="none"
                    onChange={handleProfilePhotoChange}
                  />
                </Box>
                <VStack align="start" flex={1}>
                  <Text fontWeight="bold">{user?.displayName}</Text>
                  <Text color="gray.500">{user?.email}</Text>
                </VStack>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <Heading size="md">Appearance</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <FormControl display="flex" alignItems="center">
                <FormLabel mb={0}>Dark Mode</FormLabel>
                <Switch
                  isChecked={colorMode === 'dark'}
                  onChange={toggleColorMode}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Default View</FormLabel>
                <Select
                  value={settings.defaultView}
                  onChange={(e) => updateSettings({ ...settings, defaultView: e.target.value })}
                >
                  <option value="list">List View</option>
                  <option value="board">Board View</option>
                </Select>
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <Heading size="md">Notifications</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <FormControl display="flex" alignItems="center">
                <FormLabel mb={0}>Email Notifications</FormLabel>
                <Switch
                  isChecked={settings.emailNotifications}
                  onChange={(e) => updateSettings({ 
                    ...settings, 
                    emailNotifications: e.target.checked 
                  })}
                />
              </FormControl>
              <FormControl display="flex" alignItems="center">
                <FormLabel mb={0}>Desktop Notifications</FormLabel>
                <Switch
                  isChecked={settings.desktopNotifications}
                  onChange={(e) => updateSettings({ 
                    ...settings, 
                    desktopNotifications: e.target.checked 
                  })}
                />
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        {/* Task Defaults */}
        <Card>
          <CardHeader>
            <Heading size="md">Task Defaults</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <FormControl>
                <FormLabel>Default Task Category</FormLabel>
                <Select
                  value={settings.defaultTaskCategory}
                  onChange={(e) => updateSettings({ 
                    ...settings, 
                    defaultTaskCategory: e.target.value 
                  })}
                >
                  <option value="work">Work</option>
                  <option value="personal">Personal</option>
                  <option value="shopping">Shopping</option>
                  <option value="others">Others</option>
                </Select>
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        <Button
          leftIcon={<FiSave />}
          colorScheme="blue"
          onClick={handleSaveSettings}
          alignSelf="flex-end"
        >
          Save Changes
        </Button>
      </VStack>
    </Container>
  );
};