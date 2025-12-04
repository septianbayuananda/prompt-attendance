import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Clock, CheckCircle2 } from 'lucide-react';
import { attendanceService } from '@/services/AttendanceService';
import { authService } from '@/services/AuthService';
import { AttendanceSession } from '@/models/AttendanceSession';

export const QRCodeGenerator = () => {
  const [session, setSession] = useState<AttendanceSession | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const activeSession = attendanceService.getActiveSession();
    if (activeSession) {
      setSession(activeSession);
    }
  }, []);

  const handleGenerateSession = () => {
    setLoading(true);
    const user = authService.getCurrentUser();
    if (user) {
      const newSession = attendanceService.createSession(user.id, user.name);
      setSession(newSession);
    }
    setLoading(false);
  };

  const handleRegenerateQR = () => {
    if (session) {
      setLoading(true);
      const updatedSession = attendanceService.regenerateSession(session.id);
      if (updatedSession) {
        setSession(updatedSession);
      }
      setLoading(false);
    }
  };

  const formatTimeRemaining = (expiresAt: Date): string => {
    const now = new Date();
    const diff = new Date(expiresAt).getTime() - now.getTime();
    if (diff <= 0) return 'Kadaluarsa';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}j ${minutes}m`;
  };

  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="gradient-primary text-primary-foreground">
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          QR Code Absensi Harian
        </CardTitle>
        <CardDescription className="text-primary-foreground/80">
          Siswa dapat scan QR ini untuk mencatat kehadiran
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {session && !session.isExpired() ? (
          <div className="flex flex-col items-center gap-6">
            <div className="relative p-4 bg-card rounded-2xl shadow-lg animate-scale-in">
              <QRCodeSVG
                value={session.generateQRData()}
                size={240}
                level="H"
                includeMargin
                className="rounded-lg"
              />
              <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-success text-success-foreground shadow-lg">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">
                  Berlaku: {formatTimeRemaining(session.expiresAt)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Dibuat oleh: {session.createdByName}
              </p>
            </div>

            <Button 
              onClick={handleRegenerateQR} 
              variant="outline" 
              className="gap-2"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Regenerate QR
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 py-8">
            <div className="flex h-48 w-48 items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/30">
              <p className="text-center text-muted-foreground px-4">
                Belum ada sesi absensi aktif untuk hari ini
              </p>
            </div>
            <Button 
              onClick={handleGenerateSession} 
              size="lg" 
              className="gap-2"
              disabled={loading}
            >
              Buat Sesi Absensi
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
