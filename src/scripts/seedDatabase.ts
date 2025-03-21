import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { config } from './config.js';
import type {
  User,
  Task,
  Team,
  TeamMember,
  UserProfile,
  UserPreferences
} from '../types/models.js';

// Initialize Firebase
const app = initializeApp(config.firebase);
const db = getFirestore(app);

const sampleUsers: Omit<User, 'id'>[] = [
  {
    email: 'john.doe@example.com',
    displayName: 'John Doe',
    photoURL: null,
    createdAt: new Date(),
    lastLoginAt: new Date()
  },
  {
    email: 'jane.smith@example.com',
    displayName: 'Jane Smith',
    photoURL: null,
    createdAt: new Date(),
    lastLoginAt: new Date()
  }
];

const sampleTeams: Omit<Team, 'id'>[] = [
  {
    name: 'Development Team',
    description: 'Main development team for the project',
    createdBy: 'user1',
    createdAt: new Date(),
    members: [
      {
        id: 'user1',
        email: 'john.doe@example.com',
        displayName: 'John Doe',
        role: 'admin',
        joinedAt: new Date()
      },
      {
        id: 'user2',
        email: 'jane.smith@example.com',
        displayName: 'Jane Smith',
        role: 'member',
        joinedAt: new Date()
      }
    ],
    memberEmails: ['john.doe@example.com', 'jane.smith@example.com'],
    invitedEmails: []
  }
];

const currentDate = new Date();
const sampleTasks: Omit<Task, 'id'>[] = [
  {
    title: 'Implement Authentication',
    description: 'Set up Firebase authentication and user management',
    category: 'work',
    priority: 'high',
    completed: false,
    userId: 'user1',
    teamId: 'team1',
    assignedTo: ['user1', 'user2'],
    createdAt: currentDate,
    updatedAt: currentDate,
    dueDate: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  },
  {
    title: 'Design Team Dashboard',
    description: 'Create wireframes and mockups for the team dashboard',
    category: 'work',
    priority: 'medium',
    completed: false,
    userId: 'user2',
    teamId: 'team1',
    assignedTo: ['user2'],
    createdAt: currentDate,
    updatedAt: currentDate,
    dueDate: new Date(currentDate.getTime() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
  }
];

const defaultUserPreferences: UserPreferences = {
  theme: 'system',
  emailNotifications: true,
  desktopNotifications: true,
  defaultTaskView: 'list',
  defaultTaskCategory: 'work'
};

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    // Use batched writes for better performance and atomicity
    const batch = writeBatch(db);

    // Seed users
    for (let i = 0; i < sampleUsers.length; i++) {
      const userId = `user${i + 1}`;
      const userDocRef = doc(db, 'users', userId);
      const userData = {
        ...sampleUsers[i],
        createdAt: Timestamp.fromDate(sampleUsers[i].createdAt),
        lastLoginAt: Timestamp.fromDate(sampleUsers[i].lastLoginAt)
      };
      batch.set(userDocRef, userData);

      // Create user profile
      const userProfileRef = doc(db, 'userProfiles', userId);
      const userProfile: Omit<UserProfile, 'id'> = {
        email: sampleUsers[i].email,
        displayName: sampleUsers[i].displayName,
        photoURL: sampleUsers[i].photoURL,
        teams: ['team1'],
        preferences: defaultUserPreferences,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      batch.set(userProfileRef, {
        ...userProfile,
        createdAt: Timestamp.fromDate(userProfile.createdAt),
        updatedAt: Timestamp.fromDate(userProfile.updatedAt)
      });
    }

    // Seed teams
    for (let i = 0; i < sampleTeams.length; i++) {
      const teamId = `team${i + 1}`;
      const teamDocRef = doc(db, 'teams', teamId);
      const teamData = {
        ...sampleTeams[i],
        createdAt: Timestamp.fromDate(sampleTeams[i].createdAt),
        members: sampleTeams[i].members.map((member: TeamMember) => ({
          ...member,
          joinedAt: Timestamp.fromDate(member.joinedAt)
        }))
      };
      batch.set(teamDocRef, teamData);
    }

    // Seed tasks
    for (let i = 0; i < sampleTasks.length; i++) {
      const taskId = `task${i + 1}`;
      const taskDocRef = doc(db, 'tasks', taskId);
      const taskData = {
        ...sampleTasks[i],
        createdAt: Timestamp.fromDate(sampleTasks[i].createdAt),
        updatedAt: Timestamp.fromDate(sampleTasks[i].updatedAt),
        dueDate: Timestamp.fromDate(sampleTasks[i].dueDate as Date)
      };
      batch.set(taskDocRef, taskData);
    }

    // Commit the batch
    await batch.commit();
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Execute the seeding
seedDatabase().catch(console.error);