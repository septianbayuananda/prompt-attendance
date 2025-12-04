import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { AttendanceChart } from '@/components/dashboard/AttendanceChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileSpreadsheet, Download, FileText, TrendingUp } from 'lucide-react';
import { attendanceService } from '@/services/AttendanceService';
import { exportService } from '@/services/ExportService';

const Reports = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [chartData, setChartData] = useState<any[]>([]);

  const months = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    const data = attendanceService.getMonthlyStats(selectedMonth, selectedYear);
    setChartData(data);
  }, [selectedMonth, selectedYear]);

  const handleExportPDF = () => {
    const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
    const endDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${new Date(selectedYear, selectedMonth, 0).getDate()}`;
    const attendances = attendanceService.getByDateRange(startDate, endDate);
    exportService.exportToPDF(attendances.map(a => a.toJSON()), `Laporan_${months[selectedMonth - 1].label}_${selectedYear}`);
  };

  const handleExportExcel = () => {
    const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
    const endDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${new Date(selectedYear, selectedMonth, 0).getDate()}`;
    const attendances = attendanceService.getByDateRange(startDate, endDate);
    exportService.exportToExcel(attendances.map(a => a.toJSON()), `Laporan_${months[selectedMonth - 1].label}_${selectedYear}`);
  };

  const totals = chartData.reduce(
    (acc, curr) => ({
      hadir: acc.hadir + curr.hadir,
      izin: acc.izin + curr.izin,
      sakit: acc.sakit + curr.sakit,
      alpha: acc.alpha + curr.alpha,
    }),
    { hadir: 0, izin: 0, sakit: 0, alpha: 0 }
  );

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <FileSpreadsheet className="h-8 w-8 text-primary" />
              Laporan Bulanan
            </h1>
            <p className="text-muted-foreground mt-1">
              Lihat statistik dan export laporan absensi
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportPDF} className="gap-2">
              <FileText className="h-4 w-4" />
              Export PDF
            </Button>
            <Button onClick={handleExportExcel} className="gap-2">
              <Download className="h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Select 
            value={String(selectedMonth)} 
            onValueChange={(v) => setSelectedMonth(Number(v))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pilih Bulan" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
            value={String(selectedYear)} 
            onValueChange={(v) => setSelectedYear(Number(v))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Pilih Tahun" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/20 text-success">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Hadir</p>
                  <p className="text-2xl font-bold">{totals.hadir}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Izin</p>
                  <p className="text-2xl font-bold">{totals.izin}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/20 text-warning">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Sakit</p>
                  <p className="text-2xl font-bold">{totals.sakit}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/20 text-destructive">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Alpha</p>
                  <p className="text-2xl font-bold">{totals.alpha}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <AttendanceChart 
            data={chartData} 
            type="line" 
            title={`Tren Kehadiran ${months[selectedMonth - 1].label} ${selectedYear}`}
          />
          <AttendanceChart 
            data={chartData} 
            type="pie" 
            title="Distribusi Status"
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default Reports;
