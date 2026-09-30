export type TaskPriority = 'high' | 'medium' | 'normal';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface AssignmentTask {
  id: string;
  className: string;
  courseName: string;
  title: string;
  description: string;
  deadlineDate: string;
  deadlineTime: string;
  priority: TaskPriority;
  status: TaskStatus;
  submissionLink?: string;
  createdBy: string;
  createdAt: string;
}
