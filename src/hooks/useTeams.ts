import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  arrayUnion,
  serverTimestamp,
  writeBatch,
  getFirestore,
} from 'firebase/firestore';
import { getFirebaseDb, collections } from '../config/firebase';
import { Team } from '../types/models';
import { useAuth } from '../context/AuthContext';

export const useTeams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const db = getFirebaseDb();

  const fetchTeams = async () => {
    if (!user?.email) return;
    try {
      setLoading(true);
      setError(null);
      
      const teamsQuery = query(
        collection(db, collections.teams),
        where('memberEmails', 'array-contains', user.email)
      );
      
      const snapshot = await getDocs(teamsQuery);
      const teamsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Team));
      
      setTeams(teamsData);
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async (name: string, description?: string) => {
    if (!user?.email) throw new Error('User must be authenticated');
    
    const currentTime = new Date().toISOString();
    const newTeam = {
      name,
      description,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      members: [{
        id: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: 'admin',
        photoURL: user.photoURL,
        joinedAt: currentTime,
      }],
      memberEmails: [user.email],
      invitedEmails: []
    };

    try {
      await addDoc(collection(db, collections.teams), newTeam);
      await fetchTeams();
    } catch (err) {
      console.error('Error creating team:', err);
      throw new Error(
        err instanceof Error ? err.message : 'Failed to create team'
      );
    }
  };

  const inviteTeamMember = async (teamId: string, email: string) => {
    if (!user?.email) throw new Error('User must be authenticated');
    
    const teamRef = doc(db, collections.teams, teamId);
    const team = teams.find(t => t.id === teamId);
    
    if (!team) throw new Error('Team not found');
    if (team.members.some(m => m.email === email)) {
      throw new Error('User is already a team member');
    }
    if (team.invitedEmails.includes(email)) {
      throw new Error('User has already been invited');
    }

    try {
      await updateDoc(teamRef, {
        invitedEmails: arrayUnion(email),
        updatedAt: serverTimestamp()
      });
      
      await fetchTeams();
    } catch (err) {
      console.error('Error inviting team member:', err);
      throw new Error(
        err instanceof Error ? err.message : 'Failed to invite team member'
      );
    }
  };

  const inviteTeamMembers = async (teamId: string, emails: string[]) => {
    if (!user?.email) throw new Error('User must be authenticated');
    
    const teamRef = doc(db, collections.teams, teamId);
    const team = teams.find(t => t.id === teamId);
    
    if (!team) throw new Error('Team not found');

    const validEmails = emails.filter(email => 
      !team.members.some(m => m.email === email) && 
      !team.invitedEmails.includes(email)
    );

    if (validEmails.length === 0) {
      throw new Error('All emails are either members or already invited');
    }

    try {
      await updateDoc(teamRef, {
        invitedEmails: arrayUnion(...validEmails),
        updatedAt: serverTimestamp()
      });
      
      await fetchTeams();
    } catch (err) {
      console.error('Error inviting team members:', err);
      throw new Error(
        err instanceof Error ? err.message : 'Failed to invite team members'
      );
    }
  };

  const updateTeam = async (teamId: string, data: { name: string; description?: string }) => {
    if (!user?.email) throw new Error('User must be authenticated');
    
    const teamRef = doc(db, collections.teams, teamId);
    const team = teams.find(t => t.id === teamId);
    
    if (!team) throw new Error('Team not found');
    if (!team.members.some(m => m.id === user.uid && m.role === 'admin')) {
      throw new Error('Only team admins can update teams');
    }

    try {
      // Keep serverTimestamp for top-level fields only
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      };

      await updateDoc(teamRef, updateData);
      await fetchTeams();
    } catch (err) {
      console.error('Error updating team:', err);
      throw new Error(
        err instanceof Error ? err.message : 'Failed to update team'
      );
    }
  };

  const deleteTeam = async (teamId: string) => {
    if (!user?.email) throw new Error('User must be authenticated');
    
    const teamRef = doc(db, collections.teams, teamId);
    const team = teams.find(t => t.id === teamId);
    
    if (!team) throw new Error('Team not found');
    if (!team.members.some(m => m.id === user.uid && m.role === 'admin')) {
      throw new Error('Only team admins can delete teams');
    }

    try {
      await deleteDoc(teamRef);
      await fetchTeams();
    } catch (err) {
      console.error('Error deleting team:', err);
      throw new Error(
        err instanceof Error ? err.message : 'Failed to delete team'
      );
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchTeams();
    }
  }, [user]);

  return {
    teams,
    loading,
    error,
    createTeam,
    inviteTeamMember,
    inviteTeamMembers,
    deleteTeam,
    updateTeam,
    refreshTeams: fetchTeams
  };
};