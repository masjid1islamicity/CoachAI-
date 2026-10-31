import React from 'react';
import { 
  Activity, 
  Clock, 
  Star, 
  TrendingUp, 
  Calendar, 
  FileDown, 
  Sheet, 
  Sparkles,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { Session, IslamicDateInfo, PrayerTime, SupportedLanguage } from '../types';
import { getTranslation } from '../utils/i18n';

interface DailyPulseSummaryProps {
  sessions: Session[];
  islamicInfo: IslamicDateInfo;
  prayers: PrayerTime[];
  lang: SupportedLanguage;
  onExportPdf: () => void;
  onExportExcel: () => void;
  onExportCsv: () => void;
  onOpenAiCopilot: () => void;
  onSelectTab: (tab: string) => void;
}

export const DailyPulseSummary: React.FC<DailyPulseSummaryProps> = ({
  sessions,
  islamicInfo,
  prayers,
  lang,
  onExportPdf,
  onExportExcel,
  onExportCsv,
  onOpenAiCopilot,
  onSelectTab
}) => {
  const t = getTranslation(lang);

  // Compute metrics
  const todayStr = '2026-10-31';
  const todaySessions = sessions.filter(s => s.date === todayStr);
  const totalMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const consultingHours = (totalMinutes / 60).toFixed(1);
  const todayRevenue = todaySessions.reduce((acc, s) => acc + s.fee, 0);

  const nextPrayer = prayers.find(p => p.isNext) || prayers[0];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 mb-6 shadow-xs transition-colors duration-200">
      
      {/* Header bar of Daily Pulse */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              {t.dailyPulse.title}
            </h2>
            <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
              · 31 Okt 2026
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitoring performa mentoring, eksekusi strategi konsultasi, dan kepatuhan jadwal secara real-time.
          </p>
        </div>

        {/* Quick Export & AI Action Bar */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={onOpenAiCopilot}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/50 rounded-lg border border-purple-200 dark:border-purple-800 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Co-Pilot</span>
          </button>

          <button
            onClick={onExportPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5 text-rose-500" />
            <span>{t.topBar.exportPdf}</span>
          </button>

          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <Sheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t.topBar.exportExcel}</span>
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 pt-4">
        
        {/* Metric 1: Sesi Hari Ini */}
        <div 
          onClick={() => onSelectTab('sessions')}
          className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-medium">{t.dailyPulse.todaySessions}</span>
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
            {todaySessions.length} <span className="text-xs font-normal text-slate-500">Sesi</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            1 Berlangsung · 1 Mendatang
          </div>
        </div>

        {/* Metric 2: Jam Konsultasi */}
        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-medium">{t.dailyPulse.consultingHours}</span>
            <Clock className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
            {consultingHours} <span className="text-xs font-normal text-slate-500">Jam</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Total {totalMinutes} menit terjadwal
          </div>
        </div>

        {/* Metric 3: Indeks Kepuasan */}
        <div 
          onClick={() => onSelectTab('clients')}
          className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-medium">{t.dailyPulse.satisfactionRate}</span>
            <Star className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
            98.4%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            4.92 / 5.0 rating eksekutif
          </div>
        </div>

        {/* Metric 4: Pendapatan Hari Ini */}
        <div 
          onClick={() => onSelectTab('finance')}
          className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-medium">{t.dailyPulse.todayRevenue}</span>
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
            Rp 10.75M
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
            +18% vs rata-rata harian
          </div>
        </div>

        {/* Metric 5: Kalender Hijriah & Prayer Buffer Shield */}
        <div 
          onClick={() => onSelectTab('islamicCalendar')}
          className="col-span-2 lg:col-span-1 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-medium">{t.dailyPulse.hijriDate}</span>
            <Compass className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {islamicInfo.hijriFormatted}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-teal-600 dark:text-teal-400 mt-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>{nextPrayer.name} ({nextPrayer.time}) · Buffer Aman</span>
          </div>
        </div>

      </div>

    </div>
  );
};
