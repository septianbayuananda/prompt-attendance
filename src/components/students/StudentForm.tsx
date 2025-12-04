import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Student } from '@/models/Student';
import { studentService } from '@/services/StudentService';
import { toast } from '@/hooks/use-toast';

interface StudentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: Student | null;
  onSuccess: () => void;
}

export const StudentForm = ({ open, onOpenChange, student, onSuccess }: StudentFormProps) => {
  const [formData, setFormData] = useState({
    nis: student?.nis || '',
    name: student?.name || '',
    kelas: student?.kelas || '',
    parentPhone: student?.parentPhone || '',
  });
  const [loading, setLoading] = useState(false);

  const kelasOptions = [
    'X IPA 1', 'X IPA 2', 'X IPS 1', 'X IPS 2',
    'XI IPA 1', 'XI IPA 2', 'XI IPS 1', 'XI IPS 2',
    'XII IPA 1', 'XII IPA 2', 'XII IPS 1', 'XII IPS 2',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (student) {
        studentService.update(student.id, formData);
        toast({ title: 'Berhasil', description: 'Data siswa berhasil diperbarui' });
      } else {
        studentService.create(formData);
        toast({ title: 'Berhasil', description: 'Siswa baru berhasil ditambahkan' });
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Gagal menyimpan data siswa',
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{student ? 'Edit Siswa' : 'Tambah Siswa Baru'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nis">NIS</Label>
            <Input
              id="nis"
              value={formData.nis}
              onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
              placeholder="Nomor Induk Siswa"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nama lengkap siswa"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kelas">Kelas</Label>
            <Select value={formData.kelas} onValueChange={(v) => setFormData({ ...formData, kelas: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kelas" />
              </SelectTrigger>
              <SelectContent>
                {kelasOptions.map((k) => (
                  <SelectItem key={k} value={k}>{k}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="parentPhone">No. HP Orang Tua</Label>
            <Input
              id="parentPhone"
              value={formData.parentPhone}
              onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
              placeholder="08xxxxxxxxxx"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : student ? 'Simpan Perubahan' : 'Tambah Siswa'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
