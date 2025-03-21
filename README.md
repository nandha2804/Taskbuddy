# Task Manager

A modern, feature-rich task management application built with React, TypeScript, and Firebase. The application provides a robust platform for managing tasks, collaborating with teams, and staying organized.

**Live Demo:** [https://taskbuddy-fawn.vercel.app](https://taskbuddy-fawn.vercel.app)

## Features

- **User Authentication**
  - Google Sign-in integration
  - Protected routes and authenticated sessions
  - User profile management

- **Task Management**
  - Create, update, and delete tasks
  - Task categorization (work/personal/shopping/others)
  - Priority levels (low/medium/high)
  - Due date tracking
  - Task assignments
  - Drag-and-drop task organization

- **Team Collaboration**
  - Team creation and management
  - Member invitations
  - Role-based permissions (admin/member)
  - Team-specific task views
  - Collaborative task assignments

- **User Experience**
  - Responsive Chakra UI design
  - Dark/light theme support
  - Real-time updates
  - Keyboard shortcuts
  - File attachments support
  - Drag and drop interface

## Screenshots

<table>
<tr>
<td><img src="public/1 (1).png" alt="Screenshot 1" width="280"/></td>
<td><img src="public/1 (2).png" alt="Screenshot 2" width="280"/></td>
<td><img src="public/1 (3).png" alt="Screenshot 3" width="280"/></td>
</tr>
<tr>
<td><img src="public/1 (4).png" alt="Screenshot 4" width="280"/></td>
<td><img src="public/1 (5).png" alt="Screenshot 5" width="280"/></td>
<td><img src="public/1 (6).png" alt="Screenshot 6" width="280"/></td>
</tr>
<tr>
<td><img src="public/1 (7).png" alt="Screenshot 7" width="280"/></td>
<td><img src="public/1 (8).png" alt="Screenshot 8" width="280"/></td>
<td><img src="public/1 (9).png" alt="Screenshot 9" width="280"/></td>
</tr>
<tr>
<td><img src="public/1 (10).png" alt="Screenshot 10" width="280"/></td>
<td><img src="public/1 (11).png" alt="Screenshot 11" width="280"/></td>
<td><img src="public/1 (12).png" alt="Screenshot 12" width="280"/></td>
</tr>
<tr>
<td><img src="public/1 (13).png" alt="Screenshot 13" width="280"/></td>
<td><img src="public/1 (14).png" alt="Screenshot 14" width="280"/></td>
<td></td>
</tr>
</table>

## Technology Stack

- **Frontend**
  - React 18.2
  - TypeScript
  - Vite (Build tool)
  - React Router DOM (Routing)
  - Chakra UI (Component library)
  - Framer Motion (Animations)
  - React Query (Data fetching/caching)
  - React Dropzone (File uploads)

- **Backend/Infrastructure**
  - Firebase Authentication
  - Cloud Firestore
  - Firebase Storage
  - Firebase Security Rules
  - Firebase Hosting

## Project Setup

### Prerequisites

- Node.js (v16 or higher)
- npm/yarn
- Firebase CLI
- Git

### Firebase Setup

1. Create a Firebase Project:
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Click "Add Project"
   - Enter project name and follow setup wizard

2. Enable Firebase Services:
   ```bash
   # Install Firebase CLI if not installed
   npm install -g firebase-tools

   # Login to Firebase
   firebase login

   # Initialize Firebase in your project
   firebase init

   # Select the following services:
   # - Authentication
   # - Firestore Database
   # - Storage (for attachments)
   ```

3. Configure Firebase Authentication:
   - Go to Authentication > Sign-in method
   - Enable Google Sign-in
   - Add authorized domains for your application

4. Set up Firestore Database:
   - Go to Firestore Database
   - Create database in test mode
   - Choose a location closest to your users
   - Deploy security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

### Local Development Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd task-manager
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Add your Firebase configuration to .env:
```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

4. Start development server:
```bash
npm run dev
```

5. Optional: Seed database with sample data:
```bash
npm run seed
```

## Project Structure

```
task-manager/
├── public/              # Static assets
├── src/
│   ├── assets/         # Images and other assets
│   ├── components/     # React components
│   │   ├── auth/      # Authentication components
│   │   ├── common/    # Shared components
│   │   ├── dashboard/ # Dashboard views
│   │   ├── layout/    # Layout components
│   │   ├── settings/  # User settings
│   │   ├── tasks/     # Task management
│   │   └── teams/     # Team management
│   ├── config/        # Configuration files
│   ├── constants/     # Constants and enums
│   ├── context/       # React contexts
│   ├── hooks/         # Custom React hooks
│   ├── scripts/       # Utility scripts
│   ├── theme/         # Chakra UI theme
│   ├── types/         # TypeScript types
│   └── utils/         # Utility functions
├── .env.example       # Example environment variables
├── firestore.rules    # Firestore security rules
├── storage.rules      # Storage security rules
└── vite.config.ts     # Vite configuration
```

## Database Structure

### Collections

1. users
```typescript
{
  id: string;              // Auth UID
  email: string;           // User email
  displayName: string;     // User's name
  photoURL: string;        // Profile picture URL
  createdAt: timestamp;    // Account creation date
  lastLoginAt: timestamp;  // Last login date
}
```

2. teams
```typescript
{
  id: string;              // Team ID
  name: string;            // Team name
  description: string;     // Team description
  createdBy: string;       // Creator's UID
  createdAt: timestamp;    // Creation date
  members: [               // Team members
    {
      id: string;         // User UID
      email: string;      // User email
      displayName: string;// User name
      role: string;      // admin/member
      joinedAt: timestamp;// Join date
    }
  ],
  memberEmails: string[]; // Array of member emails for querying
  invitedEmails: string[];// Pending invitations
}
```

3. tasks
```typescript
{
  id: string;              // Task ID
  title: string;           // Task title
  description: string;     // Task description
  category: string;        // work/personal/shopping/others
  priority: string;        // low/medium/high
  completed: boolean;      // Task status
  userId: string;          // Creator's UID
  teamId: string;         // Associated team
  assignedTo: string[];   // Assigned user UIDs
  dueDate: timestamp;     // Due date
  createdAt: timestamp;   // Creation date
  updatedAt: timestamp;   // Last update date
}
```

## Security Rules

The application implements strict security rules to ensure data privacy and access control:

- Authentication required for all operations
- Users can only read/write their own data
- Team members can only access their team's data
- Team admins have elevated permissions for team management

Deploy updated security rules:
```bash
firebase deploy --only firestore:rules
```

## Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy to Firebase Hosting:
```bash
npm run deploy
```

## Development Workflow

1. Create a new branch for your feature:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and commit:
```bash
git add .
git commit -m "feat: add your feature"
```

3. Push changes and create a pull request:
```bash
git push origin feature/your-feature-name
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
