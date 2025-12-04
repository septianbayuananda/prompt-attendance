import { v4 as uuidv4 } from 'uuid';

export type UserRole = 'admin' | 'guru' | 'siswa';

export interface IUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

export class User implements IUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  createdAt: Date;

  constructor(data: Partial<IUser> & { email: string; password: string; name: string; role: UserRole }) {
    this.id = data.id || uuidv4();
    this.email = data.email;
    this.password = data.password;
    this.name = data.name;
    this.role = data.role;
    this.createdAt = data.createdAt || new Date();
  }

  static fromJSON(json: IUser): User {
    return new User({
      ...json,
      createdAt: new Date(json.createdAt),
    });
  }

  toJSON(): IUser {
    return {
      id: this.id,
      email: this.email,
      password: this.password,
      name: this.name,
      role: this.role,
      createdAt: this.createdAt,
    };
  }

  hasPermission(action: string): boolean {
    const permissions: Record<UserRole, string[]> = {
      admin: ['manage_students', 'generate_qr', 'view_attendance', 'scan_qr', 'manage_users', 'export_data'],
      guru: ['scan_qr', 'view_attendance', 'generate_qr'],
      siswa: ['view_own_attendance', 'submit_leave', 'view_profile'],
    };
    return permissions[this.role]?.includes(action) || false;
  }
}
