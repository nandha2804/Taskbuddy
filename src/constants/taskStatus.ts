import { 
  FiCheckCircle, 
  FiClock, 
  FiPlayCircle,
} from 'react-icons/fi';
import { IconType } from 'react-icons';

export interface TaskStatusConfig {
  id: string;
  title: string;
  icon: IconType;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const taskStatusColumns: TaskStatusConfig[] = [
  {
    id: 'active',
    title: 'To Do',
    icon: FiClock,
    color: 'blue.500',
    bgColor: 'blue.50',
    borderColor: 'blue.200',
  },
  {
    id: 'inProgress',
    title: 'In Progress',
    icon: FiPlayCircle,
    color: 'orange.500',
    bgColor: 'orange.50',
    borderColor: 'orange.200',
  },
  {
    id: 'completed',
    title: 'Completed',
    icon: FiCheckCircle,
    color: 'green.500',
    bgColor: 'green.50',
    borderColor: 'green.200',
  },
];