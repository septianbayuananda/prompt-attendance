import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Download, FileSpreadsheet, FileText, Filter } from 'lucide-react';
import { Attendance, AttendanceStatus } from '@/models/Attendance';
import { exportService } from '@/services/ExportService';

interface AttendanceTableProps {
  attendances: Attendance[];
  showFilters?: boolean;
  title?: string;
}

export const AttendanceTable = ({ 
  attendances, 
  showFilters = true,
  title = 'Data Absensi'
}: AttendanceTableProps) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | 'all'>('all');

  const filteredData = attendances.filter(a => {
    const matchesSearch = a.studentName.toLowerCase().includes(search.toLowerCase()) ||
                         a.kelas.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: AttendanceStatus) => {
    const variants: Record<AttendanceStatus, { className: string; label: string }> = {
      hadir: { className: 'bg-success/10 text-success border-success/20', label: 'Hadir' },
      izin: { className: 'bg-primary/10 text-primary border-primary/20', label: 'Izin' },
      sakit: { className: 'bg-warning/10 text-warning border-warning/20', label: 'Sakit' },
      alpha: { className: 'bg-destructive/10 text-destructive border-destructive/20', label: 'Alpha' },
    };
    const variant = variants[status];
    return <Badge variant="outline" className={variant.className}>{variant.label}</Badge>;
  };

  const handleExportPDF = () => {
    exportService.exportToPDF(filteredData.map(a => a.toJSON()), title);
  };

  const handleExportExcel = () => {
    exportService.exportToExcel(filteredData.map(a => a.toJSON()), title.replace(/\s+/g, '_'));
  };

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-2">
            <FileText className="h-4 w-4" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportExcel} className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Excel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showFilters && (
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama atau kelas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as AttendanceStatus | 'all')}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="hadir">Hadir</SelectItem>
                <SelectItem value="izin">Izin</SelectItem>
                <SelectItem value="sakit">Sakit</SelectItem>
                <SelectItem value="alpha">Alpha</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">No</TableHead>
                <TableHead className="font-semibold">Tanggal</TableHead>
                <TableHead className="font-semibold">Nama Siswa</TableHead>
                <TableHead className="font-semibold">Kelas</TableHead>
                <TableHead className="font-semibold">Waktu</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Tidak ada data absensi
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((attendance, index) => (
                  <TableRow key={attendance.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{attendance.date}</TableCell>
                    <TableCell className="font-medium">{attendance.studentName}</TableCell>
                    <TableCell>{attendance.kelas}</TableCell>
                    <TableCell>{attendance.time}</TableCell>
                    <TableCell>{getStatusBadge(attendance.status)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Menampilkan {filteredData.length} dari {attendances.length} data
        </div>
      </CardContent>
    </Card>
  );
};
