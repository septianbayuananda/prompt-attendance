import { LeaveRequest, ILeaveRequest, LeaveType, LeaveStatus } from '@/models/LeaveRequest';
import { storageService } from './StorageService';

class LeaveService {
  private getLeaveRequests(): ILeaveRequest[] {
    return storageService.get<ILeaveRequest[]>('leave_requests') || [];
  }

  private saveLeaveRequests(requests: ILeaveRequest[]): void {
    storageService.set('leave_requests', requests, storageService.isOnline() ? 'synced' : 'pending');
  }

  create(data: {
    studentId: string;
    studentName: string;
    kelas: string;
    type: LeaveType;
    startDate: string;
    endDate: string;
    reason: string;
    proofUrl?: string;
  }): LeaveRequest {
    const requests = this.getLeaveRequests();
    const newRequest = new LeaveRequest(data);
    requests.push(newRequest.toJSON());
    this.saveLeaveRequests(requests);
    return newRequest;
  }

  getById(id: string): LeaveRequest | null {
    const requests = this.getLeaveRequests();
    const data = requests.find(r => r.id === id);
    return data ? LeaveRequest.fromJSON(data) : null;
  }

  getByStudent(studentId: string): LeaveRequest[] {
    return this.getLeaveRequests()
      .filter(r => r.studentId === studentId)
      .map(r => LeaveRequest.fromJSON(r))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getByStatus(status: LeaveStatus): LeaveRequest[] {
    return this.getLeaveRequests()
      .filter(r => r.status === status)
      .map(r => LeaveRequest.fromJSON(r))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getPending(): LeaveRequest[] {
    return this.getByStatus('pending');
  }

  approve(id: string, reviewedBy: string): boolean {
    return this.updateStatus(id, 'approved', reviewedBy);
  }

  reject(id: string, reviewedBy: string): boolean {
    return this.updateStatus(id, 'rejected', reviewedBy);
  }

  private updateStatus(id: string, status: LeaveStatus, reviewedBy: string): boolean {
    const requests = this.getLeaveRequests();
    const index = requests.findIndex(r => r.id === id);
    
    if (index === -1) return false;

    requests[index] = {
      ...requests[index],
      status,
      reviewedBy,
      reviewedAt: new Date().toISOString() as unknown as Date,
    };
    this.saveLeaveRequests(requests);
    return true;
  }

  getStats(): { pending: number; approved: number; rejected: number } {
    const requests = this.getLeaveRequests();
    return {
      pending: requests.filter(r => r.status === 'pending').length,
      approved: requests.filter(r => r.status === 'approved').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
    };
  }
}

export const leaveService = new LeaveService();
