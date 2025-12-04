import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { AttendanceTable } from '@/components/attendance/AttendanceTable';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardList, Calendar } from 'lucide-react';
import { attendanceService } from '@/services/AttendanceService';
import { studentService } from '@/services/StudentService';
import { Attendance } from '@/models/Attendance';

const AttendancePage = () => {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedKelas, setSelectedKelas] = useState<string>('all');

  const kelasOptions = studentService.getKelasOptions();

  useEffect(() => {
    let data = attendanceService.getByDate(selectedDate);
    if (selectedKelas !== 'all') {
      data = data.filter(a => a.kelas === selectedKelas);
    }
    setAttendances(data);
  }, [selectedDate, selectedKelas]);

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <ClipboardList className="h-8 w-8 text-primary" />
            Rekap Absensi
          </h1>
          <p className="text-muted-foreground mt-1">
            Lihat dan kelola data kehadiran siswa
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
          </div>
          <Select value={selectedKelas} onValueChange={setSelectedKelas}>
            <SelectTrigger className="w-full md:w-[200px]">
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

        {/* Table */}
        <AttendanceTable 
          attendances={attendances}
          title={`Absensi ${new Date(selectedDate).toLocaleDateString('id-ID', { 
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}`}
        />
      </div>
    </MainLayout>
  );
};

export default AttendancePage;
