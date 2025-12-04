import { v4 as uuidv4 } from 'uuid';

export interface IStudent {
  id: string;
  nis: string;
  userId: string;
  name: string;
  kelas: string;
  photo?: string;
  parentPhone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Student implements IStudent {
  id: string;
  nis: string;
  userId: string;
  name: string;
  kelas: string;
  photo?: string;
  parentPhone?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<IStudent> & { nis: string; userId: string; name: string; kelas: string }) {
    this.id = data.id || uuidv4();
    this.nis = data.nis;
    this.userId = data.userId;
    this.name = data.name;
    this.kelas = data.kelas;
    this.photo = data.photo;
    this.parentPhone = data.parentPhone;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static fromJSON(json: IStudent): Student {
    return new Student({
      ...json,
      createdAt: new Date(json.createdAt),
      updatedAt: new Date(json.updatedAt),
    });
  }

  toJSON(): IStudent {
    return {
      id: this.id,
      nis: this.nis,
      userId: this.userId,
      name: this.name,
      kelas: this.kelas,
      photo: this.photo,
      parentPhone: this.parentPhone,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  generateQRData(): string {
    return JSON.stringify({
      type: 'student_login',
      studentId: this.id,
      nis: this.nis,
      timestamp: Date.now(),
    });
  }
}
