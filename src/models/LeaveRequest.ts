import { v4 as uuidv4 } from 'uuid';

export type LeaveType = 'sakit' | 'izin' | 'keluarga';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface ILeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  kelas: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  proofUrl?: string;
  status: LeaveStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
}

export class LeaveRequest implements ILeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  kelas: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  proofUrl?: string;
  status: LeaveStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;

  constructor(data: Partial<ILeaveRequest> & { 
    studentId: string; 
    studentName: string; 
    kelas: string;
    type: LeaveType;
    startDate: string;
    endDate: string;
    reason: string;
  }) {
    this.id = data.id || uuidv4();
    this.studentId = data.studentId;
    this.studentName = data.studentName;
    this.kelas = data.kelas;
    this.type = data.type;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.reason = data.reason;
    this.proofUrl = data.proofUrl;
    this.status = data.status || 'pending';
    this.reviewedBy = data.reviewedBy;
    this.reviewedAt = data.reviewedAt;
    this.createdAt = data.createdAt || new Date();
  }

  static fromJSON(json: ILeaveRequest): LeaveRequest {
    return new LeaveRequest({
      ...json,
      createdAt: new Date(json.createdAt),
      reviewedAt: json.reviewedAt ? new Date(json.reviewedAt) : undefined,
    });
  }

  toJSON(): ILeaveRequest {
    return {
      id: this.id,
      studentId: this.studentId,
      studentName: this.studentName,
      kelas: this.kelas,
      type: this.type,
      startDate: this.startDate,
      endDate: this.endDate,
      reason: this.reason,
      proofUrl: this.proofUrl,
      status: this.status,
      reviewedBy: this.reviewedBy,
      reviewedAt: this.reviewedAt,
      createdAt: this.createdAt,
    };
  }

  getDuration(): number {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }
}
