import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { attendanceService } from '@/services/AttendanceService';
import { studentService } from '@/services/StudentService';
import { toast } from '@/hooks/use-toast';

interface QRScannerProps {
  onScanSuccess?: (studentId: string, studentName: string) => void;
}

export const QRScanner = ({ onScanSuccess }: QRScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [lastResult, setLastResult] = useState<{ success: boolean; message: string; name?: string } | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanning = async () => {
    if (!containerRef.current) return;

    try {
      scannerRef.current = new Html5Qrcode('qr-reader');
      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        handleScan,
        () => {} // Ignore errors during scanning
      );
      setIsScanning(true);
    } catch (error) {
      console.error('Error starting scanner:', error);
      toast({
        title: 'Error',
        description: 'Tidak dapat mengakses kamera',
        variant: 'destructive',
      });
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
      } catch (error) {
        console.error('Error stopping scanner:', error);
      }
    }
  };

  const handleScan = async (decodedText: string) => {
    try {
      const data = JSON.parse(decodedText);
      
      if (data.type === 'attendance_session') {
        // This is for students scanning the session QR
        // In a real app, this would be handled differently
        setLastResult({ success: false, message: 'QR sesi absensi - Gunakan mode siswa' });
        return;
      }

      if (data.type === 'student_login' && data.studentId) {
        const activeSession = attendanceService.getActiveSession();
        if (!activeSession) {
          setLastResult({ success: false, message: 'Tidak ada sesi absensi aktif' });
          return;
        }

        const result = attendanceService.recordAttendance(data.studentId, activeSession.id);
        
        if (result.success && result.attendance) {
          setLastResult({ 
            success: true, 
            message: 'Absensi berhasil!',
            name: result.attendance.studentName 
          });
          onScanSuccess?.(data.studentId, result.attendance.studentName);
          
          toast({
            title: '✅ Absensi Berhasil',
            description: `${result.attendance.studentName} tercatat hadir`,
          });
        } else {
          setLastResult({ success: false, message: result.message });
        }
      }
    } catch {
      // Try direct student ID lookup
      const student = studentService.getById(decodedText) || studentService.getByNis(decodedText);
      if (student) {
        const activeSession = attendanceService.getActiveSession();
        if (!activeSession) {
          setLastResult({ success: false, message: 'Tidak ada sesi absensi aktif' });
          return;
        }

        const result = attendanceService.recordAttendance(student.id, activeSession.id);
        if (result.success) {
          setLastResult({ success: true, message: 'Absensi berhasil!', name: student.name });
          onScanSuccess?.(student.id, student.name);
        } else {
          setLastResult({ success: false, message: result.message });
        }
      } else {
        setLastResult({ success: false, message: 'QR Code tidak valid' });
      }
    }

    // Reset result after 3 seconds
    setTimeout(() => setLastResult(null), 3000);
  };

  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="gradient-accent text-accent-foreground">
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Scan QR Siswa
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-4">
          <div 
            ref={containerRef}
            id="qr-reader" 
            className={`w-full max-w-sm aspect-square rounded-2xl overflow-hidden bg-muted ${!isScanning ? 'hidden' : ''}`}
          />

          {!isScanning && (
            <div className="flex h-64 w-full max-w-sm items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/30 bg-muted/50">
              <div className="text-center">
                <CameraOff className="mx-auto h-12 w-12 text-muted-foreground/50 mb-2" />
                <p className="text-muted-foreground">Kamera tidak aktif</p>
              </div>
            </div>
          )}

          {lastResult && (
            <div className={`flex items-center gap-2 p-4 rounded-xl w-full max-w-sm animate-scale-in ${
              lastResult.success ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
            }`}>
              {lastResult.success ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : (
                <XCircle className="h-6 w-6" />
              )}
              <div>
                <p className="font-medium">{lastResult.message}</p>
                {lastResult.name && <p className="text-sm opacity-80">{lastResult.name}</p>}
              </div>
            </div>
          )}

          <Button
            onClick={isScanning ? stopScanning : startScanning}
            size="lg"
            variant={isScanning ? 'destructive' : 'default'}
            className="w-full max-w-sm gap-2"
          >
            {isScanning ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Hentikan Scan
              </>
            ) : (
              <>
                <Camera className="h-5 w-5" />
                Mulai Scan
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
