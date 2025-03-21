import {
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  IconButton,
  Tooltip,
  MenuDivider,
  useColorModeValue,
  MenuProps,
  Portal,
} from '@chakra-ui/react';
import {
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
  FiCopy,
  FiArchive,
  FiFlag,
  FiShare2,
} from 'react-icons/fi';
import { forwardRef } from 'react';
import { Task } from '../../types';

interface TaskMenuProps extends Omit<MenuProps, 'children'> {
  task: Task;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleComplete?: () => void;
  onDuplicate?: () => void;
  onArchive?: () => void;
  onShare?: () => void;
  menuRef?: React.RefObject<HTMLButtonElement>;
}

export const TaskMenu = forwardRef<HTMLButtonElement, TaskMenuProps>(({
  task,
  onEdit,
  onDelete,
  onToggleComplete,
  onDuplicate,
  onArchive,
  onShare,
  menuRef,
  ...menuProps
}, ref) => {
  const menuBg = useColorModeValue('white', 'gray.700');
  const dangerColor = useColorModeValue('red.600', 'red.300');
  const iconColor = useColorModeValue('gray.600', 'gray.200');

  return (
    <Menu {...menuProps}>
      <Tooltip label="Task menu (Ctrl + M)">
        <MenuButton
          ref={ref || menuRef}
          as={IconButton}
          icon={<FiMoreVertical />}
          variant="ghost"
          size="sm"
          aria-label="Task options"
          color={iconColor}
        />
      </Tooltip>
      <Portal>
        <MenuList bg={menuBg} zIndex="popover">
          <MenuItem
            icon={<FiEdit2 />}
            onClick={onEdit}
            command="Ctrl+E"
            isDisabled={!onEdit}
          >
            Edit
          </MenuItem>
          <MenuItem
            icon={task.completed ? <FiXCircle /> : <FiCheckCircle />}
            onClick={onToggleComplete}
            command="Ctrl+C"
            isDisabled={!onToggleComplete}
          >
            Mark as {task.completed ? 'incomplete' : 'complete'}
          </MenuItem>
          
          <MenuDivider />
          
          <MenuItem
            icon={<FiCopy />}
            onClick={onDuplicate}
            command="Ctrl+D"
            isDisabled={!onDuplicate}
          >
            Duplicate
          </MenuItem>
          <MenuItem
            icon={<FiArchive />}
            onClick={onArchive}
            isDisabled={!onArchive}
          >
            Archive
          </MenuItem>
          <MenuItem
            icon={<FiShare2 />}
            onClick={onShare}
            isDisabled={!onShare}
          >
            Share
          </MenuItem>

          <MenuDivider />
          
          <MenuItem
            icon={<FiFlag />}
            onClick={() => {/* Toggle priority */}}
          >
            Set Priority
          </MenuItem>

          <MenuDivider />
          
          <MenuItem
            icon={<FiTrash2 />}
            onClick={onDelete}
            color={dangerColor}
            command="Shift+Del"
            isDisabled={!onDelete}
          >
            Delete
          </MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  );
});

TaskMenu.displayName = 'TaskMenu';

// Usage example:
// <TaskMenu
//   task={task}
//   onEdit={handleEdit}
//   onDelete={handleDelete}
//   onToggleComplete={handleToggleComplete}
//   onDuplicate={handleDuplicate}
//   onArchive={handleArchive}
//   onShare={handleShare}
//   menuRef={menuRef}
// />