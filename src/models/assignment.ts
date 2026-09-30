export type TaskPriority = 'high' | 'medium' | 'normal';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface AssignmentTask {
  id: string;
  className: string; // contoh: "IT 1", "IT 2", "IS 1"
  courseName: string; // contoh: "Algorithms & Data Structures"
  title: string; // contoh: "Tugas 1: Binary Search Tree Implementation"
  description: string; // petunjuk tugas
  deadlineDate: string; // format YYYY-MM-DD
  deadlineTime: string; // format HH:mm WIB
  priority: TaskPriority;
  status: TaskStatus;
  submissionLink?: string;
  createdBy: string;
  createdAt: string;
}
