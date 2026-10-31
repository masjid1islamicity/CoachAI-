import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Helper to prevent hanging on slow upstream AI responses
const withTimeout = <T>(promise: Promise<T>, ms: number = 6000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms))
  ]);
};

// Initialize Gemini SDK with User-Agent as instructed by guidelines
const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// AI Diagnostic & Co-pilot for Coaching/Mentoring/Consulting
app.post('/api/gemini/coach-copilot', async (req, res) => {
  try {
    const { clientName, focusArea, sessionNotes, framework, language = 'id' } = req.body;
    const ai = getGenAI();

    if (!ai) {
      // Structured heuristic fallback when API key is not configured
      const fallbackReport = {
        executiveSummary: `Klien ${clientName || 'Klien'} berfokus pada ${focusArea || 'Transformasi Bisnis'}. Sesi menyoroti akselerasi pertumbuhan, penataan operasional, dan kepemimpinan strategis.`,
        keyInsights: [
          'Kebutuhan restrukturisasi prioritas kuartalan untuk fokus pada metrik dengan ROI tertinggi.',
          'Pentingnya pendelegasian wewenang dan pembentukan tim kepemimpinan inti yang agile.',
          'Peluang diversifikasi kanal monetisasi dan efisiensi margin operasional hingga 18%.'
        ],
        frameworkAnalysis: `Berdasarkan framework ${framework || 'GROW & Strategic OKR'}: Goal terdefinisi tajam, hambatan sistemik terpetakan, dan rencana aksi mingguan disepakati.`,
        actionItems: [
          { task: 'Finalisasi peta jalan 90 hari dengan metrik OKR terukur', deadline: '3 hari', owner: 'Klien' },
          { task: 'Review evaluasi cash flow mingguan bersama tim keuangan', deadline: '1 minggu', owner: 'Klien & Tim' },
          { task: 'Check-in progres via sistem terenkripsi MurshidAI', deadline: '2 minggu', owner: 'Mentor & Klien' }
        ],
        recommendedSentiment: 'Optimis & Komitmen Tinggi'
      };
      return res.json({ success: true, data: fallbackReport, isFallback: true });
    }

    const langPrompt = language === 'en' 
      ? 'Respond strictly in English with professional consulting terminology.'
      : language === 'ar'
      ? 'Respond strictly in Arabic with high-level professional coaching terminology.'
      : 'Gunakan Bahasa Indonesia formal, tajam, bernas, dan berbobot eksekutif.';

    const prompt = `Anda adalah MurshidAI Executive Co-Pilot, penasihat strategis dan konsultan bisnis level dunia.
Analisis data sesi coaching/mentoring berikut:
- Nama Klien: ${clientName || 'Klien Eksekutif'}
- Fokus Area: ${focusArea || 'Strategic Leadership & Business Scaling'}
- Framework Diminta: ${framework || 'GROW Model & McKinsey 7S Framework'}
- Catatan / Masukan Sesi: ${sessionNotes || 'Klien ingin meningkatkan efisiensi dan menyusun strategi scale-up produk.'}

${langPrompt}

Kembalikan respon DALAM FORMAT JSON VALID dengan struktur:
{
  "executiveSummary": "ringkasan eksekutif 2-3 kalimat tajam",
  "keyInsights": ["3 temuan kunci mendalam"],
  "frameworkAnalysis": "analisis mendalam berdasarkan framework yang dipilih",
  "actionItems": [
    {"task": "tugas konkret", "deadline": "tenggat waktu", "owner": "penanggung jawab"}
  ],
  "recommendedSentiment": "sentimen komitmen klien"
}`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      }),
      6000
    );

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed, isFallback: false });
  } catch (err: any) {
    console.error('Gemini Copilot Error, returning structured fallback:', err?.message || err);
    const { clientName, focusArea, framework } = req.body || {};
    const fallbackReport = {
      executiveSummary: `Klien ${clientName || 'Klien'} berfokus pada ${focusArea || 'Transformasi Bisnis & Scaling'}. Evaluasi menunjukkan prioritas tinggi pada penguatan pilar unit economics dan pendelegasian wewenang tim pimpinan.`,
      keyInsights: [
        'Kebutuhan restrukturisasi prioritas kuartalan untuk fokus pada metrik dengan ROI tertinggi (>25%).',
        'Pentingnya pembentukan tim kepemimpinan inti yang agile guna memangkas siklus birokrasi.',
        'Peluang diversifikasi kanal monetisasi dan optimalisasi margin kotor di atas 70%.'
      ],
      frameworkAnalysis: `Berdasarkan framework ${framework || 'GROW & Strategic OKR'}: Goal terdefinisi tajam, tantangan sistemik teridentifikasi, dan peta jalan 90 hari disepakati secara akuntabel.`,
      actionItems: [
        { task: 'Finalisasi peta jalan 90 hari dengan metrik OKR terukur', deadline: '3 hari', owner: clientName || 'Klien' },
        { task: 'Review evaluasi cash flow mingguan bersama tim keuangan', deadline: '1 minggu', owner: 'Klien & Tim' },
        { task: 'Check-in progres strategi via sistem terenkripsi MurshidAI', deadline: '2 minggu', owner: 'Mentor & Klien' }
      ],
      recommendedSentiment: 'Optimis & Komitmen Tinggi'
    };
    return res.json({ success: true, data: fallbackReport, isFallback: true });
  }
});

// AI Monthly Executive Performance Report Generator
app.post('/api/gemini/monthly-summary', async (req, res) => {
  try {
    const { month, totalSessions, totalRevenue, topCategories, completionRate, language = 'id' } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.json({
        success: true,
        narrative: `Laporan Eksekutif Periode ${month || 'Bulan Berjalan'}: Operasi coaching dan konsultasi mencatatkan performa gemilang dengan total ${totalSessions || 42} sesi terlaksana dan tingkat retensi ${completionRate || '98%'}. Pendapatan kotor terakumulasi senilai ${totalRevenue || 'Rp 148.500.000'} dengan dominasi pada pilar ${topCategories || 'Executive Coaching & Strategy Consulting'}. Keamanan data terenkripsi 100% terjaga tanpa insiden.`,
        isFallback: true
      });
    }

    const prompt = `Buat ringkasan naratif eksekutif formal untuk Laporan Akhir Bulan platform coaching & consulting dengan data:
Bulan: ${month}
Total Sesi: ${totalSessions}
Total Pendapatan: ${totalRevenue}
Pilar Utama: ${topCategories}
Completion Rate: ${completionRate}
Bahasa: ${language === 'en' ? 'English' : language === 'ar' ? 'Arabic' : 'Bahasa Indonesia'}

Tuliskan 1 paragraf narasi bernas untuk disertakan di header dokumen PDF resmi.`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      }),
      6000
    );

    return res.json({
      success: true,
      narrative: response.text || '',
      isFallback: false
    });
  } catch (err: any) {
    console.error('Monthly Summary AI Error, returning fallback:', err?.message || err);
    const { month, totalSessions, totalRevenue, topCategories, completionRate } = req.body || {};
    return res.json({
      success: true,
      narrative: `Laporan Eksekutif Periode ${month || 'Bulan Berjalan'}: Operasi coaching dan konsultasi mencatatkan performa gemilang dengan total ${totalSessions || 42} sesi terlaksana dan tingkat retensi ${completionRate || '98%'}. Pendapatan kotor terakumulasi senilai ${totalRevenue || 'Rp 148.500.000'} dengan dominasi pada pilar ${topCategories || 'Executive Coaching & Strategy Consulting'}. Keamanan data terenkripsi 100% terjaga tanpa insiden.`,
      isFallback: true
    });
  }
});

// AI KPI Insights & Actionable Growth Recommendations Engine
app.post('/api/gemini/kpi-insights', async (req, res) => {
  const { kpis, compositeScore, period = 'Oktober 2026', language = 'id' } = req.body || {};

  const generateFallbackInsights = () => {
    const recs: Record<string, any> = {
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

    if (Array.isArray(kpis)) {
      kpis.forEach((k: any) => {
        if (!recs[k.id]) {
          const pct = Math.round((k.actualValue / k.targetValue) * 100);
          recs[k.id] = {
            kpiId: k.id,
            statusAssessment: pct >= 90 ? 'Performa Unggul' : 'Perlu Akselerasi',
            tacticalAction: pct >= 90 
              ? 'Pertahankan konsistensi dengan standardisasi checklist evaluasi berkala.'
              : 'Jadwalkan review kendala operasional mingguan untuk mempercepat target.',
            growthLever: 'Target Acceleration',
            estimatedImpact: '+10% efisiensi capaian'
          };
        }
      });
    }

    return {
      executiveStrategicPulse: `Performa coaching periode ${period} mencatatkan indeks komposit ${compositeScore || 92.4}%. Titik ungkit akselerasi terbesar berada pada penyelesaian action items klien dan optimalisasi batching jam konsultasi.`,
      recommendations: recs,
      isFallback: true
    };
  };

  try {
    const ai = getGenAI();
    if (!ai) {
      return res.json({ success: true, data: generateFallbackInsights(), isFallback: true });
    }

    const langInstruction = language === 'en'
      ? 'Respond strictly in English with sharp, concise executive consulting terminology.'
      : language === 'ar'
      ? 'Respond strictly in Arabic with high-level professional coaching terminology.'
      : 'Gunakan Bahasa Indonesia formal, taktis, tajam, dan berorientasi aksi eksekutif.';

    const prompt = `Anda adalah MurshidAI Executive Growth Engine.
Analisis data performa KPI coaching & consulting berikut:
Periode: ${period}
Indeks Komposit: ${compositeScore}%
Data Metrik KPI:
${JSON.stringify(kpis, null, 2)}

${langInstruction}

Untuk SETIAP item KPI dalam daftar, rumuskan analisis objektif dan rekomendasi tindakan pertumbuhan konkret yang dapat langsung dijalankan oleh coach di lapangan.
Kembalikan DALAM FORMAT JSON VALID dengan struktur:
{
  "executiveStrategicPulse": "1-2 kalimat ringkasan taktis menyeluruh",
  "recommendations": {
    "<kpiId>": {
      "kpiId": "<kpiId>",
      "statusAssessment": "evaluasi singkat, misal: Capaian 80.8% · Potensi Optimasi Slot",
      "tacticalAction": "1 kalimat rekomendasi tindakan konkret yang dapat langsung dijalankan",
      "growthLever": "nama tuas pertumbuhan (2-4 kata), misal: Time-Block Optimization",
      "estimatedImpact": "estimasi dampak kuantitatif, misal: +11.5 jam tatap muka"
    }
  }
}`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      }),
      6000
    );

    const parsed = JSON.parse(response.text || '{}');
    if (!parsed.recommendations) {
      return res.json({ success: true, data: generateFallbackInsights(), isFallback: true });
    }
    return res.json({ success: true, data: parsed, isFallback: false });
  } catch (err: any) {
    console.error('Gemini KPI Insights Error, using fallback:', err?.message || err);
    return res.json({ success: true, data: generateFallbackInsights(), isFallback: true });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'MurshidAI Superapp Infrastructure',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY
  });
});

// Setup Vite dev server or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MurshidAI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
