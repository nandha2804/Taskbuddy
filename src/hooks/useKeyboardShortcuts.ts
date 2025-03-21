import { useEffect, useCallback } from 'react';
import { useDisclosure } from '@chakra-ui/react';

interface KeyboardShortcut {
  key: string;
  description: string;
  command: () => void;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
}

interface UseKeyboardShortcutsProps {
  onNewTask?: () => void;
  onToggleView?: () => void;
  onToggleFilters?: () => void;
  onResetFilters?: () => void;
  onFocusSearch?: () => void;
}

export const useKeyboardShortcuts = ({
  onNewTask,
  onToggleView,
  onToggleFilters,
  onResetFilters,
  onFocusSearch,
}: UseKeyboardShortcutsProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'n',
      description: 'Create new task',
      command: onNewTask || (() => {}),
      ctrl: true,
    },
    {
      key: 'v',
      description: 'Toggle view (List/Grid)',
      command: onToggleView || (() => {}),
      ctrl: true,
    },
    {
      key: 'f',
      description: 'Toggle filters',
      command: onToggleFilters || (() => {}),
      ctrl: true,
    },
    {
      key: 'r',
      description: 'Reset filters',
      command: onResetFilters || (() => {}),
      ctrl: true,
    },
    {
      key: '/',
      description: 'Focus search',
      command: onFocusSearch || (() => {}),
      ctrl: true,
    },
    {
      key: '?',
      description: 'Show/Hide keyboard shortcuts',
      command: () => (isOpen ? onClose() : onOpen()),
      shift: true,
    },
  ];

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const shortcut = shortcuts.find(
        (s) =>
          s.key.toLowerCase() === event.key.toLowerCase() &&
          !!s.ctrl === event.ctrlKey &&
          !!s.shift === event.shiftKey &&
          !!s.alt === event.altKey
      );

      if (shortcut) {
        event.preventDefault();
        shortcut.command();
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    shortcuts,
    isShortcutsOpen: isOpen,
    onOpenShortcuts: onOpen,
    onCloseShortcuts: onClose,
  };
};

export const formatShortcut = (shortcut: KeyboardShortcut): string => {
  const parts: string[] = [];
  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.alt) parts.push('Alt');
  parts.push(shortcut.key.toUpperCase());
  return parts.join(' + ');
};

export type { KeyboardShortcut };