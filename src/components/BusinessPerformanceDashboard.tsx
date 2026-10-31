import React, { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  FileDown, 
  Sheet, 
  QrCode, 
  Building, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Copy,
  Check,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { Invoice, SupportedLanguage } from '../types';
import { getTranslation } from '../utils/i18n';

interface BusinessPerformanceDashboardProps {
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  lang: SupportedLanguage;
  onExportPdf: () => void;
  onExportExcel: () => void;
  onExportCsv: () => void;
}

export const BusinessPerformanceDashboard: React.FC<BusinessPerformanceDashboardProps> = ({
  invoices,
  setInvoices,
  lang,
  onExportPdf,
  onExportExcel,
  onExportCsv,
}) => {
  const t = getTranslation(lang);

  const [activePaymentModal, setActivePaymentModal] = useState<Invoice | null>(null);
  const [copiedVa, setCopiedVa] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Compute stats
  const totalPaid = invoices
    .filter((inv) => inv.status === 'Paid')
    .reduce((acc, inv) => acc + inv.amount, 0);

  const totalPending = invoices
    .filter((inv) => inv.status === 'Pending')
    .reduce((acc, inv) => acc + inv.amount, 0);

  const totalInvoiced = totalPaid + totalPending;

  // Monthly revenue trend mock data
  const monthlyData = [
    { month: 'Mei', rev: 45000000, sessions: 28 },
    { month: 'Jun', rev: 52500000, sessions: 32 },
    { month: 'Jul', rev: 58000000, sessions: 36 },
    { month: 'Agu', rev: 64500000, sessions: 40 },
    { month: 'Sep', rev: 71000000, sessions: 44 },
    { month: 'Okt', rev: 78100000, sessions: 48 },
  ];

  const maxRev = 85000000;

  // Handle simulated payment
  const handleSimulatePayment = (invoiceId: string) => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === invoiceId ? { ...inv, status: 'Paid', paymentMethod: 'QRIS' } : inv
        )
      );
      setIsProcessingPayment(false);
      setActivePaymentModal(null);
    }, 1200);
  };

  const handleCopyVa = (vaNumber: string) => {
    navigator.clipboard?.writeText(vaNumber);
    setCopiedVa(true);
    setTimeout(() => setCopiedVa(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t.finance.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.finance.subtitle}
            </p>
          </div>

          {/* Export Action Strip */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={onExportPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Unduh Laporan Akhir Bulan PDF</span>
            </button>

            <button
              onClick={onExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <Sheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Ekspor Excel (.xlsx)</span>
            </button>

            <button
              onClick={onExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>Format Spreadsheet (CSV)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Penagihan Bulan Ini</span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-1">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalInvoiced)}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block">
            +22.4% vs kuartal lalu
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Penerimaan Terverifikasi (Lunas)</span>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums mt-1">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalPaid)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {invoices.filter(i => i.status === 'Paid').length} faktur terselesaikan
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Menunggu Pelunasan (Piutang)</span>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 tabular-nums mt-1">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalPending)}
          </div>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 block">
            {invoices.filter(i => i.status === 'Pending').length} faktur menunggu konfirmasi
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Rata-rata Tarif Konsultasi / Jam</span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-1">
            Rp 4.750.000
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Premium Advisory Tier
          </span>
        </div>

      </div>

      {/* 6-Month Revenue & Sesi Bar Chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Tren Pertumbuhan Pendapatan & Volume Sesi (Mei - Oktober 2026)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pertumbuhan stabil dengan kenaikan rerata 14% per bulan
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" />
              <span className="text-slate-600 dark:text-slate-300">Pendapatan (Juta Rp)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-purple-500 inline-block" />
              <span className="text-slate-600 dark:text-slate-300">Total Sesi</span>
            </div>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="grid grid-cols-6 gap-3 pt-6 items-end h-56 border-b border-slate-100 dark:border-slate-800">
          {monthlyData.map((d) => {
            const barHeightPct = Math.round((d.rev / maxRev) * 100);
            return (
              <div key={d.month} className="flex flex-col items-center h-full justify-end group">
                <div className="text-[11px] font-mono text-slate-400 mb-1 group-hover:text-emerald-600 transition-colors tabular-nums">
                  {Math.round(d.rev / 1000000)}M
                </div>
                
                {/* Two stacked or adjacent bars */}
                <div className="w-full max-w-[48px] flex items-end gap-1.5 h-full">
                  <div
                    style={{ height: `${barHeightPct}%` }}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-t-md transition-all duration-300"
                    title={`Pendapatan: Rp ${d.rev.toLocaleString()}`}
                  />
                  <div
                    style={{ height: `${Math.round((d.sessions / 50) * 100)}%` }}
                    className="w-2.5 bg-purple-400 dark:bg-purple-500 rounded-t-md transition-all duration-300"
                    title={`Total: ${d.sessions} sesi`}
                  />
                </div>

                <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-2 font-mono">
                  {d.month}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoicing Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Buku Besar Faktur & Gateway Pembayaran Terpadu
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Dukungan QRIS statis/dinamis, Virtual Account BCA/Mandiri, dan Kartu Kredit
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-5 py-3.5">No. Invoice</th>
                <th className="px-5 py-3.5">Klien & Perusahaan</th>
                <th className="px-5 py-3.5">Deskripsi Layanan</th>
                <th className="px-5 py-3.5 text-right">Nominal</th>
                <th className="px-5 py-3.5">Jatuh Tempo</th>
                <th className="px-5 py-3.5">Metode Bayar</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-medium text-slate-900 dark:text-white">
                    {inv.invoiceNumber}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-slate-900 dark:text-white">{inv.clientName}</div>
                    <div className="text-[11px] text-slate-500">{inv.clientCompany}</div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                    {inv.serviceDescription}
                  </td>
                  <td className="px-5 py-3.5 font-mono font-bold text-slate-900 dark:text-white tabular-nums text-right">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: inv.currency, maximumFractionDigits: 0 }).format(inv.amount)}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-500">
                    {inv.dueDate}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-700 dark:text-slate-300">
                    {inv.paymentMethod || 'Belum dipilih'}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                      inv.status === 'Paid'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : inv.status === 'Pending'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {inv.status === 'Paid' ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                      {inv.status === 'Paid' ? 'Lunas' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {inv.status === 'Pending' ? (
                      <button
                        onClick={() => setActivePaymentModal(inv)}
                        className="px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 rounded-md border border-emerald-300 dark:border-emerald-800 transition-colors cursor-pointer"
                      >
                        Bayar (Simulasi)
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-mono">Terselesaikan</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAYMENT GATEWAY MODAL SIMULATOR */}
      {activePaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Gerbang Pembayaran Instan MurshidAI
                </h3>
              </div>
              <button
                onClick={() => setActivePaymentModal(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="text-xs text-slate-500">Total Tagihan</span>
                <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-0.5">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: activePaymentModal.currency, maximumFractionDigits: 0 }).format(activePaymentModal.amount)}
                </div>
                <div className="text-xs text-slate-500 mt-1 font-mono">
                  {activePaymentModal.invoiceNumber} · {activePaymentModal.clientName}
                </div>
              </div>

              {/* QRIS Code Simulation */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col items-center bg-white dark:bg-slate-800">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-emerald-600" /> Scan QRIS Instan (NMID: ID1020260901)
                </span>
                
                {/* SVG QR Code Simulation */}
                <div className="w-44 h-44 bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-center">
                  <div className="grid grid-cols-6 gap-1 w-full h-full p-1 bg-slate-950 rounded">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-xs ${
                          (i % 2 === 0 || i % 7 === 0 || i === 0 || i === 5 || i === 30 || i === 35)
                            ? 'bg-white'
                            : 'bg-emerald-400'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 mt-2 font-mono">
                  Mendukung GoPay, OVO, Dana, BCA, Livin, dll.
                </span>
              </div>

              {/* Virtual Account Option */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 mb-1">
                  <span className="font-medium">BCA Virtual Account</span>
                  <button
                    onClick={() => handleCopyVa('8277081234567890')}
                    className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium cursor-pointer"
                  >
                    {copiedVa ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedVa ? 'Tersalin' : 'Salin Nomor'}</span>
                  </button>
                </div>
                <div className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                  8277 0812 3456 7890
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleSimulatePayment(activePaymentModal.id)}
                disabled={isProcessingPayment}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm cursor-pointer transition-colors"
              >
                {isProcessingPayment ? (
                  <span>Memverifikasi Pembayaran ke Gateway...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Konfirmasi Pembayaran Selesai (Simulasi Instan)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
