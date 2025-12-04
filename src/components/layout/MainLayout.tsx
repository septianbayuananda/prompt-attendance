import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/AuthService';
import { storageService } from '@/services/StorageService';
import { Wifi, WifiOff } from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const navigate = useNavigate();
  const isOnline = storageService.isOnline();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar onLogout={handleLogout} />
      
      <div className="pl-64">
        {/* Status Bar */}
        <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-6">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <div className="flex items-center gap-2 text-success text-sm">
                <Wifi className="h-4 w-4" />
                <span>Online</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-warning text-sm">
                <WifiOff className="h-4 w-4" />
                <span>Offline - Data tersimpan lokal</span>
              </div>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('id-ID', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        {/* Main Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
