import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StudentCard } from '@/components/students/StudentCard';
import { StudentForm } from '@/components/students/StudentForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter, Users } from 'lucide-react';
import { studentService } from '@/services/StudentService';
import { Student } from '@/models/Student';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [kelasFilter, setKelasFilter] = useState<string>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const kelasOptions = studentService.getKelasOptions();

  const loadStudents = () => {
    setStudents(studentService.getAll());
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                         s.nis.includes(search);
    const matchesKelas = kelasFilter === 'all' || s.kelas === kelasFilter;
    return matchesSearch && matchesKelas;
  });

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      studentService.delete(deleteId);
      loadStudents();
      toast({ title: 'Berhasil', description: 'Siswa berhasil dihapus' });
      setDeleteId(null);
    }
  };

  const handleFormSuccess = () => {
    loadStudents();
    setEditingStudent(null);
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              Data Siswa
            </h1>
            <p className="text-muted-foreground mt-1">
              Kelola data siswa dan QR Code absensi
            </p>
          </div>
          <Button onClick={() => setFormOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah Siswa
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau NIS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={kelasFilter} onValueChange={setKelasFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter Kelas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kelas</SelectItem>
              {kelasOptions.map((k) => (
                <SelectItem key={k} value={k}>{k}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="text-sm text-muted-foreground">
          Menampilkan {filteredStudents.length} dari {students.length} siswa
        </div>

        {/* Student Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredStudents.map((student, index) => (
            <div 
              key={student.id} 
              className="animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <StudentCard
                student={student}
                onEdit={handleEdit}
                onDelete={(id) => setDeleteId(id)}
              />
            </div>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">Tidak ada data siswa</h3>
            <p className="text-muted-foreground">
              {search || kelasFilter !== 'all' 
                ? 'Coba ubah filter pencarian' 
                : 'Mulai dengan menambahkan siswa baru'}
            </p>
          </div>
        )}

        {/* Form Dialog */}
        <StudentForm
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) setEditingStudent(null);
          }}
          student={editingStudent}
          onSuccess={handleFormSuccess}
        />

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Siswa?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini tidak dapat dibatalkan. Data siswa akan dihapus secara permanen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
};

export default Students;
