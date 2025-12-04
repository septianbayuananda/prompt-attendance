import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  QrCode, 
  ClipboardList, 
  FileSpreadsheet, 
  Settings,
  LogOut,
  GraduationCap,
  ScanLine
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { authService } from '@/services/AuthService';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  onLogout: () => void;
}

export const Sidebar = ({ onLogout }: SidebarProps) => {
  const user = authService.getCurrentUser();
  const role = user?.role;

  const adminLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/students', icon: Users, label: 'Data Siswa' },
    { to: '/qr-generate', icon: QrCode, label: 'Generate QR' },
    { to: '/attendance', icon: ClipboardList, label: 'Rekap Absensi' },
    { to: '/reports', icon: FileSpreadsheet, label: 'Laporan' },
    { to: '/settings', icon: Settings, label: 'Pengaturan' },
  ];

  const guruLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/scan', icon: ScanLine, label: 'Scan Absensi' },
    { to: '/qr-generate', icon: QrCode, label: 'Generate QR' },
    { to: '/attendance', icon: ClipboardList, label: 'Rekap Absensi' },
  ];

  const siswaLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/my-attendance', icon: ClipboardList, label: 'Riwayat Absensi' },
    { to: '/leave-request', icon: FileSpreadsheet, label: 'Pengajuan Izin' },
    { to: '/profile', icon: Settings, label: 'Profil' },
  ];

  const links = role === 'admin' ? adminLinks : role === 'guru' ? guruLinks : siswaLinks;

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 gradient-hero border-r border-sidebar-border">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-20 items-center gap-3 px-6 border-b border-sidebar-border">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-glow">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">AbsensiKu</h1>
            <p className="text-xs text-sidebar-foreground/60">Sistem Absensi Siswa</p>
          </div>
        </div>

        {/* User Info */}
        <div className="px-4 py-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent/50 px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
              <span className="text-sm font-semibold">{user?.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name}</p>
              <p className="text-xs text-sidebar-foreground/60 capitalize">{role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'gradient-primary text-primary-foreground shadow-md'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                )
              }
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            onClick={onLogout}
            className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-5 w-5" />
            Keluar
          </Button>
        </div>
      </div>
    </aside>
  );
};
