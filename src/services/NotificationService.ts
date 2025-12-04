import { studentService } from './StudentService';
import { storageService } from './StorageService';

interface Notification {
  id: string;
  type: 'absence' | 'leave' | 'general';
  title: string;
  message: string;
  recipientPhone?: string;
  recipientId: string;
  sentAt: Date;
  read: boolean;
}

class NotificationService {
  private getNotifications(): Notification[] {
    return storageService.get<Notification[]>('notifications') || [];
  }

  private saveNotifications(notifications: Notification[]): void {
    storageService.set('notifications', notifications);
  }

  async notifyAbsence(studentId: string, date: string): Promise<void> {
    const student = studentService.getById(studentId);
    if (!student || !student.parentPhone) return;

    const notification: Notification = {
      id: crypto.randomUUID(),
      type: 'absence',
      title: 'Pemberitahuan Ketidakhadiran',
      message: `Anak Anda, ${student.name} (${student.kelas}), tidak hadir pada ${date}. Mohon konfirmasi atau ajukan izin.`,
      recipientPhone: student.parentPhone,
      recipientId: studentId,
      sentAt: new Date(),
      read: false,
    };

    const notifications = this.getNotifications();
    notifications.push(notification);
    this.saveNotifications(notifications);

    // In a real app, this would send SMS/WhatsApp via an API
    console.log(`[Notification] Sent to ${student.parentPhone}: ${notification.message}`);
  }

  async notifyLeaveApproval(studentId: string, status: 'approved' | 'rejected'): Promise<void> {
    const student = studentService.getById(studentId);
    if (!student) return;

    const notification: Notification = {
      id: crypto.randomUUID(),
      type: 'leave',
      title: status === 'approved' ? 'Izin Disetujui' : 'Izin Ditolak',
      message: `Pengajuan izin untuk ${student.name} telah ${status === 'approved' ? 'disetujui' : 'ditolak'}.`,
      recipientPhone: student.parentPhone,
      recipientId: studentId,
      sentAt: new Date(),
      read: false,
    };

    const notifications = this.getNotifications();
    notifications.push(notification);
    this.saveNotifications(notifications);

    console.log(`[Notification] Leave ${status} for ${student.name}`);
  }

  getByRecipient(recipientId: string): Notification[] {
    return this.getNotifications()
      .filter(n => n.recipientId === recipientId)
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }

  getUnreadCount(recipientId: string): number {
    return this.getNotifications()
      .filter(n => n.recipientId === recipientId && !n.read)
      .length;
  }

  markAsRead(notificationId: string): void {
    const notifications = this.getNotifications();
    const index = notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      notifications[index].read = true;
      this.saveNotifications(notifications);
    }
  }
}

export const notificationService = new NotificationService();
