import { Student, IStudent } from '@/models/Student';
import { storageService } from './StorageService';

class StudentService {
  private getStudents(): IStudent[] {
    return storageService.get<IStudent[]>('students') || [];
  }

  private saveStudents(students: IStudent[]): void {
    storageService.set('students', students, storageService.isOnline() ? 'synced' : 'pending');
  }

  getAll(): Student[] {
    return this.getStudents().map(s => Student.fromJSON(s));
  }

  getById(id: string): Student | null {
    const students = this.getStudents();
    const data = students.find(s => s.id === id);
    return data ? Student.fromJSON(data) : null;
  }

  getByNis(nis: string): Student | null {
    const students = this.getStudents();
    const data = students.find(s => s.nis === nis);
    return data ? Student.fromJSON(data) : null;
  }

  getByKelas(kelas: string): Student[] {
    return this.getStudents()
      .filter(s => s.kelas === kelas)
      .map(s => Student.fromJSON(s));
  }

  getKelasOptions(): string[] {
    const students = this.getStudents();
    return [...new Set(students.map(s => s.kelas))].sort();
  }

  create(data: { nis: string; name: string; kelas: string; parentPhone?: string; userId?: string }): Student {
    const students = this.getStudents();
    const newStudent = new Student({
      nis: data.nis,
      userId: data.userId || '',
      name: data.name,
      kelas: data.kelas,
      parentPhone: data.parentPhone,
    });
    students.push(newStudent.toJSON());
    this.saveStudents(students);
    return newStudent;
  }

  update(id: string, data: Partial<{ nis: string; name: string; kelas: string; parentPhone?: string; photo?: string }>): Student | null {
    const students = this.getStudents();
    const index = students.findIndex(s => s.id === id);
    
    if (index === -1) return null;

    const updated: IStudent = {
      ...students[index],
      ...data,
      updatedAt: new Date(),
    };
    students[index] = updated;
    this.saveStudents(students);
    
    return Student.fromJSON(updated);
  }

  delete(id: string): boolean {
    const students = this.getStudents();
    const filtered = students.filter(s => s.id !== id);
    
    if (filtered.length === students.length) return false;
    
    this.saveStudents(filtered);
    return true;
  }

  search(query: string): Student[] {
    const lowerQuery = query.toLowerCase();
    return this.getStudents()
      .filter(s => 
        s.name.toLowerCase().includes(lowerQuery) || 
        s.nis.includes(query) ||
        s.kelas.toLowerCase().includes(lowerQuery)
      )
      .map(s => Student.fromJSON(s));
  }

  getStats(): { total: number; byKelas: Record<string, number> } {
    const students = this.getStudents();
    const byKelas: Record<string, number> = {};
    
    students.forEach(s => {
      byKelas[s.kelas] = (byKelas[s.kelas] || 0) + 1;
    });

    return { total: students.length, byKelas };
  }
}

export const studentService = new StudentService();
