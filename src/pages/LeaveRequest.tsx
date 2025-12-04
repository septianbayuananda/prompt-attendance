import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileSpreadsheet, Plus, Calendar, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { leaveService } from '@/services/LeaveService';
import { authService } from '@/services/AuthService';
import { LeaveRequest as LeaveRequestModel, LeaveType, LeaveStatus } from '@/models/LeaveRequest';
import { toast } from '@/hooks/use-toast';

const LeaveRequest = () => {
  const user = authService.getCurrentUser();
  const student = authService.getCurrentStudent();
  const [requests, setRequests] = useState<LeaveRequestModel[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'izin' as LeaveType,
    startDate: '',
    endDate: '',
    reason: '',
  });

  useEffect(() => {
    if (student) {
      setRequests(leaveService.getByStudent(student.id));
    } else if (user?.role === 'admin' || user?.role === 'guru') {
      setRequests(leaveService.getPending());
    }
  }, [student, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!student) {
      toast({ title: 'Error', description: 'Data siswa tidak ditemukan', variant: 'destructive' });
      return;
    }

    leaveService.create({
      studentId: student.id,
      studentName: student.name,
      kelas: student.kelas,
      ...formData,
    });

    toast({ title: 'Berhasil', description: 'Pengajuan izin berhasil dikirim' });
    setFormOpen(false);
    setRequests(leaveService.getByStudent(student.id));
    setFormData({ type: 'izin', startDate: '', endDate: '', reason: '' });
  };

  const handleApprove = (id: string) => {
    if (user) {
      leaveService.approve(id, user.name);
      toast({ title: 'Berhasil', description: 'Izin disetujui' });
      setRequests(leaveService.getPending());
    }
  };

  const handleReject = (id: string) => {
    if (user) {
      leaveService.reject(id, user.name);
      toast({ title: 'Berhasil', description: 'Izin ditolak' });
      setRequests(leaveService.getPending());
    }
  };

  const getStatusBadge = (status: LeaveStatus) => {
    const variants: Record<LeaveStatus, { className: string; icon: any; label: string }> = {
      pending: { className: 'bg-warning/10 text-warning border-warning/20', icon: AlertCircle, label: 'Menunggu' },
      approved: { className: 'bg-success/10 text-success border-success/20', icon: CheckCircle2, label: 'Disetujui' },
      rejected: { className: 'bg-destructive/10 text-destructive border-destructive/20', icon: XCircle, label: 'Ditolak' },
    };
    const variant = variants[status];
    return (
      <Badge variant="outline" className={variant.className}>
        <variant.icon className="h-3 w-3 mr-1" />
        {variant.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: LeaveType) => {
    const labels: Record<LeaveType, string> = {
      sakit: 'Sakit',
      izin: 'Izin',
      keluarga: 'Keluarga',
    };
    return <Badge variant="secondary">{labels[type]}</Badge>;
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <FileSpreadsheet className="h-8 w-8 text-primary" />
              {user?.role === 'siswa' ? 'Pengajuan Izin' : 'Kelola Izin'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {user?.role === 'siswa' 
                ? 'Ajukan izin sakit atau tidak hadir' 
                : 'Tinjau pengajuan izin siswa'}
            </p>
          </div>
          {user?.role === 'siswa' && (
            <Button onClick={() => setFormOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Ajukan Izin
            </Button>
          )}
        </div>

        {/* Request List */}
        <div className="grid gap-4">
          {requests.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="py-12 text-center">
                <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  {user?.role === 'siswa' 
                    ? 'Belum ada pengajuan izin' 
                    : 'Tidak ada pengajuan izin yang menunggu'}
                </p>
              </CardContent>
            </Card>
          ) : (
            requests.map((request, index) => (
              <Card 
                key={request.id} 
                className="glass-card card-hover animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{request.studentName}</h3>
                        {getTypeBadge(request.type)}
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{request.kelas}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {request.startDate} - {request.endDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {request.getDuration()} hari
                        </span>
                      </div>
                      <p className="text-sm">{request.reason}</p>
                    </div>

                    {(user?.role === 'admin' || user?.role === 'guru') && request.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleReject(request.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Tolak
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleApprove(request.id)}
                          className="bg-success text-success-foreground hover:bg-success/90"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Setujui
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Form Dialog */}
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Ajukan Izin</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Jenis Izin</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(v) => setFormData({ ...formData, type: v as LeaveType })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sakit">Sakit</SelectItem>
                    <SelectItem value="izin">Izin</SelectItem>
                    <SelectItem value="keluarga">Acara Keluarga</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tanggal Mulai</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tanggal Selesai</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Alasan</Label>
                <Textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Jelaskan alasan izin..."
                  rows={4}
                  required
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">Kirim Pengajuan</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default LeaveRequest;
