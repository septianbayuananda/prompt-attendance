import { v4 as uuidv4 } from 'uuid';

export interface IAttendanceSession {
  id: string;
  token: string;
  date: string;
  createdBy: string;
  createdByName: string;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
}

export class AttendanceSession implements IAttendanceSession {
  id: string;
  token: string;
  date: string;
  createdBy: string;
  createdByName: string;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;

  constructor(data: Partial<IAttendanceSession> & { createdBy: string; createdByName: string }) {
    this.id = data.id || uuidv4();
    this.token = data.token || this.generateToken();
    this.date = data.date || new Date().toISOString().split('T')[0];
    this.createdBy = data.createdBy;
    this.createdByName = data.createdByName;
    this.expiresAt = data.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000);
    this.isActive = data.isActive ?? true;
    this.createdAt = data.createdAt || new Date();
  }

  private generateToken(): string {
    return `${uuidv4()}-${Date.now()}`;
  }

  static fromJSON(json: IAttendanceSession): AttendanceSession {
    return new AttendanceSession({
      ...json,
      expiresAt: new Date(json.expiresAt),
      createdAt: new Date(json.createdAt),
    });
  }

  toJSON(): IAttendanceSession {
    return {
      id: this.id,
      token: this.token,
      date: this.date,
      createdBy: this.createdBy,
      createdByName: this.createdByName,
      expiresAt: this.expiresAt,
      isActive: this.isActive,
      createdAt: this.createdAt,
    };
  }

  generateQRData(): string {
    return JSON.stringify({
      type: 'attendance_session',
      sessionId: this.id,
      token: this.token,
      date: this.date,
      expiresAt: this.expiresAt.toISOString(),
    });
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt || !this.isActive;
  }

  regenerateToken(): void {
    this.token = this.generateToken();
    this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    this.isActive = true;
  }
}
