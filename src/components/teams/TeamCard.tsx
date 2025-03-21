import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  AvatarGroup,
  Badge,
  useColorModeValue,
  Card,
  CardBody,
  CardHeader,
  Progress,
  Tooltip,
  IconButton,
} from '@chakra-ui/react';
import { FiMoreVertical } from 'react-icons/fi';
import { Team } from '../../types/models';

interface TeamCardProps {
  team: Team;
  onClick?: () => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({ team, onClick }) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  const adminCount = team.members.filter(m => m.role === 'admin').length;
  const memberCount = team.members.filter(m => m.role === 'member').length;
  const pendingCount = team.invitedEmails.length;

  return (
    <Card
      bg={bgColor}
      borderColor={borderColor}
      borderWidth={1}
      cursor="pointer"
      onClick={onClick}
      _hover={{
        transform: 'translateY(-2px)',
        shadow: 'md',
      }}
      transition="all 0.2s"
    >
      <CardHeader>
        <HStack justify="space-between">
          <VStack align="start" spacing={1}>
            <Text fontSize="lg" fontWeight="bold">
              {team.name}
            </Text>
            <Text fontSize="sm" color={textColor}>
              {adminCount + memberCount} members
              {pendingCount > 0 && `, ${pendingCount} pending`}
            </Text>
          </VStack>

          <IconButton
            aria-label="Team menu"
            icon={<FiMoreVertical />}
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Implement team menu
            }}
          />
        </HStack>
      </CardHeader>

      <CardBody>
        <VStack align="stretch" spacing={4}>
          {team.description && (
            <Text fontSize="sm" color={textColor} noOfLines={2}>
              {team.description}
            </Text>
          )}

          <Box>
            <AvatarGroup size="sm" max={4}>
              {team.members.map(member => (
                <Tooltip
                  key={member.id}
                  label={`${member.displayName || member.email} (${member.role})`}
                >
                  <Avatar
                    name={member.displayName || undefined}
                    src={member.photoURL || undefined}
                    bg={member.role === 'admin' ? 'purple.500' : 'blue.500'}
                    borderRadius="sm"
                  />
                </Tooltip>
              ))}
            </AvatarGroup>
          </Box>

          <Box>
            <HStack justify="space-between" mb={2}>
              <Text fontSize="xs" color={textColor}>
                Team Composition
              </Text>
              <HStack spacing={2}>
                <Badge colorScheme="purple" fontSize="xs">
                  {adminCount} admin{adminCount !== 1 && 's'}
                </Badge>
                <Badge colorScheme="blue" fontSize="xs">
                  {memberCount} member{memberCount !== 1 && 's'}
                </Badge>
              </HStack>
            </HStack>
            <Progress
              value={(team.members.length / (team.members.length + pendingCount)) * 100}
              size="sm"
              colorScheme="blue"
              borderRadius="sm"
            />
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
};