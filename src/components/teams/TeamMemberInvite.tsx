import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  Text,
  List,
  ListItem,
  HStack,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiUserPlus, FiX } from 'react-icons/fi';
import { useTeams } from '../../hooks/useTeams';

interface TeamMemberInviteProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
}

export const TeamMemberInvite: React.FC<TeamMemberInviteProps> = ({
  isOpen,
  onClose,
  teamId,
}) => {
  const [email, setEmail] = useState('');
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { inviteTeamMembers } = useTeams();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleAddEmail = () => {
    if (!email) return;
    if (!email.includes('@')) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address',
        status: 'error',
        duration: 3000,
      });
      return;
    }
    if (inviteEmails.includes(email)) {
      toast({
        title: 'Duplicate email',
        description: 'This email has already been added',
        status: 'warning',
        duration: 3000,
      });
      return;
    }
    setInviteEmails([...inviteEmails, email]);
    setEmail('');
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setInviteEmails(inviteEmails.filter(e => e !== emailToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteEmails.length === 0) {
      toast({
        title: 'No emails added',
        description: 'Please add at least one email address',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await inviteTeamMembers(teamId, inviteEmails);
      toast({
        title: 'Invitations sent',
        description: 'Team invitations have been sent successfully',
        status: 'success',
        duration: 3000,
      });
      setInviteEmails([]);
      onClose();
    } catch (error) {
      toast({
        title: 'Failed to send invitations',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEmail();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <form onSubmit={handleSubmit}>
          <ModalHeader>Invite Team Members</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Email Address</FormLabel>
                <HStack>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    type="email"
                    onKeyPress={handleKeyPress}
                  />
                  <IconButton
                    aria-label="Add email"
                    icon={<FiUserPlus />}
                    onClick={handleAddEmail}
                  />
                </HStack>
              </FormControl>

              {inviteEmails.length > 0 && (
                <List spacing={2} width="100%">
                  {inviteEmails.map((email) => (
                    <ListItem
                      key={email}
                      p={2}
                      borderWidth={1}
                      borderColor={borderColor}
                      borderRadius="md"
                    >
                      <HStack justify="space-between">
                        <Text>{email}</Text>
                        <IconButton
                          aria-label="Remove email"
                          icon={<FiX />}
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveEmail(email)}
                        />
                      </HStack>
                    </ListItem>
                  ))}
                </List>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              type="submit"
              isLoading={isSubmitting}
              loadingText="Sending..."
              isDisabled={inviteEmails.length === 0}
            >
              Send Invitations
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};