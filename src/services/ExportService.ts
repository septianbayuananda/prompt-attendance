import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { IAttendance } from '@/models/Attendance';

class ExportService {
  exportToPDF(data: IAttendance[], title: string = 'Rekap Absensi'): void {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    
    // Date
    doc.setFontSize(10);
    doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 30);

    // Table headers
    const headers = ['No', 'Tanggal', 'Nama', 'Kelas', 'Waktu', 'Status'];
    const startY = 40;
    const cellWidth = [15, 30, 50, 30, 25, 25];
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    let currentX = 14;
    headers.forEach((header, i) => {
      doc.text(header, currentX, startY);
      currentX += cellWidth[i];
    });

    // Table data
    doc.setFont('helvetica', 'normal');
    let currentY = startY + 7;

    data.forEach((item, index) => {
      if (currentY > 280) {
        doc.addPage();
        currentY = 20;
      }

      currentX = 14;
      const rowData = [
        (index + 1).toString(),
        item.date,
        item.studentName.substring(0, 20),
        item.kelas,
        item.time,
        item.status.toUpperCase(),
      ];

      rowData.forEach((cell, i) => {
        doc.text(cell, currentX, currentY);
        currentX += cellWidth[i];
      });

      currentY += 7;
    });

    // Summary
    currentY += 10;
    const hadir = data.filter(a => a.status === 'hadir').length;
    const izin = data.filter(a => a.status === 'izin').length;
    const sakit = data.filter(a => a.status === 'sakit').length;
    const alpha = data.filter(a => a.status === 'alpha').length;

    doc.setFont('helvetica', 'bold');
    doc.text('Ringkasan:', 14, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(`Hadir: ${hadir} | Izin: ${izin} | Sakit: ${sakit} | Alpha: ${alpha}`, 14, currentY + 7);

    doc.save(`${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  exportToExcel(data: IAttendance[], filename: string = 'Rekap_Absensi'): void {
    const worksheetData = data.map((item, index) => ({
      'No': index + 1,
      'Tanggal': item.date,
      'Nama Siswa': item.studentName,
      'Kelas': item.kelas,
      'Waktu': item.time,
      'Status': item.status.toUpperCase(),
      'Catatan': item.note || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Absensi');

    // Summary sheet
    const hadir = data.filter(a => a.status === 'hadir').length;
    const izin = data.filter(a => a.status === 'izin').length;
    const sakit = data.filter(a => a.status === 'sakit').length;
    const alpha = data.filter(a => a.status === 'alpha').length;

    const summaryData = [
      { 'Status': 'Hadir', 'Jumlah': hadir },
      { 'Status': 'Izin', 'Jumlah': izin },
      { 'Status': 'Sakit', 'Jumlah': sakit },
      { 'Status': 'Alpha', 'Jumlah': alpha },
      { 'Status': 'Total', 'Jumlah': data.length },
    ];

    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan');

    XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
  }
}

export const exportService = new ExportService();
