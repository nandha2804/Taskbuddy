import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Select,
  useColorModeValue,
  VStack,
  Text,
  useDisclosure,
  Icon,
} from '@chakra-ui/react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { AddIcon } from '@chakra-ui/icons';
import { useTasks } from '../../hooks/useTasks';
import { useAuth } from '../../context/AuthContext';
import { useTeams } from '../../hooks/useTeams';
import { Task } from '../../types';
import { TaskCard } from './TaskCard';
import { AddTaskModal } from './AddTaskModal';
import { LoadingState } from '../common/LoadingState';
import { EmptyState } from '../common/EmptyState';
import { taskStatusColumns } from '../../constants/taskStatus';

interface ColumnData {
  id: string;
  title: string;
  tasks: Task[];
}

export const TaskBoard = () => {
  const { user } = useAuth();
  const { teams } = useTeams();
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const { tasks, loading, error, updateTask, deleteTask } = useTasks({
    userId: user?.uid,
    teamId: selectedTeam || undefined 
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const columnBg = useColorModeValue('white', 'gray.700');

  const getColumnTasks = (columnId: string): Task[] => {
    if (!tasks) return [];
    switch (columnId) {
      case 'todo':
        return tasks.filter(task => !task.completed && task.status === 'active');
      case 'inProgress':
        return tasks.filter(task => !task.completed && task.status === 'inProgress');
      case 'completed':
        return tasks.filter(task => task.completed);
      default:
        return [];
    }
  };

  const columns: ColumnData[] = taskStatusColumns.map(status => ({
    id: status.id,
    title: status.title,
    tasks: getColumnTasks(status.id),
  }));

  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const task = tasks?.find(t => t.id === draggableId);
    if (!task) return;

    const newStatus = destination.droppableId === 'completed' ? 'completed' : 
                     destination.droppableId === 'inProgress' ? 'inProgress' : 'active';

    updateTask({
      id: task.id,
      data: {
        status: newStatus,
        completed: destination.droppableId === 'completed',
      },
    });
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <EmptyState title="Error" message={error.message} />;
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Box>
        <HStack justify="space-between" mb={6}>
          <Heading size="lg">Task Board</Heading>
          <HStack spacing={4}>
            {teams.length > 0 && (
              <Select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                placeholder="Filter by team"
                w="200px"
              >
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </Select>
            )}
            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              onClick={onOpen}
            >
              Add Task
            </Button>
          </HStack>
        </HStack>

        <DragDropContext onDragEnd={onDragEnd}>
          <Flex
            gap={6}
            align="start"
            overflowX="auto"
            pb={4}
            sx={{
              '&::-webkit-scrollbar': {
                height: '8px',
                borderRadius: '8px',
                backgroundColor: `rgba(0, 0, 0, 0.05)`,
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: `rgba(0, 0, 0, 0.1)`,
                borderRadius: '8px',
              },
            }}
          >
            {taskStatusColumns.map((column) => {
              const columnTasks = getColumnTasks(column.id);
              return (
                <Box
                  key={column.id}
                  bg={columnBg}
                  p={4}
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor={column.borderColor}
                  minW="320px"
                  w="320px"
                  shadow="sm"
                >
                  <VStack align="stretch" spacing={4}>
                    <HStack justify="space-between" bg={column.bgColor} p={2} borderRadius="md">
                      <HStack>
                        <Icon as={column.icon} color={column.color} boxSize={5} />
                        <Heading size="md" color={column.color}>
                          {column.title}
                        </Heading>
                      </HStack>
                      <Text color={column.color} fontSize="sm" fontWeight="bold">
                        {columnTasks.length}
                      </Text>
                    </HStack>

                    <Droppable droppableId={column.id}>
                      {(provided) => (
                        <VStack
                          align="stretch"
                          spacing={4}
                          minH="200px"
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {columnTasks.map((task, index) => (
                            <Draggable
                              key={task.id}
                              draggableId={task.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <Box
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  opacity={snapshot.isDragging ? 0.8 : 1}
                                  shadow={snapshot.isDragging ? 'lg' : undefined}
                                >
                                  <TaskCard
                                    task={task}
                                    onEdit={(task) => {
                                      setEditingTask(task);
                                      onOpen();
                                    }}
                                    onDelete={async (taskId) => {
                                      try {
                                        await deleteTask(taskId);
                                      } catch (error) {
                                        console.error('Failed to delete task:', error);
                                      }
                                    }}
                                  />
                                </Box>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </VStack>
                      )}
                    </Droppable>
                  </VStack>
                </Box>
              );
            })}
          </Flex>
        </DragDropContext>
      </Box>

      <AddTaskModal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setEditingTask(null);
        }}
        editTask={editingTask}
        onEditComplete={() => setEditingTask(null)}
      />
    </Container>
  );
};