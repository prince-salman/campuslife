export type UserRole = 'admin' | 'class_manager' | 'user';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  managedClass?: string;
  createdAt?: string;
}

export const DEMO_ADMIN: UserProfile = {
  id: '4bbbdeea-08ca-478a-8b06-e028a7227aaf',
  email: 'admin@campuslife.com',
  fullName: 'Administrator CampusLife',
  role: 'admin',
};

export const DEMO_CLASS_MANAGER: UserProfile = {
  id: 'cm_it1_salman_101',
  email: 'classmanager.it1@student.president.ac.id',
  fullName: 'Muhammad Salman (Class Manager IT 1)',
  role: 'class_manager',
  managedClass: 'IT 1',
};

export const DEMO_STUDENT: UserProfile = {
  id: '3b52c06a-1539-4c17-8df3-f534d6651909',
  email: 'mahasiswa@student.president.ac.id',
  fullName: 'Derrian Kalalo',
  role: 'user',
  managedClass: 'IT 1',
};
