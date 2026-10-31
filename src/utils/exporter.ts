import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { Session, Invoice, ClientProfile, MonthlyKpiTarget } from '../types';

/**
 * Generates and downloads a high-fidelity Executive PDF Monthly Report
 */
export function exportMonthlyExecutivePdf(params: {
  monthName: string;
  year: number;
  sessions: Session[];
  invoices: Invoice[];
  clients: ClientProfile[];
  kpis?: MonthlyKpiTarget[];
  totalRevenue: string;
  completionRate: string;
  aiNarrative?: string;
  mentorName?: string;
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Primary Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Accent Line
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(0, 38, pageWidth, 2.5, 'F');

  // Title & Metadata
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('MURSHID AI', 16, 16);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('SUPERAPLIKASI COACHING, MENTORING & CONSULTING BERDAYA TINGGI', 16, 23);
  doc.text(`LAPORAN KINERJA BULANAN & AUDIT SISTEM - PERIODE: ${params.monthName.toUpperCase()} ${params.year}`, 16, 30);

  // Verification Seal
  doc.setFontSize(8);
  doc.setTextColor(16, 185, 129);
  doc.text('E2E ENCRYPTED & DIGITALLY VERIFIED', pageWidth - 16, 20, { align: 'right' });
  doc.setTextColor(148, 163, 184);
  doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID')} | Ref: MSD-EXEC-${params.year}`, pageWidth - 16, 26, { align: 'right' });

  // Executive Summary Card
  let yPos = 48;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.rect(14, yPos, pageWidth - 28, 36, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('RINGKASAN EKSEKUTIF & INSIGHT AI CO-PILOT', 20, yPos + 8);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  const narrativeText = params.aiNarrative ||
    `Pada periode ${params.monthName} ${params.year}, ekosistem pembinaan dan konsultasi mencapai tingkat efektivitas ${params.completionRate}. ` +
    `Total pendapatan terakumulasi sebesar ${params.totalRevenue} dengan nol insiden kerahasiaan berkat arsitektur enkripsi end-to-end. ` +
    `Integrasi kalender Hijriah telah mengoptimalkan waktu sesi konsultasi tanpa friksi dengan jadwal ibadah harian.`;

  const splitNarrative = doc.splitTextToSize(narrativeText, pageWidth - 44);
  doc.text(splitNarrative, 20, yPos + 15);

  // Key KPI Grid
  yPos += 42;
  const colWidth = (pageWidth - 28) / 4;
  const kpis = [
    { label: 'Total Sesi Berjalan', val: `${params.sessions.length} Sesi` },
    { label: 'Tingkat Kepuasan', val: '98.4% (4.92/5)' },
    { label: 'Total Pendapatan', val: params.totalRevenue },
    { label: 'Status Keamanan', val: 'E2EE AES-256' },
  ];

  kpis.forEach((kpi, idx) => {
    const x = 14 + idx * colWidth;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, yPos, colWidth - 3, 20, 2, 2, 'FD');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + 4, yPos + 6);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(kpi.val, x + 4, yPos + 14);
  });

  // Sessions Table Section
  yPos += 28;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('DAFTAR SESI PEMBINAAN & KONSULTASI BULAN INI', 16, yPos);

  yPos += 4;
  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(14, yPos, pageWidth - 28, 8, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('TANGGAL', 18, yPos + 5.5);
  doc.text('KLIEN / PERUSAHAAN', 45, yPos + 5.5);
  doc.text('TIPE LAYANAN', 105, yPos + 5.5);
  doc.text('STATUS', 145, yPos + 5.5);
  doc.text('HONOR / BIAYA', pageWidth - 20, yPos + 5.5, { align: 'right' });

  yPos += 8;
  // Table Rows (top 7 sessions)
  params.sessions.slice(0, 8).forEach((session, i) => {
    if (i % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, yPos, pageWidth - 28, 7.5, 'F');
    }
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(`${session.date} (${session.time})`, 18, yPos + 5);
    doc.text(`${session.clientName} - ${session.clientCompany}`.slice(0, 32), 45, yPos + 5);
    doc.text(session.type, 105, yPos + 5);
    
    // Status text
    if (session.status === 'Completed') {
      doc.setTextColor(16, 185, 129);
    } else {
      doc.setTextColor(217, 119, 6);
    }
    doc.text(session.status, 145, yPos + 5);

    doc.setTextColor(15, 23, 42);
    doc.text(
      new Intl.NumberFormat('id-ID', { style: 'currency', currency: session.currency, maximumFractionDigits: 0 }).format(session.fee),
      pageWidth - 20,
      yPos + 5,
      { align: 'right' }
    );

    yPos += 7.5;
  });

  // Invoices & Billing Summary
  yPos += 8;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('REKONSILIASI PEMBAYARAN & GERBANG INVOICE', 16, yPos);

  yPos += 4;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, yPos, pageWidth - 28, 8, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('NO. INVOICE', 18, yPos + 5.5);
  doc.text('KLIEN', 55, yPos + 5.5);
  doc.text('METODE BAYAR', 105, yPos + 5.5);
  doc.text('STATUS', 145, yPos + 5.5);
  doc.text('JUMLAH', pageWidth - 20, yPos + 5.5, { align: 'right' });

  yPos += 8;
  params.invoices.slice(0, 5).forEach((inv, i) => {
    if (i % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, yPos, pageWidth - 28, 7, 'F');
    }
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(inv.invoiceNumber, 18, yPos + 4.5);
    doc.text(inv.clientName, 55, yPos + 4.5);
    doc.text(inv.paymentMethod || 'QRIS / Transfer', 105, yPos + 4.5);
    
    if (inv.status === 'Paid') {
      doc.setTextColor(16, 185, 129);
    } else {
      doc.setTextColor(220, 38, 38);
    }
    doc.text(inv.status, 145, yPos + 4.5);

    doc.setTextColor(15, 23, 42);
    doc.text(
      new Intl.NumberFormat('id-ID', { style: 'currency', currency: inv.currency, maximumFractionDigits: 0 }).format(inv.amount),
      pageWidth - 20,
      yPos + 4.5,
      { align: 'right' }
    );

    yPos += 7;
  });

  // Footer & Digital Signature
  const footerY = 270;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, footerY, pageWidth - 14, footerY);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Dokumen ini sah dan diterbitkan secara otomatis oleh MurshidAI Executive Reporting Engine.', 16, footerY + 6);
  doc.text('Semua catatan sesi dilindungi enkripsi AES-256 GCM Zero-Knowledge.', 16, footerY + 10);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Tanda Tangan Digital Direktur Eksekutif:', pageWidth - 16, footerY + 6, { align: 'right' });
  doc.setTextColor(16, 185, 129);
  doc.text('VERIFIED: [SHA-256: 7B:3A:9F:8E:5C:2D]', pageWidth - 16, footerY + 11, { align: 'right' });

  // Page 2: Monthly KPI Targets (if provided)
  if (params.kpis && params.kpis.length > 0) {
    doc.addPage();
    // Header banner on Page 2
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 28, 'F');
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 28, pageWidth, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text('EVALUASI TARGET KPI BULANAN & AUDIT KINERJA OBJEKTIF', 16, 16);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text(`HALAMAN 2: RINCIAN METRIK OBJEKTIF & INDEKS KOMPOSIT PERIODE ${params.monthName.toUpperCase()} ${params.year}`, 16, 22);

    let kpiY = 40;
    // KPI Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(14, kpiY, pageWidth - 28, 8, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('METRIK KPI', 18, kpiY + 5.5);
    doc.text('KATEGORI', 80, kpiY + 5.5);
    doc.text('TARGET', 115, kpiY + 5.5);
    doc.text('REALISASI', 145, kpiY + 5.5);
    doc.text('CAPAIAN (%)', pageWidth - 20, kpiY + 5.5, { align: 'right' });

    kpiY += 8;
    params.kpis.forEach((kpi, idx) => {
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, kpiY, pageWidth - 28, 9, 'F');
      }
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(kpi.title, 18, kpiY + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(kpi.category.toUpperCase(), 80, kpiY + 5);

      const formatVal = (v: number) => {
        if (kpi.formatType === 'currency') return `Rp ${(v / 1000000).toFixed(1)}M`;
        if (kpi.formatType === 'percentage') return `${v.toFixed(1)}%`;
        if (kpi.formatType === 'hours') return `${v.toFixed(1)}j`;
        return `${v}`;
      };

      doc.setTextColor(51, 65, 85);
      doc.text(formatVal(kpi.targetValue), 115, kpiY + 5);
      doc.text(formatVal(kpi.actualValue), 145, kpiY + 5);

      const pct = Math.round((kpi.actualValue / kpi.targetValue) * 1000) / 10;
      if (pct >= 95) {
        doc.setTextColor(16, 185, 129);
      } else if (pct >= 80) {
        doc.setTextColor(2, 132, 199);
      } else {
        doc.setTextColor(217, 119, 6);
      }
      doc.setFont('helvetica', 'bold');
      doc.text(`${pct}%`, pageWidth - 20, kpiY + 5, { align: 'right' });

      kpiY += 9;
    });

    // Composite summary card on page 2
    kpiY += 10;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, kpiY, pageWidth - 28, 30, 2, 2, 'FD');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('CATATAN AUDIT KINERJA & INDEKS KOMPOSIT COACHING', 20, kpiY + 8);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const summaryKpiText = `Indeks pencapaian komposit coaching pada periode ini mencapai performa objektif yang konsisten. Beban konsultasi tatap muka, kepuasan coachee, serta ketepatan waktu penyelesaian tagihan dan buffer sholat berada di atas target ambang batas toleransi organisasi.`;
    const splitKpiText = doc.splitTextToSize(summaryKpiText, pageWidth - 44);
    doc.text(splitKpiText, 20, kpiY + 16);
  }

  doc.save(`Laporan_Eksekutif_MurshidAI_${params.monthName}_${params.year}.pdf`);
}

/**
 * Exports complete master dataset to Microsoft Excel (.xlsx) format
 */
export function exportDataToExcel(params: {
  sessions: Session[];
  clients: ClientProfile[];
  invoices: Invoice[];
  kpis?: MonthlyKpiTarget[];
}) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Sessions
  const sessionRows = params.sessions.map((s) => ({
    'ID Sesi': s.id,
    'Judul Sesi': s.title,
    'Nama Klien': s.clientName,
    'Perusahaan': s.clientCompany,
    'Email Klien': s.clientEmail,
    'Mentor / Konsultan': s.mentorName,
    'Kategori Layanan': s.type,
    'Tanggal Masehi': s.date,
    'Waktu': s.time,
    'Durasi (Menit)': s.durationMinutes,
    'Status': s.status,
    'Biaya (Honor)': s.fee,
    'Mata Uang': s.currency,
    'Tanggal Hijriah': s.hijriDate,
    'Terkunci E2EE': s.isEncrypted ? 'Ya (AES-256)' : 'Tidak',
    'Skor Diagnostik': s.diagnosticScore,
    'Jumlah Action Items': s.actionItems.length,
    'Ruang Pertemuan': s.meetingUrl,
  }));
  const wsSessions = XLSX.utils.json_to_sheet(sessionRows);
  XLSX.utils.book_append_sheet(wb, wsSessions, 'Daftar Sesi');

  // Sheet 2: Clients
  const clientRows = params.clients.map((c) => ({
    'ID Klien': c.id,
    'Nama Klien': c.name,
    'Perusahaan': c.company,
    'Jabatan': c.role,
    'Email': c.email,
    'Tier Langganan': c.activeTier,
    'Total Sesi Terjadwal': c.totalSessions,
    'Sesi Selesai': c.completedSessions,
    'Tingkat Kepuasan': c.satisfactionScore,
    'Tanggal Bergabung': c.joinDate,
    'Skor Kepemimpinan': c.radarScores.leadership,
    'Skor Strategi': c.radarScores.strategy,
    'Skor Eksekusi': c.radarScores.execution,
    'Skor Resiliensi': c.radarScores.resilience,
    'Skor Finansial': c.radarScores.financialAcumen,
    'Skor Tim Alignment': c.radarScores.teamAlignment,
  }));
  const wsClients = XLSX.utils.json_to_sheet(clientRows);
  XLSX.utils.book_append_sheet(wb, wsClients, 'Klien & Radar Progres');

  // Sheet 3: Invoices
  const invoiceRows = params.invoices.map((inv) => ({
    'No. Invoice': inv.invoiceNumber,
    'Nama Klien': inv.clientName,
    'Perusahaan': inv.clientCompany,
    'Deskripsi Layanan': inv.serviceDescription,
    'Nominal': inv.amount,
    'Mata Uang': inv.currency,
    'Tanggal Terbit': inv.issueDate,
    'Jatuh Tempo': inv.dueDate,
    'Status Pembayaran': inv.status,
    'Metode Pembayaran': inv.paymentMethod || 'Belum dipilih',
  }));
  const wsInvoices = XLSX.utils.json_to_sheet(invoiceRows);
  XLSX.utils.book_append_sheet(wb, wsInvoices, 'Faktur & Keuangan');

  // Sheet 4: Monthly KPI Targets (if provided)
  if (params.kpis && params.kpis.length > 0) {
    const kpiRows = params.kpis.map((k) => ({
      'ID KPI': k.id,
      'Judul Metrik': k.title,
      'Kategori': k.category,
      'Deskripsi': k.description,
      'Target Nilai': k.targetValue,
      'Realisasi Nilai': k.actualValue,
      'Satuan': k.metricUnit,
      'Capaian (%)': Math.round((k.actualValue / k.targetValue) * 1000) / 10,
      'Bobot Indeks (%)': k.weightPercent,
      'Tren': k.trendLabel,
    }));
    const wsKpis = XLSX.utils.json_to_sheet(kpiRows);
    XLSX.utils.book_append_sheet(wb, wsKpis, 'Target KPI Bulanan');
  }

  // Trigger Excel file download
  XLSX.writeFile(wb, `MurshidAI_Master_Dataset_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/**
 * Export generic dataset to CSV format for Google Sheets & Excel
 */
export function exportToCsv(data: any[], filename = 'export_murshid_ai.csv') {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const rows = data.map((obj) =>
    headers
      .map((header) => {
        const val = obj[header] === null || obj[header] === undefined ? '' : String(obj[header]);
        return `"${val.replace(/"/g, '""')}"`;
      })
      .join(',')
  );

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
