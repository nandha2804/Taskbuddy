import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Badge,
  useColorModeValue,
  VStack,
  IconButton,
  Tooltip,
  Box,
} from '@chakra-ui/react';
import { FiCommand } from 'react-icons/fi';
import { KeyboardShortcut, formatShortcut } from '../../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: KeyboardShortcut[];
}

export const KeyboardShortcutsBadge = () => (
  <Tooltip label="Show keyboard shortcuts (Shift + ?)">
    <IconButton
      icon={<FiCommand />}
      aria-label="Show keyboard shortcuts"
      variant="ghost"
      size="sm"
    />
  </Tooltip>
);

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  isOpen,
  onClose,
  shortcuts,
}) => {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const shortcutBg = useColorModeValue('gray.100', 'gray.700');

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent bg={bg}>
        <ModalHeader>Keyboard Shortcuts</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Shortcut</Th>
                  <Th>Description</Th>
                </Tr>
              </Thead>
              <Tbody>
                {shortcuts.map((shortcut, index) => (
                  <Tr key={index}>
                    <Td>
                      <Badge
                        px={2}
                        py={1}
                        borderRadius="md"
                        bg={shortcutBg}
                        fontFamily="mono"
                        fontSize="sm"
                      >
                        {formatShortcut(shortcut)}
                      </Badge>
                    </Td>
                    <Td>
                      <Text fontSize="sm">{shortcut.description}</Text>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>

            <Box fontSize="sm" color="gray.500" pt={4}>
              <Text>
                Note: Press <Badge bg={shortcutBg}>Shift + ?</Badge> at any time to
                show these shortcuts
              </Text>
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

// Helper component for displaying a single shortcut inline
export const ShortcutBadge: React.FC<{ shortcut: KeyboardShortcut }> = ({
  shortcut,
}) => {
  const bg = useColorModeValue('gray.100', 'gray.700');

  return (
    <Tooltip label={shortcut.description}>
      <Badge px={2} py={1} borderRadius="md" bg={bg} fontFamily="mono" fontSize="sm">
        {formatShortcut(shortcut)}
      </Badge>
    </Tooltip>
  );
};