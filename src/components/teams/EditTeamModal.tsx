import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
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
  FormErrorMessage,
  Input,
  Textarea,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { Team } from '../../types/models';
import { useTeams } from '../../hooks/useTeams';
import { useCustomToast } from '../common/CustomToast';

interface EditTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team;
  onEditComplete?: () => void;
}

interface FormErrors {
  name?: string;
  description?: string;
}

export const EditTeamModal: React.FC<EditTeamModalProps> = ({
  isOpen,
  onClose,
  team,
  onEditComplete,
}) => {
  const [formData, setFormData] = useState({
    name: team.name,
    description: team.description || '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useCustomToast();
  const bgColor = useColorModeValue('white', 'gray.700');
  const { user } = useAuth();
  const { updateTeam } = useTeams();

  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name,
        description: team.description || '',
      });
    }
  }, [team]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Team name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Authentication required', 'You must be signed in to update a team');
      return;
    }

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      if (!team.members.some(m => m.id === user.uid && m.role === 'admin')) {
        throw new Error('Only team admins can update team details');
      }

      await updateTeam(team.id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
      });

      toast.success('Team updated successfully');
      onEditComplete?.();
      onClose();
    } catch (error) {
      console.error('Failed to update team:', error);
      toast.error(
        'Failed to update team',
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <form onSubmit={handleSubmit}>
          <ModalHeader>Edit Team</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired isInvalid={!!errors.name}>
                <FormLabel>Team Name</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter team name"
                />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter team description"
                  resize="vertical"
                />
              </FormControl>
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
              loadingText="Updating..."
            >
              Update Team
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};