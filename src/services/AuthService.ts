import { User, IUser, UserRole } from '@/models/User';
import { Student, IStudent } from '@/models/Student';
import { storageService } from './StorageService';

class AuthService {
  private currentUser: User | null = null;
  private currentStudent: Student | null = null;

  constructor() {
    this.loadFromStorage();
    this.initializeDemoData();
  }

  private loadFromStorage(): void {
    const userData = storageService.get<IUser>('current_user');
    if (userData) {
      this.currentUser = User.fromJSON(userData);
    }
    
    const studentData = storageService.get<IStudent>('current_student');
    if (studentData) {
      this.currentStudent = Student.fromJSON(studentData);
    }
  }

  private initializeDemoData(): void {
    const users = storageService.get<IUser[]>('users');
    if (!users || users.length === 0) {
      const demoUsers: IUser[] = [
        new User({ email: 'admin@sekolah.id', password: 'admin123', name: 'Administrator', role: 'admin' }).toJSON(),
        new User({ email: 'guru@sekolah.id', password: 'guru123', name: 'Budi Santoso', role: 'guru' }).toJSON(),
      ];
      storageService.set('users', demoUsers);
    }

    const students = storageService.get<IStudent[]>('students');
    if (!students || students.length === 0) {
      const demoStudents: IStudent[] = [
        new Student({ nis: '2024001', userId: '', name: 'Ahmad Rizki', kelas: 'XII IPA 1', parentPhone: '081234567890' }).toJSON(),
        new Student({ nis: '2024002', userId: '', name: 'Siti Nurhaliza', kelas: 'XII IPA 1', parentPhone: '081234567891' }).toJSON(),
        new Student({ nis: '2024003', userId: '', name: 'Muhammad Farhan', kelas: 'XII IPA 2', parentPhone: '081234567892' }).toJSON(),
        new Student({ nis: '2024004', userId: '', name: 'Dewi Anggraini', kelas: 'XII IPS 1', parentPhone: '081234567893' }).toJSON(),
        new Student({ nis: '2024005', userId: '', name: 'Reza Pratama', kelas: 'XII IPS 1', parentPhone: '081234567894' }).toJSON(),
      ];
      storageService.set('students', demoStudents);
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    const users = storageService.get<IUser[]>('users') || [];
    const userData = users.find(u => u.email === email && u.password === password);
    
    if (!userData) {
      return { success: false, message: 'Email atau password salah' };
    }

    this.currentUser = User.fromJSON(userData);
    storageService.set('current_user', userData);

    if (this.currentUser.role === 'siswa') {
      const students = storageService.get<IStudent[]>('students') || [];
      const studentData = students.find(s => s.userId === this.currentUser!.id);
      if (studentData) {
        this.currentStudent = Student.fromJSON(studentData);
        storageService.set('current_student', studentData);
      }
    }

    return { success: true, message: 'Login berhasil', user: this.currentUser };
  }

  async register(data: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    nis?: string;
    kelas?: string;
    parentPhone?: string;
  }): Promise<{ success: boolean; message: string }> {
    const users = storageService.get<IUser[]>('users') || [];
    
    if (users.some(u => u.email === data.email)) {
      return { success: false, message: 'Email sudah terdaftar' };
    }

    if (data.role === 'siswa' && data.nis) {
      const students = storageService.get<IStudent[]>('students') || [];
      if (students.some(s => s.nis === data.nis)) {
        return { success: false, message: 'NIS sudah terdaftar' };
      }
    }

    const newUser = new User({
      email: data.email,
      password: data.password,
      name: data.name,
      role: data.role,
    });

    users.push(newUser.toJSON());
    storageService.set('users', users);

    if (data.role === 'siswa' && data.nis && data.kelas) {
      const students = storageService.get<IStudent[]>('students') || [];
      const newStudent = new Student({
        nis: data.nis,
        userId: newUser.id,
        name: data.name,
        kelas: data.kelas,
        parentPhone: data.parentPhone,
      });
      students.push(newStudent.toJSON());
      storageService.set('students', students);
    }

    return { success: true, message: 'Registrasi berhasil' };
  }

  logout(): void {
    this.currentUser = null;
    this.currentStudent = null;
    storageService.remove('current_user');
    storageService.remove('current_student');
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getCurrentStudent(): Student | null {
    return this.currentStudent;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  hasRole(role: UserRole): boolean {
    return this.currentUser?.role === role;
  }

  hasPermission(action: string): boolean {
    return this.currentUser?.hasPermission(action) || false;
  }
}

export const authService = new AuthService();
