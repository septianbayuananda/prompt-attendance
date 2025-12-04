import { MainLayout } from '@/components/layout/MainLayout';
import { QRCodeGenerator } from '@/components/attendance/QRCodeGenerator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { QrCode, Info, Clock, Shield } from 'lucide-react';

const QRGenerate = () => {
  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <QrCode className="h-8 w-8 text-primary" />
            Generate QR Code
          </h1>
          <p className="text-muted-foreground mt-1">
            Buat QR Code absensi untuk hari ini
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* QR Generator */}
          <QRCodeGenerator />

          {/* Instructions */}
          <div className="space-y-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="h-5 w-5 text-primary" />
                  Cara Penggunaan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Buat Sesi Absensi</p>
                    <p className="text-sm text-muted-foreground">
                      Klik tombol "Buat Sesi Absensi" untuk generate QR Code baru
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Tampilkan ke Siswa</p>
                    <p className="text-sm text-muted-foreground">
                      Proyeksikan QR Code di layar atau cetak untuk ditempel di kelas
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Siswa Scan QR</p>
                    <p className="text-sm text-muted-foreground">
                      Siswa membuka aplikasi dan scan QR untuk mencatat kehadiran
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5 text-success" />
                  Keamanan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <p>
                    <span className="font-medium">QR Code Dinamis:</span>{' '}
                    <span className="text-muted-foreground">
                      Token berubah setiap 24 jam untuk mencegah penyalahgunaan
                    </span>
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <p>
                    <span className="font-medium">Regenerate:</span>{' '}
                    <span className="text-muted-foreground">
                      Anda dapat men-generate ulang QR Code kapan saja jika diperlukan
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default QRGenerate;
