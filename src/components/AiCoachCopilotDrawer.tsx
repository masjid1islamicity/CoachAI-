import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  Lightbulb, 
  Target, 
  ArrowRight,
  BookOpen,
  Cpu
} from 'lucide-react';
import { Session, SupportedLanguage } from '../types';
import { getTranslation } from '../utils/i18n';

interface AiCoachCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: SupportedLanguage;
  initialSession?: Session | null;
  onApplyActionItems?: (sessionId: string, newItems: any[]) => void;
}

export const AiCoachCopilotDrawer: React.FC<AiCoachCopilotDrawerProps> = ({
  isOpen,
  onClose,
  lang,
  initialSession,
  onApplyActionItems,
}) => {
  const t = getTranslation(lang);

  const [clientName, setClientName] = useState(initialSession?.clientName || 'Sarah Jenkins');
  const [focusArea, setFocusArea] = useState(initialSession?.title || 'Executive Scaling & Series B Governance');
  const [framework, setFramework] = useState('GROW Model & Strategic OKR');
  const [rawNotes, setRawNotes] = useState(
    'Klien ingin mempercepat transisi bisnis ke model enterprise B2B dengan margin di atas 70%. Perlu evaluasi hiring VP of Sales dan restrukturisasi meeting mingguan tim eksekutif.'
  );

  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const res = await fetch('/api/gemini/coach-copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          focusArea,
          framework,
          sessionNotes: rawNotes,
          language: lang,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setAnalysisResult(data.data);
      } else {
        throw new Error(data.error || 'Gagal memproses');
      }
    } catch (err) {
      console.warn('Fallback to local diagnostic:', err);
      // Client-side structured fallback
      setAnalysisResult({
        executiveSummary: `Klien ${clientName} menunjukkan kesiapan matang untuk akselerasi ${focusArea}. Rekomendasi utama berpusat pada penetapan OKR agresif dan pembentukan komite penasihat eksekutif.`,
        keyInsights: [
          'Prioritaskan akuisisi akun enterprise dengan nilai ACV > Rp 500M untuk menopang margin 72%.',
          'Eliminasi bottleneck koordinasi mingguan dengan mengadopsi kerangka kerja asinkronus.',
          'Lakukan audit kepatuhan regulasi data untuk mempercepat konversi pipeline perbankan.'
        ],
        frameworkAnalysis: `Evaluasi melalui kerangka ${framework}: Goal jelas, Reality tantangan hiring terpetakan, Options diversifikasi vendor tersedia, dan Will komitmen klien berada pada skor 9.4/10.`,
        actionItems: [
          { task: 'Finalisasi job description & scorecard VP of Sales', deadline: '3 hari', owner: 'Klien' },
          { task: 'Penyusunan dashboard keuangan unit economics di MurshidAI', deadline: '1 minggu', owner: 'Klien & Tim' },
          { task: 'Check-in progres strategi via ruang virtual terenkripsi', deadline: '2 minggu', owner: 'Mentor & Klien' }
        ],
        recommendedSentiment: 'Optimis & Komitmen Tinggi'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyToSession = () => {
    if (!initialSession || !analysisResult?.actionItems || !onApplyActionItems) return;
    const formatted = analysisResult.actionItems.map((act: any, i: number) => ({
      id: `ai-act-${Date.now()}-${i}`,
      task: act.task,
      deadline: '2026-11-10',
      owner: act.owner || clientName,
      completed: false,
    }));
    onApplyActionItems(initialSession.id, formatted);
    alert('Rencana aksi AI berhasil diimpor ke sesi!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-2xl h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-50 dark:bg-purple-950/40 rounded-lg text-purple-600 dark:text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {t.aiCopilot.title}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {t.aiCopilot.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form and Content Viewport */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          <form onSubmit={handleRunAnalysis} className="space-y-3.5 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Nama Klien
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {t.aiCopilot.frameworkSelector}
                </label>
                <select
                  value={framework}
                  onChange={(e) => setFramework(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="GROW Model & Strategic OKR">GROW Model & Strategic OKR</option>
                  <option value="McKinsey 7S Framework">McKinsey 7S Organizational Framework</option>
                  <option value="Business Model Canvas & Unit Economics">Business Model Canvas & Unit Economics</option>
                  <option value="Executive 360 Feedback Leadership">Executive 360 Leadership Diagnostics</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Fokus Sesi & Isu Strategis
              </label>
              <input
                type="text"
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Catatan Mentoring / Transkrip Singkat
              </label>
              <textarea
                rows={3}
                value={rawNotes}
                onChange={(e) => setRawNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500 leading-relaxed font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500 rounded-lg shadow-xs cursor-pointer transition-colors"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Memproses Diagnosis Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.aiCopilot.analyzeSession}</span>
                </>
              )}
            </button>
          </form>

          {/* Analysis Results Display */}
          {analysisResult && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Executive Summary Card */}
              <div className="p-4 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                    {t.aiCopilot.executiveSummary}
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    {analysisResult.recommendedSentiment || 'Optimis'}
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {analysisResult.executiveSummary}
                </p>
              </div>

              {/* Key Insights */}
              {analysisResult.keyInsights && (
                <div className="p-4 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    {t.aiCopilot.keyInsights}
                  </h3>
                  <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {analysisResult.keyInsights.map((insight: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="font-mono text-purple-600 font-bold shrink-0">{idx + 1}.</span>
                        <span>{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Framework Analysis */}
              {analysisResult.frameworkAnalysis && (
                <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-800/60 text-xs text-purple-950 dark:text-purple-200 space-y-1">
                  <span className="font-bold block">Evaluasi Framework ({framework}):</span>
                  <p className="leading-relaxed">{analysisResult.frameworkAnalysis}</p>
                </div>
              )}

              {/* Structured Action Items */}
              {analysisResult.actionItems && (
                <div className="p-4 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-emerald-600" />
                      {t.aiCopilot.actionPlan}
                    </h3>
                    {initialSession && onApplyActionItems && (
                      <button
                        onClick={handleApplyToSession}
                        className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        Terapkan ke Sesi Ini
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {analysisResult.actionItems.map((act: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-medium text-slate-800 dark:text-slate-200">{act.task}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 shrink-0">
                          <span>{act.owner}</span>
                          <span>·</span>
                          <span>{act.deadline}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
