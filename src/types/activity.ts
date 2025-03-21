import { Task } from './models';
import { Team } from './models';

export interface ActivityItem {
  type: 'task' | 'team';
  item: Task | Team;
  date: Date;
}

export const createTaskActivity = (task: Task): ActivityItem => ({
  type: 'task',
  item: task,
  date: new Date(task.createdAt),
});

export const createTeamActivity = (team: Team): ActivityItem => ({
  type: 'team',
  item: team,
  date: new Date(team.createdAt),
});