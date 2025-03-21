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
  Select,
  VStack,
  InputGroup,
  InputRightElement,
  Text,
  Divider,
  useColorModeValue,
  Box,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Task, TaskInput } from '../../types';
import { useTasks } from '../../hooks/useTasks';
import { useTeams } from '../../hooks/useTeams';
import { 
  TASK_CATEGORIES, 
  TASK_PRIORITIES, 
  MAX_TITLE_LENGTH, 
  MAX_DESCRIPTION_LENGTH,
} from '../../constants';
import { FileUpload } from '../common/FileUpload';
import { config } from '../../config/config';
import { useTaskToast } from '../common/CustomToast';
import { TeamMember } from '../../types/models';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTask?: Task | null;
  onEditComplete?: () => void;
}

interface FormErrors {
  title?: string;
  description?: string;
  dueDate?: string;
}

const initialTask: TaskInput = {
  title: '',
  description: '',
  category: 'work',
  completed: false,
  dueDate: null,
  priority: 'medium',
  labels: [],
  attachments: [],
  teamId: undefined,
  assignedTo: [],
};

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, editTask, onEditComplete }) => {
  const [formData, setFormData] = useState<TaskInput>(initialTask);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { addTask, updateTask } = useTasks({ userId: user?.uid });
  const { teams } = useTeams();
  const toast = useTaskToast();
  const bgColor = useColorModeValue('white', 'gray.700');

  useEffect(() => {
    if (editTask) {
      setFormData({
        title: editTask.title,
        description: editTask.description || '',
        category: editTask.category,
        completed: editTask.completed,
        dueDate: editTask.dueDate,
        priority: editTask.priority,
        labels: editTask.labels || [],
        attachments: editTask.attachments || [],
        teamId: editTask.teamId,
        assignedTo: editTask.assignedTo || [],
      });
    } else {
      setFormData(initialTask);
    }
  }, [editTask]);

  const currentTeam = teams.find(team => team.id === formData.teamId);
  const teamMembers = currentTeam?.members || [];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > MAX_TITLE_LENGTH) {
      newErrors.title = `Title must be less than ${MAX_TITLE_LENGTH} characters`;
    }

    if (formData.description.length > MAX_DESCRIPTION_LENGTH) {
      newErrors.description = `Description must be less than ${MAX_DESCRIPTION_LENGTH} characters`;
    }

    if (formData.dueDate) {
      const dueDate = new Date(formData.dueDate);
      if (isNaN(dueDate.getTime())) {
        newErrors.dueDate = 'Invalid date format';
      } else if (dueDate < new Date(new Date().setHours(0, 0, 0, 0))) {
        newErrors.dueDate = 'Due date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.createError('You must be signed in to manage tasks');
      return;
    }

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      if (editTask) {
        await updateTask({ id: editTask.id, data: formData });
        toast.updateSuccess();
        onEditComplete?.();
      } else {
        await addTask(formData);
        toast.createSuccess();
      }
      onClose();
      setFormData(initialTask);
    } catch (error) {
      const action = editTask ? 'update' : 'create';
      toast.createError(error instanceof Error ? error.message : `Failed to ${action} task`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'teamId') {
      setFormData(prev => ({
        ...prev,
        assignedTo: [],
      }));
    }
  };

  const handleAssigneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const selectedMembers = Array.from(options)
      .filter(option => option.selected)
      .map(option => option.value);
    
    setFormData(prev => ({
      ...prev,
      assignedTo: selectedMembers
    }));
  };

  const handleFileUpload = (urls: string[]) => {
    setFormData((prev) => ({
      ...prev,
      attachments: urls,
    }));
  };

  const handleClose = () => {
    setFormData(initialTask);
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="xl"
      closeOnOverlayClick={false}
    >
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <form onSubmit={handleSubmit}>
          <ModalHeader>{editTask ? 'Edit Task' : 'Add New Task'}</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired isInvalid={!!errors.title}>
                <FormLabel>Title</FormLabel>
                <InputGroup>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter task title"
                    maxLength={MAX_TITLE_LENGTH}
                  />
                  <InputRightElement width="4.5rem">
                    <Text fontSize="sm" color="gray.500">
                      {formData.title.length}/{MAX_TITLE_LENGTH}
                    </Text>
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errors.title}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.description}>
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter task description"
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  resize="vertical"
                  minH="100px"
                />
                <Text fontSize="sm" color="gray.500" textAlign="right">
                  {formData.description.length}/{MAX_DESCRIPTION_LENGTH}
                </Text>
                <FormErrorMessage>{errors.description}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>Team</FormLabel>
                <Select
                  name="teamId"
                  value={formData.teamId || ''}
                  onChange={handleChange}
                  placeholder="Select team (optional)"
                >
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {formData.teamId && (
                <FormControl>
                  <FormLabel>Assign To</FormLabel>
                  <Select
                    name="assignedTo"
                    multiple
                    value={formData.assignedTo || []}
                    onChange={handleAssigneeChange}
                    size="md"
                  >
                    {teamMembers.map((member: TeamMember) => (
                      <option key={member.id} value={member.id}>
                        {member.displayName || member.email}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              )}

              <FormControl isRequired>
                <FormLabel>Category</FormLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {Object.entries(TASK_CATEGORIES).map(([value, { label }]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Priority</FormLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  {Object.entries(TASK_PRIORITIES).map(([value, { label }]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isInvalid={!!errors.dueDate}>
                <FormLabel>Due Date</FormLabel>
                <Input
                  name="dueDate"
                  type="date"
                  value={formData.dueDate || ''}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                />
                <FormErrorMessage>{errors.dueDate}</FormErrorMessage>
              </FormControl>

              <Divider />

              <FormControl>
                <FormLabel>Attachments</FormLabel>
                <FileUpload 
                  onUploadComplete={handleFileUpload}
                  folder={config.storage.attachments}
                  maxFiles={config.defaults.maxFiles}
                  currentFiles={formData.attachments}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              type="submit"
              isLoading={isSubmitting}
              loadingText={editTask ? "Updating..." : "Creating..."}
            >
              {editTask ? 'Update Task' : 'Create Task'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};