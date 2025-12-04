import { Student } from '@/models/Student';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, QrCode, User } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface StudentCardProps {
  student: Student;
  onEdit: (student: Student) => void;
  onDelete: (id: string) => void;
}

export const StudentCard = ({ student, onEdit, onDelete }: StudentCardProps) => {
  const [showQR, setShowQR] = useState(false);

  return (
    <>
      <Card className="glass-card card-hover overflow-hidden group">
        <CardContent className="p-0">
          <div className="p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {student.photo ? (
                  <img src={student.photo} alt={student.name} className="h-14 w-14 rounded-xl object-cover" />
                ) : (
                  <User className="h-7 w-7" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{student.name}</h3>
                <p className="text-sm text-muted-foreground">NIS: {student.nis}</p>
                <Badge variant="secondary" className="mt-2">
                  {student.kelas}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 rounded-none h-11 gap-2 text-muted-foreground hover:text-primary"
              onClick={() => setShowQR(true)}
            >
              <QrCode className="h-4 w-4" />
              QR
            </Button>
            <div className="w-px bg-border" />
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 rounded-none h-11 gap-2 text-muted-foreground hover:text-primary"
              onClick={() => onEdit(student)}
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
            <div className="w-px bg-border" />
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 rounded-none h-11 gap-2 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(student.id)}
            >
              <Trash2 className="h-4 w-4" />
              Hapus
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code - {student.name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="p-4 bg-card rounded-2xl shadow-lg">
              <QRCodeSVG
                value={student.generateQRData()}
                size={200}
                level="H"
                includeMargin
              />
            </div>
            <div className="text-center">
              <p className="font-medium">{student.name}</p>
              <p className="text-sm text-muted-foreground">NIS: {student.nis} | {student.kelas}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
