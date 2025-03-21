export interface TeamMember {
  id: string;
  email: string;
  displayName: string | null;
  role: 'admin' | 'member';
  photoURL?: string;
  joinedAt: Date;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  members: TeamMember[];
  invitedEmails: string[];
}