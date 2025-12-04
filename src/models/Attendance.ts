import { v4 as uuidv4 } from 'uuid';

export type AttendanceStatus = 'hadir' | 'izin' | 'sakit' | 'alpha';

export interface IAttendance {
  id: string;
  studentId: string;
  studentName: string;
  kelas: string;
  date: string;
  time: string;
  status: AttendanceStatus;
  sessionId: string;
  note?: string;
  proofUrl?: string;
  createdAt: Date;
}

export class Attendance implements IAttendance {
  id: string;
  studentId: string;
  studentName: string;
  kelas: string;
  date: string;
  time: string;
  status: AttendanceStatus;
  sessionId: string;
  note?: string;
  proofUrl?: string;
  createdAt: Date;

  constructor(data: Partial<IAttendance> & { studentId: string; studentName: string; kelas: string; sessionId: string }) {
    this.id = data.id || uuidv4();
    this.studentId = data.studentId;
    this.studentName = data.studentName;
    this.kelas = data.kelas;
    this.date = data.date || new Date().toISOString().split('T')[0];
    this.time = data.time || new Date().toLocaleTimeString('id-ID');
    this.status = data.status || 'hadir';
    this.sessionId = data.sessionId;
    this.note = data.note;
    this.proofUrl = data.proofUrl;
    this.createdAt = data.createdAt || new Date();
  }

  static fromJSON(json: IAttendance): Attendance {
    return new Attendance({
      ...json,
      createdAt: new Date(json.createdAt),
    });
  }

  toJSON(): IAttendance {
    return {
      id: this.id,
      studentId: this.studentId,
      studentName: this.studentName,
      kelas: this.kelas,
      date: this.date,
      time: this.time,
      status: this.status,
      sessionId: this.sessionId,
      note: this.note,
      proofUrl: this.proofUrl,
      createdAt: this.createdAt,
    };
  }

  isLate(lateThreshold: string = '07:30'): boolean {
    return this.time > lateThreshold;
  }
}
