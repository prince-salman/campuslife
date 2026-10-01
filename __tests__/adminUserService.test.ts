import { adminUserService } from '../src/services/adminUserService';
import { UserProfile } from '../src/models/user';

describe('AdminUserService Unit Tests', () => {
  test('should return default initial users', () => {
    const users = adminUserService.getUsers();
    expect(users.length).toBeGreaterThanOrEqual(3);
    expect(users.some((u) => u.role === 'admin')).toBe(true);
  });

  test('should record new registered user and notify listeners immediately', async () => {
    const listener = jest.fn();
    const unsub = adminUserService.subscribe(listener);

    const newUser: UserProfile = {
      id: 'student_new_register_999',
      email: 'budi.santoso@student.president.ac.id',
      fullName: 'Budi Santoso',
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    await adminUserService.recordNewUser(newUser);

    expect(listener).toHaveBeenCalled();
    const currentUsers = adminUserService.getUsers();
    const found = currentUsers.find((u) => u.email === newUser.email);
    expect(found).toBeDefined();
    expect(found?.fullName).toBe('Budi Santoso');
    expect(found?.role).toBe('user');

    unsub();
  });

  test('should update existing user when recording with same email', async () => {
    const updatedUser: UserProfile = {
      id: 'student_new_register_999',
      email: 'budi.santoso@student.president.ac.id',
      fullName: 'Budi Santoso S.Kom',
      role: 'class_manager',
      managedClass: 'IT 1',
    };

    await adminUserService.recordNewUser(updatedUser);

    const currentUsers = adminUserService.getUsers();
    const matched = currentUsers.filter((u) => u.email === updatedUser.email);
    expect(matched).toHaveLength(1);
    expect(matched[0].fullName).toBe('Budi Santoso S.Kom');
    expect(matched[0].role).toBe('class_manager');
  });
});
