import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { AttendanceChart } from '@/components/dashboard/AttendanceChart';
import { AttendanceTable } from '@/components/attendance/AttendanceTable';
import { Users, UserCheck, UserX, Clock, TrendingUp, Calendar } from 'lucide-react';
import { attendanceService } from '@/services/AttendanceService';
import { studentService } from '@/services/StudentService';
import { leaveService } from '@/services/LeaveService';
import { authService } from '@/services/AuthService';

const Dashboard = () => {
  const user = authService.getCurrentUser();
  const [stats, setStats] = useState({ hadir: 0, izin: 0, sakit: 0, alpha: 0, total: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentAttendances, setRecentAttendances] = useState<any[]>([]);
  const [leaveStats, setLeaveStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    // Get today's stats
    const todayStats = attendanceService.getTodayStats();
    setStats(todayStats);

    // Get monthly chart data (last 7 days)
    const today = new Date();
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayAttendances = attendanceService.getByDate(dateStr);
      const students = studentService.getAll();
      
      data.push({
        date: dateStr,
        hadir: dayAttendances.filter(a => a.status === 'hadir').length,
        izin: dayAttendances.filter(a => a.status === 'izin').length,
        sakit: dayAttendances.filter(a => a.status === 'sakit').length,
        alpha: students.length - dayAttendances.length,
      });
    }
    setChartData(data);

    // Get recent attendances
    const today$ = new Date().toISOString().split('T')[0];
    setRecentAttendances(attendanceService.getByDate(today$));

    // Get leave stats
    setLeaveStats(leaveService.getStats());
  }, []);

  const attendanceRate = stats.total > 0 ? Math.round((stats.hadir / stats.total) * 100) : 0;

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Selamat Datang, {user?.name}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Berikut ringkasan absensi hari ini
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Siswa"
            value={stats.total}
            icon={<Users className="h-6 w-6" />}
            variant="primary"
          />
          <StatCard
            title="Hadir Hari Ini"
            value={stats.hadir}
            subtitle={`${attendanceRate}% dari total`}
            icon={<UserCheck className="h-6 w-6" />}
            variant="success"
          />
          <StatCard
            title="Izin/Sakit"
            value={stats.izin + stats.sakit}
            icon={<Clock className="h-6 w-6" />}
            variant="warning"
          />
          <StatCard
            title="Alpha"
            value={stats.alpha}
            icon={<UserX className="h-6 w-6" />}
            variant="danger"
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <AttendanceChart 
            data={chartData} 
            type="bar" 
            title="Statistik Mingguan" 
          />
          <AttendanceChart 
            data={chartData} 
            type="pie" 
            title="Distribusi Kehadiran" 
          />
        </div>

        {/* Additional Stats for Admin/Guru */}
        {(user?.role === 'admin' || user?.role === 'guru') && (
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              title="Pengajuan Izin Pending"
              value={leaveStats.pending}
              icon={<Calendar className="h-6 w-6" />}
              variant="warning"
            />
            <StatCard
              title="Izin Disetujui Bulan Ini"
              value={leaveStats.approved}
              icon={<TrendingUp className="h-6 w-6" />}
              variant="success"
            />
            <StatCard
              title="Total Kelas"
              value={studentService.getKelasOptions().length}
              icon={<Users className="h-6 w-6" />}
            />
          </div>
        )}

        {/* Recent Attendance */}
        <AttendanceTable 
          attendances={recentAttendances} 
          title="Absensi Hari Ini" 
          showFilters={false}
        />
      </div>
    </MainLayout>
  );
};

export default Dashboard;
