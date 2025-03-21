import React from 'react';
import {
  Box,
  Container,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  HStack,
  VStack,
  Progress,
  List,
  ListItem,
  Avatar,
  Badge,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  FiCheckCircle,
  FiClock,
  FiUsers,
  FiActivity,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../hooks/useTasks';
import { useTeams } from '../../hooks/useTeams';
import { LoadingState } from '../common/LoadingState';
import { ActivityItem, createTaskActivity, createTeamActivity } from '../../types/activity';

export const OverviewPage = () => {
  const { user } = useAuth();
  const { tasks, loading: tasksLoading } = useTasks({
    userId: user?.uid,
  });
  const { teams, loading: teamsLoading } = useTeams();
  
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  if (tasksLoading || teamsLoading) {
    return <LoadingState />;
  }

  // Calculate task statistics
  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter(task => task.completed).length || 0;
  const completionRate = totalTasks ? (completedTasks / totalTasks) * 100 : 0;
  const recentTasks = tasks?.slice(0, 5) || [];

  // Get recent activities
  const recentActivities: ActivityItem[] = [
    ...recentTasks.map(createTaskActivity),
    ...teams.map(createTeamActivity),
  ].sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg">Overview</Heading>

        {/* Stats Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Total Tasks</StatLabel>
                <StatNumber>{totalTasks}</StatNumber>
                <StatHelpText>
                  <HStack>
                    <Icon as={FiActivity} />
                    <Text>Active Tasks</Text>
                  </HStack>
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Completed Tasks</StatLabel>
                <StatNumber>{completedTasks}</StatNumber>
                <StatHelpText>
                  <HStack>
                    <Icon as={FiCheckCircle} color="green.500" />
                    <Text>Finished</Text>
                  </HStack>
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Teams</StatLabel>
                <StatNumber>{teams.length}</StatNumber>
                <StatHelpText>
                  <HStack>
                    <Icon as={FiUsers} />
                    <Text>Active Teams</Text>
                  </HStack>
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Completion Rate</StatLabel>
                <StatNumber>{completionRate.toFixed(1)}%</StatNumber>
                <StatHelpText>
                  <Progress
                    value={completionRate}
                    size="sm"
                    colorScheme="green"
                    borderRadius="full"
                  />
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Recent Activity and Tasks */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* Recent Tasks */}
          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardHeader>
              <HStack justify="space-between">
                <Heading size="md">Recent Tasks</Heading>
                <Icon as={FiClock} />
              </HStack>
            </CardHeader>
            <CardBody>
              <List spacing={3}>
                {recentTasks.map(task => (
                  <ListItem key={task.id}>
                    <HStack justify="space-between">
                      <HStack>
                        <Icon
                          as={task.completed ? FiCheckCircle : FiClock}
                          color={task.completed ? 'green.500' : 'blue.500'}
                        />
                        <Text>{task.title}</Text>
                      </HStack>
                      <Badge
                        colorScheme={task.completed ? 'green' : 'blue'}
                        variant="subtle"
                      >
                        {task.completed ? 'Completed' : 'In Progress'}
                      </Badge>
                    </HStack>
                  </ListItem>
                ))}
              </List>
            </CardBody>
          </Card>

          {/* Team Activity */}
          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardHeader>
              <HStack justify="space-between">
                <Heading size="md">Team Activity</Heading>
                <Icon as={FiUsers} />
              </HStack>
            </CardHeader>
            <CardBody>
              <List spacing={3}>
                {teams.slice(0, 5).map(team => (
                  <ListItem key={team.id}>
                    <HStack justify="space-between">
                      <HStack>
                        <Avatar size="sm" name={team.name} />
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium">{team.name}</Text>
                          <Text fontSize="sm" color="gray.500">
                            {team.members.length} members
                          </Text>
                        </VStack>
                      </HStack>
                      <Badge colorScheme="purple" variant="subtle">
                        {team.members.length} active
                      </Badge>
                    </HStack>
                  </ListItem>
                ))}
              </List>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Activity Timeline */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Recent Activity</Heading>
          </CardHeader>
          <CardBody>
            <List spacing={4}>
              {recentActivities.map((activity, index) => (
                <ListItem key={index}>
                  <HStack>
                    <Icon 
                      as={activity.type === 'task' ? FiClock : FiUsers}
                      color={activity.type === 'task' ? 'blue.500' : 'purple.500'}
                    />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="medium">
                        {activity.type === 'task'
                          ? `New task: ${(activity.item as Task).title}`
                          : `Team update: ${(activity.item as Team).name}`
                        }
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        {activity.date.toLocaleDateString()}
                      </Text>
                    </VStack>
                  </HStack>
                </ListItem>
              ))}
            </List>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};