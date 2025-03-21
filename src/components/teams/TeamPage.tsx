import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  Heading,
  HStack,
  Text,
  VStack,
  useDisclosure,
  useColorModeValue,
  Card,
  CardBody,
  CardHeader,
  Avatar,
  AvatarGroup,
  Badge,
  Divider,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
  SimpleGrid,
} from '@chakra-ui/react';
import { AddIcon, SettingsIcon } from '@chakra-ui/icons';
import { FiUserPlus, FiUsers, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { EditTeamModal } from './EditTeamModal';
import { useTeams } from '../../hooks/useTeams';
import { useTasks } from '../../hooks/useTasks';
import { CreateTeamModal } from './CreateTeamModal';
import { TeamMemberInvite } from './TeamMemberInvite';
import { TeamCard } from './TeamCard';
import { TaskCard } from '../tasks/TaskCard';
import { LoadingState } from '../common/LoadingState';
import { EmptyState } from '../common/EmptyState';

export const TeamPage = () => {
  const { teams, loading, error, deleteTeam, updateTeam, refreshTeams } = useTeams();
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const { isOpen: isCreateTeamOpen, onOpen: onCreateTeamOpen, onClose: onCreateTeamClose } = useDisclosure();
  const { isOpen: isInviteOpen, onOpen: onInviteOpen, onClose: onInviteClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  
  const { tasks: teamTasks, loading: tasksLoading } = useTasks({
    teamId: selectedTeam || undefined
  });

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <EmptyState title="Error" message={error} />;
  }

  const selectedTeamData = teams.find(team => team.id === selectedTeam);

  return (
    <Container maxW="container.xl" py={8}>
      {!selectedTeam ? (
        // Teams List View
        <Box>
          <HStack justify="space-between" mb={6}>
            <Heading size="lg">My Teams</Heading>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              onClick={onCreateTeamOpen}
            >
              Create Team
            </Button>
          </HStack>

          {teams.length === 0 ? (
            <EmptyState
              title="No Teams Yet"
              message="Create your first team to start collaborating"
              icon={FiUsers}
            />
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {teams.map(team => (
                <TeamCard
                  key={team.id}
                  team={team}
                  onClick={() => setSelectedTeam(team.id)}
                />
              ))}
            </SimpleGrid>
          )}
        </Box>
      ) : (
        // Team Detail View
        <Box>
          <HStack justify="space-between" mb={6}>
            <Button
              variant="ghost"
              onClick={() => setSelectedTeam(null)}
            >
              ← Back to Teams
            </Button>
            <HStack>
              <Button
                leftIcon={<FiUserPlus />}
                colorScheme="blue"
                variant="outline"
                onClick={onInviteOpen}
              >
                Invite Members
              </Button>
              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<SettingsIcon />}
                  variant="ghost"
                  aria-label="Team settings"
                />
                <MenuList>
                  <MenuItem icon={<FiEdit2 />} onClick={onEditOpen}>Edit Team</MenuItem>
                  <MenuItem
                    icon={<FiTrash2 />}
                    color="red.500"
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to delete this team?')) {
                        try {
                          await deleteTeam(selectedTeam);
                          setSelectedTeam(null);
                        } catch (error) {
                          console.error('Failed to delete team:', error);
                        }
                      }
                    }}
                  >
                    Delete Team
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </HStack>

          <Grid templateColumns={{ base: '1fr', lg: '300px 1fr' }} gap={8}>
            {/* Team Info Sidebar */}
            <VStack spacing={6}>
              <Card w="full" bg={bgColor} borderColor={borderColor} borderWidth={1}>
                <CardHeader>
                  <Heading size="md">{selectedTeamData?.name}</Heading>
                  {selectedTeamData?.description && (
                    <Text color="gray.500" mt={2} fontSize="sm">
                      {selectedTeamData.description}
                    </Text>
                  )}
                </CardHeader>
                <CardBody>
                  <VStack align="start" spacing={4}>
                    <Box>
                      <Text fontWeight="bold" mb={2}>Team Members</Text>
                      <VStack align="start" spacing={2}>
                        {selectedTeamData?.members.map(member => (
                          <HStack key={member.id}>
                            <Avatar
                              size="sm"
                              name={member.displayName || undefined}
                              src={member.photoURL || undefined}
                            />
                            <Box>
                              <Text fontSize="sm">{member.displayName || member.email}</Text>
                              <Badge size="sm" colorScheme={member.role === 'admin' ? 'purple' : 'gray'}>
                                {member.role}
                              </Badge>
                            </Box>
                          </HStack>
                        ))}
                      </VStack>
                    </Box>

                    {selectedTeamData && selectedTeamData.invitedEmails.length > 0 && (
                      <Box>
                        <Text fontWeight="bold" mb={2}>Pending Invites</Text>
                        <VStack align="start">
                          {selectedTeamData.invitedEmails.map(email => (
                            <Text key={email} fontSize="sm" color="gray.500">
                              {email}
                            </Text>
                          ))}
                        </VStack>
                      </Box>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            </VStack>

            {/* Team Tasks */}
            <Box>
              <HStack justify="space-between" mb={4}>
                <Heading size="md">Team Tasks</Heading>
                <Button leftIcon={<AddIcon />} colorScheme="blue">
                  Add Task
                </Button>
              </HStack>

              {tasksLoading ? (
                <LoadingState />
              ) : teamTasks && teamTasks.length > 0 ? (
                <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={4}>
                  {teamTasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </SimpleGrid>
              ) : (
                <EmptyState
                  title="No Tasks Yet"
                  message="Create your first task for this team"
                />
              )}
            </Box>
          </Grid>
        </Box>
      )}

      <CreateTeamModal isOpen={isCreateTeamOpen} onClose={onCreateTeamClose} />
      {selectedTeam && (
        <>
          <TeamMemberInvite
            isOpen={isInviteOpen}
            onClose={onInviteClose}
            teamId={selectedTeam}
          />
          {selectedTeamData && (
            <EditTeamModal
              isOpen={isEditOpen}
              onClose={() => {
                onEditClose();
                // Refresh the team data
                refreshTeams();
              }}
              team={selectedTeamData}
              onEditComplete={() => {
                onEditClose();
                // Refresh the team data
                refreshTeams();
              }}
            />
          )}
        </>
      )}
    </Container>
  );
};