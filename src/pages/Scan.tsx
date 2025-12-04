import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { QRScanner } from '@/components/attendance/QRScanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScanLine, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ScanLog {
  studentId: string;
  studentName: string;
  time: string;
}

const Scan = () => {
  const [scanLogs, setScanLogs] = useState<ScanLog[]>([]);

  const handleScanSuccess = (studentId: string, studentName: string) => {
    setScanLogs((prev) => [
      { studentId, studentName, time: new Date().toLocaleTimeString('id-ID') },
      ...prev.slice(0, 9), // Keep last 10
    ]);
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <ScanLine className="h-8 w-8 text-primary" />
            Scan Absensi
          </h1>
          <p className="text-muted-foreground mt-1">
            Scan QR Code siswa untuk mencatat kehadiran
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Scanner */}
          <QRScanner onScanSuccess={handleScanSuccess} />

          {/* Scan Logs */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Riwayat Scan Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent>
              {scanLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ScanLine className="mx-auto h-12 w-12 opacity-50 mb-2" />
                  <p>Belum ada absensi hari ini</p>
                  <p className="text-sm">Mulai scan QR Code siswa</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {scanLogs.map((log, index) => (
                    <div 
                      key={`${log.studentId}-${log.time}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-success/5 border border-success/20 animate-slide-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/20 text-success">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{log.studentName}</p>
                          <p className="text-xs text-muted-foreground">{log.time}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                        Hadir
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Scan;
