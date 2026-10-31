import React, { useState, useEffect } from 'react';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Star, 
  Award, 
  Edit3, 
  Save, 
  X, 
  Plus, 
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  Filter,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Lightbulb,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import { MonthlyKpiTarget, KpiInsightRecommendation, SupportedLanguage } from '../types';
import { getTranslation } from '../utils/i18n';

interface MonthlyKpiTrackerProps {
  kpis: MonthlyKpiTarget[];
  setKpis: React.Dispatch<React.SetStateAction<MonthlyKpiTarget[]>>;
  lang: SupportedLanguage;
  onOpenAiCopilot?: (topic: string) => void;
}

const DEFAULT_INSIGHTS: Record<string, KpiInsightRecommendation> = {
  'kpi-1': {
    kpiId: 'kpi-1',
    statusAssessment: 'Capaian 80.8% · Potensi Optimasi Slot',
    tacticalAction: 'Buka slot batching 90 menit pada hari Selasa & Kamis pagi untuk mengonversi 3 coachee enterprise yang berada dalam antrian tunggu.',
    growthLever: 'Time-Block Optimization',
    estimatedImpact: '+11.5 jam tatap muka'
  },
  'kpi-2': {
    kpiId: 'kpi-2',
    statusAssessment: 'Capaian 90.0% · Kinerja Sangat Solid',
    tacticalAction: 'Terapkan konfirmasi otomatis via WhatsApp Business 24 jam sebelum sesi untuk mengeliminasi resiko no-show menjadi 0%.',
    growthLever: 'Automated Retention Shield',
    estimatedImpact: '+4 sesi terselesaikan tepat kuota'
  },
  'kpi-3': {
    kpiId: 'kpi-3',
    statusAssessment: 'Capaian 97.6% · Mendekati Target Maksimal',
    tacticalAction: 'Tawarkan opsi upgrade paket retainer triwulanan dengan insentif audit unit economics bagi klien bernilai tinggi.',
    growthLever: 'Retainer Upsell & Cash Acceleration',
    estimatedImpact: '+Rp 12.500.000 MRR berulang'
  },
  'kpi-4': {
    kpiId: 'kpi-4',
    statusAssessment: 'Capaian 103.5% · Melampaui Standar Industri',
    tacticalAction: 'Kapitalisasi skor kepuasan 98.4% untuk memicu program referral terstruktur dengan 2 coachee level C-Suite.',
    growthLever: 'Advocacy & Organic Pipeline',
    estimatedImpact: '2 referral prospek terverifikasi'
  },
  'kpi-5': {
    kpiId: 'kpi-5',
    statusAssessment: 'Capaian 78.5% · Area Peningkatan Prioritas',
    tacticalAction: 'Pecah penugasan strategis coachee ke dalam sprint mikro 3 hari dan kirim checklist notifikasi via push reminder.',
    growthLever: 'Micro-Commitment Coaching',
    estimatedImpact: '+14% rasio penyelesaian tugas'
  },
  'kpi-6': {
    kpiId: 'kpi-6',
    statusAssessment: 'Capaian 100.0% · Kepatuhan Syariah Sempurna',
    tacticalAction: 'Pertahankan automasi buffer 15 menit dan jadikan jaminan zero-conflict waktu ibadah sebagai diferensiasi brand premium.',
    growthLever: 'Ethical Brand Differentiation',
    estimatedImpact: '100% Zero-Conflict Terjaga'
  }
};

export const MonthlyKpiTracker: React.FC<MonthlyKpiTrackerProps> = ({
  kpis,
  setKpis,
  lang,
  onOpenAiCopilot
}) => {
  const t = getTranslation(lang);

  const [selectedPeriod, setSelectedPeriod] = useState<'current' | 'prev' | 'q4'>('current');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingKpi, setEditingKpi] = useState<MonthlyKpiTarget | null>(null);
  const [tempTarget, setTempTarget] = useState<number>(0);
  const [tempActual, setTempActual] = useState<number>(0);

  // AI Insights State
  const [insights, setInsights] = useState<Record<string, KpiInsightRecommendation>>(() => {
    try {
      const saved = localStorage.getItem('murshid_kpi_insights');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load insights from localStorage:', e);
    }
    return DEFAULT_INSIGHTS;
  });

  const [strategicPulse, setStrategicPulse] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('murshid_kpi_pulse');
      if (saved) return saved;
    } catch {}
    return 'Performa coaching periode Oktober 2026 mencatatkan indeks komposit 92.4%. Titik ungkit akselerasi terbesar berada pada penyelesaian action items klien dan optimalisasi batching jam konsultasi.';
  });

  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [copiedInsightId, setCopiedInsightId] = useState<string | null>(null);

  // Filter by category
  const filteredKpis = kpis.filter((kpi) => {
    if (selectedCategory === 'all') return true;
    return kpi.category === selectedCategory;
  });

  // Calculate weighted overall score
  const totalWeight = kpis.reduce((acc, k) => acc + k.weightPercent, 0) || 100;
  const weightedScore = kpis.reduce((acc, k) => {
    const rawPct = (k.actualValue / k.targetValue) * 100;
    const cappedPct = Math.min(rawPct, 120);
    return acc + (cappedPct * (k.weightPercent / totalWeight));
  }, 0);

  const compositeScore = Math.round(weightedScore * 10) / 10;

  // Persist insights
  useEffect(() => {
    try {
      localStorage.setItem('murshid_kpi_insights', JSON.stringify(insights));
      localStorage.setItem('murshid_kpi_pulse', strategicPulse);
    } catch (e) {
      console.error('Failed to save insights:', e);
    }
  }, [insights, strategicPulse]);

  // Execute AI Insights Engine
  const handleRunAiInsights = async () => {
    setIsLoadingAi(true);
    const periodLabel = selectedPeriod === 'current' ? 'Oktober 2026' : selectedPeriod === 'prev' ? 'September 2026' : 'Kuartal IV (Q4 2026)';

    try {
      const res = await fetch('/api/gemini/kpi-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kpis,
          compositeScore,
          period: periodLabel,
          language: lang,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        if (data.data.recommendations) {
          setInsights(data.data.recommendations);
        }
        if (data.data.executiveStrategicPulse) {
          setStrategicPulse(data.data.executiveStrategicPulse);
        }
      }
    } catch (err) {
      console.warn('AI engine fallback:', err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleCopyOrApplyInsight = (kpi: MonthlyKpiTarget, insight: KpiInsightRecommendation) => {
    const textToCopy = `[AI Growth Recommendation - ${kpi.title}]\nTuas: ${insight.growthLever}\nTindakan: ${insight.tacticalAction}\nEstimasi Dampak: ${insight.estimatedImpact}`;
    navigator.clipboard?.writeText(textToCopy);
    setCopiedInsightId(kpi.id);
    setTimeout(() => setCopiedInsightId(null), 2000);
  };

  // Formatting helpers
  const formatMetric = (val: number, type: string) => {
    if (type === 'currency') {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
      }).format(val);
    }
    if (type === 'percentage') {
      return `${val.toFixed(1)}%`;
    }
    if (type === 'hours') {
      return `${val.toFixed(1)} Jam`;
    }
    return `${val} Sesi`;
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 95) return 'bg-emerald-500 dark:bg-emerald-400';
    if (percent >= 80) return 'bg-sky-500 dark:bg-sky-400';
    if (percent >= 65) return 'bg-amber-500 dark:bg-amber-400';
    return 'bg-rose-500 dark:bg-rose-400';
  };

  const getStatusText = (percent: number) => {
    if (percent >= 100) return 'Melampaui Target';
    if (percent >= 85) return 'On-Track (Mendekati)';
    if (percent >= 70) return 'Perlu Akselerasi';
    return 'Di Bawah Target';
  };

  const handleStartEdit = (kpi: MonthlyKpiTarget) => {
    setEditingKpi(kpi);
    setTempTarget(kpi.targetValue);
    setTempActual(kpi.actualValue);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKpi) return;

    setKpis((prev) =>
      prev.map((k) =>
        k.id === editingKpi.id
          ? {
              ...k,
              targetValue: Number(tempTarget),
              actualValue: Number(tempActual),
            }
          : k
      )
    );
    setEditingKpi(null);
  };

  // Quick increment actual
  const handleQuickIncrement = (kpiId: string, amount: number) => {
    setKpis((prev) =>
      prev.map((k) =>
        k.id === kpiId
          ? {
              ...k,
              actualValue: Math.max(0, Math.round((k.actualValue + amount) * 10) / 10),
            }
          : k
      )
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs transition-colors duration-200 space-y-5">
      
      {/* Module Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Pelacakan Target KPI Bulanan & AI Growth Engine
            </h2>
            <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
              · Evaluasi Objektif & Rekomendasi Taktis
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Metrik performa coaching berbasis data dengan analisis AI langsung di dalam setiap kartu progress bar.
          </p>
        </div>

        {/* Period Selector & AI Engine Triggers */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Period Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              onClick={() => setSelectedPeriod('current')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                selectedPeriod === 'current'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Oktober 2026
            </button>
            <button
              onClick={() => setSelectedPeriod('prev')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                selectedPeriod === 'prev'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              September 2026
            </button>
            <button
              onClick={() => setSelectedPeriod('q4')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                selectedPeriod === 'q4'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Kuartal IV (Q4)
            </button>
          </div>

          {/* AI Insights Engine Trigger Button */}
          <button
            onClick={handleRunAiInsights}
            disabled={isLoadingAi}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            {isLoadingAi ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Menganalisis Kinerja...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Jalankan AI Insights Engine</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Composite Overall Performance Banner */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Indeks Capaian Komposit Keseluruhan (Weighted Coaching Index)
              </span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 font-bold">
                {compositeScore >= 90 ? 'Grade A: Performa Sangat Unggul' : 'Grade B: Sesuai Target'}
              </span>
            </div>
            <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums mt-1">
              {compositeScore}% <span className="text-xs font-normal text-slate-500 font-sans">dari standar kinerja target</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="text-right">
              <span className="text-slate-400 text-[11px] block">Target Tercapai</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                {kpis.filter((k) => (k.actualValue / k.targetValue) >= 0.9).length} / {kpis.length} KPI
              </span>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
            <div className="text-right">
              <span className="text-slate-400 text-[11px] block">Tenggat Waktu</span>
              <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">31 Okt 2026</span>
            </div>
          </div>
        </div>

        {/* Master Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-3 bg-slate-200 dark:bg-slate-700/80 rounded-full overflow-hidden relative">
            <div
              style={{ width: `${Math.min(compositeScore, 100)}%` }}
              className={`h-full rounded-full transition-all duration-500 ${
                compositeScore >= 90
                  ? 'bg-emerald-500 dark:bg-emerald-400'
                  : compositeScore >= 75
                  ? 'bg-sky-500 dark:bg-sky-400'
                  : 'bg-amber-500 dark:bg-amber-400'
              }`}
            />
          </div>
          {/* Milestone Ticks */}
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>0% Mulai</span>
            <span>70% Batas Minimal</span>
            <span>85% Standar Operasi</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Target Sempurna</span>
          </div>
        </div>

        {/* Holistic AI Executive Strategic Pulse */}
        {strategicPulse && (
          <div className="mt-2 p-3 bg-purple-50/70 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800/60 flex items-start gap-2.5">
            <div className="p-1 bg-purple-600 text-white rounded-md shrink-0 mt-0.5 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 text-xs">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className="font-bold text-purple-950 dark:text-purple-200">
                  Executive Strategic Pulse
                </span>
                <span className="text-[10px] font-mono text-purple-700 dark:text-purple-400">
                  Analisis Gemini AI
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans text-[11px]">
                {strategicPulse}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Category Filter Pills (Functional Buttons) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
          <Filter className="w-3.5 h-3.5" />
          Kategori:
        </span>
        {[
          { id: 'all', label: 'Semua Pilar' },
          { id: 'operational', label: 'Operasional & Jam' },
          { id: 'financial', label: 'Finansial & Billing' },
          { id: 'quality', label: 'Mutu Layanan & CSAT' },
          { id: 'ethics', label: 'Integritas & Waktu Ibadah' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-xs font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* KPI Cards Grid with Progress Bars & Integrated AI Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredKpis.map((kpi) => {
          const percent = Math.round((kpi.actualValue / kpi.targetValue) * 1000) / 10;
          const clampedPercent = Math.min(percent, 100);
          const barColor = getProgressColor(percent);
          const statusText = getStatusText(percent);
          const insight = insights[kpi.id];

          return (
            <div
              key={kpi.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-2xs flex flex-col justify-between"
            >
              <div>
                {/* Card Top: Title, Category Marker, Edit Button */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                      Bobot: {kpi.weightPercent}% · {kpi.category}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 leading-snug">
                      {kpi.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleStartEdit(kpi)}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Sesuaikan Target atau Capaian"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                  {kpi.description}
                </p>

                {/* Progress Numbers */}
                <div className="flex items-baseline justify-between mb-1.5 font-mono">
                  <div className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
                    {formatMetric(kpi.actualValue, kpi.formatType)}
                  </div>
                  <div className="text-xs text-slate-400 tabular-nums">
                    Target: {formatMetric(kpi.targetValue, kpi.formatType)}
                  </div>
                </div>

                {/* VISUAL PROGRESS BAR */}
                <div className="space-y-1">
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${clampedPercent}%` }}
                      className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className={`font-mono font-bold ${
                      percent >= 90
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : percent >= 75
                        ? 'text-sky-600 dark:text-sky-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      {percent}% tercapai
                    </span>
                    <span className="text-[10px] text-slate-400 font-sans">
                      {statusText}
                    </span>
                  </div>
                </div>

                {/* DIRECT IN-CARD AI GROWTH RECOMMENDATION */}
                <div className="mt-3.5 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <span className="text-[11px] font-bold text-slate-900 dark:text-white">
                        AI Growth Recommendation
                      </span>
                    </div>

                    {insight && (
                      <span className="text-[9px] font-mono text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800 font-semibold truncate max-w-[130px]">
                        {insight.growthLever}
                      </span>
                    )}
                  </div>

                  {insight ? (
                    <div className="p-2.5 rounded-lg bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 text-xs space-y-1.5">
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans text-[11px]">
                        {insight.tacticalAction}
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t border-purple-100/60 dark:border-purple-900/40 text-[10px]">
                        <span className="text-purple-800 dark:text-purple-300 font-medium">
                          Dampak: <strong className="font-mono text-purple-950 dark:text-purple-200">{insight.estimatedImpact}</strong>
                        </span>

                        <button
                          onClick={() => handleCopyOrApplyInsight(kpi, insight)}
                          className="text-[10px] font-semibold text-purple-700 dark:text-purple-300 hover:underline cursor-pointer flex items-center gap-1"
                        >
                          {copiedInsightId === kpi.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span className="text-emerald-600 dark:text-emerald-400">Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Salin Aksi</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 text-[11px] text-slate-400 italic">
                      Klik &quot;Jalankan AI Insights Engine&quot; untuk rekomendasi.
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer: Trend Note & Quick Adjust Affordance */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  {kpi.trend === 'up' ? (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : kpi.trend === 'down' ? (
                    <TrendingDown className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  ) : (
                    <Minus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                  <span className="truncate max-w-[130px]">{kpi.trendLabel}</span>
                </div>

                {/* Quick Increment Buttons (e.g. +1 Sesi / +1.5 Jam) */}
                <div className="flex items-center gap-1">
                  {kpi.formatType === 'hours' && (
                    <button
                      onClick={() => handleQuickIncrement(kpi.id, 1.5)}
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                      title="Tambah 1.5 Jam Konsultasi"
                    >
                      +1.5j
                    </button>
                  )}
                  {kpi.formatType === 'number' && (
                    <button
                      onClick={() => handleQuickIncrement(kpi.id, 1)}
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                      title="Tambah 1 Sesi Selesai"
                    >
                      +1 Sesi
                    </button>
                  )}
                  {kpi.formatType === 'percentage' && kpi.id !== 'kpi-6' && (
                    <button
                      onClick={() => handleQuickIncrement(kpi.id, 0.5)}
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                      title="Tambah 0.5% Skor"
                    >
                      +0.5%
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* KPI Target Edit Modal */}
      {editingKpi && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Sesuaikan Target KPI: {editingKpi.title}
                </h3>
              </div>
              <button
                onClick={() => setEditingKpi(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Nilai Target Objektif ({editingKpi.metricUnit})
                </label>
                <input
                  type="number"
                  step={editingKpi.formatType === 'currency' ? 1000000 : 0.1}
                  required
                  value={tempTarget}
                  onChange={(e) => setTempTarget(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Capaian Realisasi Saat Ini ({editingKpi.metricUnit})
                </label>
                <input
                  type="number"
                  step={editingKpi.formatType === 'currency' ? 1000000 : 0.1}
                  required
                  value={tempActual}
                  onChange={(e) => setTempActual(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg text-xs text-slate-500 space-y-1">
                <span className="font-semibold block text-slate-700 dark:text-slate-300">Estimasi Progres:</span>
                <div className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {tempTarget > 0 ? ((tempActual / tempTarget) * 100).toFixed(1) : 0}%
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingKpi(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
