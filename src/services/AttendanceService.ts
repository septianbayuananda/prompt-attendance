import { Attendance, IAttendance, AttendanceStatus } from '@/models/Attendance';
import { AttendanceSession, IAttendanceSession } from '@/models/AttendanceSession';
import { storageService } from './StorageService';
import { studentService } from './StudentService';

class AttendanceService {
  private getAttendances(): IAttendance[] {
    return storageService.get<IAttendance[]>('attendances') || [];
  }

  private saveAttendances(attendances: IAttendance[]): void {
    storageService.set('attendances', attendances, storageService.isOnline() ? 'synced' : 'pending');
  }

  private getSessions(): IAttendanceSession[] {
    return storageService.get<IAttendanceSession[]>('attendance_sessions') || [];
  }

  private saveSessions(sessions: IAttendanceSession[]): void {
    storageService.set('attendance_sessions', sessions);
  }

  // Session Management
  createSession(createdBy: string, createdByName: string): AttendanceSession {
    const sessions = this.getSessions();
    const newSession = new AttendanceSession({ createdBy, createdByName });
    sessions.push(newSession.toJSON());
    this.saveSessions(sessions);
    return newSession;
  }

  getActiveSession(): AttendanceSession | null {
    const sessions = this.getSessions();
    const today = new Date().toISOString().split('T')[0];
    const activeData = sessions.find(s => s.date === today && s.isActive && new Date(s.expiresAt) > new Date());
    return activeData ? AttendanceSession.fromJSON(activeData) : null;
  }

  getSessionById(id: string): AttendanceSession | null {
    const sessions = this.getSessions();
    const data = sessions.find(s => s.id === id);
    return data ? AttendanceSession.fromJSON(data) : null;
  }

  regenerateSession(sessionId: string): AttendanceSession | null {
    const sessions = this.getSessions();
    const index = sessions.findIndex(s => s.id === sessionId);
    
    if (index === -1) return null;

    const session = AttendanceSession.fromJSON(sessions[index]);
    session.regenerateToken();
    sessions[index] = session.toJSON();
    this.saveSessions(sessions);
    
    return session;
  }

  deactivateSession(sessionId: string): void {
    const sessions = this.getSessions();
    const index = sessions.findIndex(s => s.id === sessionId);
    if (index !== -1) {
      sessions[index].isActive = false;
      this.saveSessions(sessions);
    }
  }

  // Attendance Management
  recordAttendance(studentId: string, sessionId: string, status: AttendanceStatus = 'hadir'): { success: boolean; message: string; attendance?: Attendance } {
    const student = studentService.getById(studentId);
    if (!student) {
      return { success: false, message: 'Siswa tidak ditemukan' };
    }

    const session = this.getSessionById(sessionId);
    if (!session) {
      return { success: false, message: 'Sesi absensi tidak ditemukan' };
    }

    if (session.isExpired()) {
      return { success: false, message: 'Sesi absensi sudah kadaluarsa' };
    }

    const attendances = this.getAttendances();
    const today = new Date().toISOString().split('T')[0];
    
    const existing = attendances.find(a => a.studentId === studentId && a.date === today);
    if (existing) {
      return { success: false, message: 'Siswa sudah diabsen hari ini' };
    }

    const newAttendance = new Attendance({
      studentId,
      studentName: student.name,
      kelas: student.kelas,
      sessionId,
      status,
    });

    attendances.push(newAttendance.toJSON());
    this.saveAttendances(attendances);

    return { success: true, message: 'Absensi berhasil dicatat', attendance: newAttendance };
  }

  updateAttendanceStatus(attendanceId: string, status: AttendanceStatus, note?: string): boolean {
    const attendances = this.getAttendances();
    const index = attendances.findIndex(a => a.id === attendanceId);
    
    if (index === -1) return false;

    attendances[index] = {
      ...attendances[index],
      status,
      note: note || attendances[index].note,
    };
    this.saveAttendances(attendances);
    return true;
  }

  getByDate(date: string): Attendance[] {
    return this.getAttendances()
      .filter(a => a.date === date)
      .map(a => Attendance.fromJSON(a));
  }

  getByStudent(studentId: string): Attendance[] {
    return this.getAttendances()
      .filter(a => a.studentId === studentId)
      .map(a => Attendance.fromJSON(a))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  getByKelas(kelas: string, date?: string): Attendance[] {
    let attendances = this.getAttendances().filter(a => a.kelas === kelas);
    if (date) {
      attendances = attendances.filter(a => a.date === date);
    }
    return attendances.map(a => Attendance.fromJSON(a));
  }

  getByDateRange(startDate: string, endDate: string): Attendance[] {
    return this.getAttendances()
      .filter(a => a.date >= startDate && a.date <= endDate)
      .map(a => Attendance.fromJSON(a));
  }

  getTodayStats(): { hadir: number; izin: number; sakit: number; alpha: number; total: number } {
    const today = new Date().toISOString().split('T')[0];
    const todayAttendances = this.getByDate(today);
    const students = studentService.getAll();

    const stats = {
      hadir: todayAttendances.filter(a => a.status === 'hadir').length,
      izin: todayAttendances.filter(a => a.status === 'izin').length,
      sakit: todayAttendances.filter(a => a.status === 'sakit').length,
      alpha: 0,
      total: students.length,
    };

    stats.alpha = students.length - todayAttendances.length;
    return stats;
  }

  getMonthlyStats(month: number, year: number): { date: string; hadir: number; izin: number; sakit: number; alpha: number }[] {
    const daysInMonth = new Date(year, month, 0).getDate();
    const stats: { date: string; hadir: number; izin: number; sakit: number; alpha: number }[] = [];
    const students = studentService.getAll();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayAttendances = this.getByDate(date);
      
      stats.push({
        date,
        hadir: dayAttendances.filter(a => a.status === 'hadir').length,
        izin: dayAttendances.filter(a => a.status === 'izin').length,
        sakit: dayAttendances.filter(a => a.status === 'sakit').length,
        alpha: students.length - dayAttendances.length,
      });
    }

    return stats;
  }

  getStudentAttendanceRate(studentId: string, startDate?: string, endDate?: string): number {
    let attendances = this.getByStudent(studentId);
    
    if (startDate && endDate) {
      attendances = attendances.filter(a => a.date >= startDate && a.date <= endDate);
    }

    if (attendances.length === 0) return 0;

    const hadirCount = attendances.filter(a => a.status === 'hadir').length;
    return Math.round((hadirCount / attendances.length) * 100);
  }
}

export const attendanceService = new AttendanceService();
