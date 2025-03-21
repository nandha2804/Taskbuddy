# Task Manager

A modern task management application built with React, TypeScript, and Firebase.

## Firebase Setup

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

5. Get Firebase Configuration:
   - Go to Project Settings
   - Scroll down to "Your apps"
   - Click web icon (</>)
   - Register app and get configuration

6. Environment Setup:
   Create a .env file with your Firebase config:
   ```
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

## Database Structure

### Collections:

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

## Development Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd task-manager
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your Firebase config
```

4. Start development server:
```bash
npm run dev
```

5. Optional: Seed database with sample data:
```bash
npm run seed
```

## Firebase Security Rules

The application uses Firestore security rules to ensure:
- Only authenticated users can access data
- Users can only access their own data
- Team members can only access their team's data
- Team admins have elevated permissions

Deploy updated security rules:
```bash
firebase deploy --only firestore:rules
```

## Database Operations

### Create Team:
```typescript
const createTeam = async (name: string, description?: string) => {
  const teamData = {
    name,
    description,
    createdBy: currentUser.uid,
    members: [{
      id: currentUser.uid,
      role: 'admin'
    }],
    memberEmails: [currentUser.email],
    createdAt: new Date()
  };
  
  await addDoc(collection(db, 'teams'), teamData);
};
```

### Query Teams:
```typescript
const getTeams = async (userEmail: string) => {
  const q = query(
    collection(db, 'teams'),
    where('memberEmails', 'array-contains', userEmail)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};
```

### Update Team:
```typescript
const updateTeam = async (teamId: string, data: Partial<Team>) => {
  const teamRef = doc(db, 'teams', teamId);
  await updateDoc(teamRef, data);
};
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
