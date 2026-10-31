import { Session, ClientProfile, Invoice, ThirdPartyConfig, NotificationItem, MonthlyKpiTarget } from '../types';

export const INITIAL_SESSIONS: Session[] = [
  {
    id: 'SES-2026-001',
    title: 'Executive Scaling & Series B Governance',
    clientName: 'Sarah Jenkins',
    clientAvatar: '/src/assets/images/avatar_client_founder_1793447600202.jpg',
    clientCompany: 'Aura Logistics Tech',
    clientEmail: 'sarah.jenkins@auralogistics.io',
    mentorName: 'Dr. Tariq Al-Mansoor',
    mentorAvatar: '/src/assets/images/avatar_mentor_lead_1793447599005.jpg',
    type: 'Executive Mentoring',
    date: '2026-10-31',
    time: '10:00',
    durationMinutes: 60,
    status: 'In Progress',
    fee: 4500000,
    currency: 'IDR',
    meetingUrl: 'https://meet.murshid.ai/room-exec-001',
    hijriDate: '20 Jumada al-Ula 1448 H',
    prayerBufferConflict: false,
    isEncrypted: true,
    encryptedNotes: 'E2E::a8f3b2019c44::b91d248c89df11c4708a2df149ef34a10c8f855d9d',
    actionItems: [
      { id: 'act-1', task: 'Audit struktur unit economics Q4', deadline: '2026-11-04', owner: 'Sarah J.', completed: true },
      { id: 'act-2', task: 'Finalisasi hiring VP of Engineering', deadline: '2026-11-08', owner: 'Sarah J.', completed: false },
      { id: 'act-3', task: 'Review board deck bersama komite penasihat', deadline: '2026-11-12', owner: 'Dr. Tariq', completed: false }
    ],
    diagnosticScore: 92,
    tags: ['Series B', 'Governance', 'Board Advisory']
  },
  {
    id: 'SES-2026-002',
    title: 'AI Engineering Roadmap & Enterprise Go-To-Market',
    clientName: 'Reza Pratama, M.Sc',
    clientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    clientCompany: 'Sinergi Solusi Cloud',
    clientEmail: 'reza@sinergicloud.co.id',
    mentorName: 'Ir. Siti Rahmawati',
    mentorAvatar: '/src/assets/images/avatar_consultant_tech_1793447600120.jpg',
    type: 'Strategic Consulting',
    date: '2026-10-31',
    time: '13:30',
    durationMinutes: 75,
    status: 'Upcoming',
    fee: 6250000,
    currency: 'IDR',
    meetingUrl: 'https://meet.murshid.ai/room-strat-002',
    hijriDate: '20 Jumada al-Ula 1448 H',
    prayerBufferConflict: false,
    isEncrypted: true,
    encryptedNotes: 'E2E::38f89c440a1b::77d8a9f0c5b38290ae51392dfa140b2e88a',
    actionItems: [
      { id: 'act-4', task: 'Benchmark arsitektur model AI lokal vs cloud API', deadline: '2026-11-05', owner: 'Reza P.', completed: false },
      { id: 'act-5', task: 'Penyusunan penawaran POC perbankan syariah', deadline: '2026-11-09', owner: 'Ir. Siti', completed: false }
    ],
    diagnosticScore: 88,
    tags: ['Enterprise B2B', 'AI Roadmap', 'Cloud Architecture']
  },
  {
    id: 'SES-2026-003',
    title: 'High-Impact Leadership & Emotional Resilience',
    clientName: 'Nadia Kusuma',
    clientAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    clientCompany: 'Nuansa Media Digital',
    clientEmail: 'nadia@nuansamedia.com',
    mentorName: 'Dr. Tariq Al-Mansoor',
    mentorAvatar: '/src/assets/images/avatar_mentor_lead_1793447599005.jpg',
    type: '1-on-1 Coaching',
    date: '2026-11-01',
    time: '09:00',
    durationMinutes: 60,
    status: 'Upcoming',
    fee: 3800000,
    currency: 'IDR',
    meetingUrl: 'https://meet.murshid.ai/room-coach-003',
    hijriDate: '21 Jumada al-Ula 1448 H',
    prayerBufferConflict: false,
    isEncrypted: true,
    encryptedNotes: 'E2E::55c709e1bb88::43f8e91024bd38ca55490a1f',
    actionItems: [
      { id: 'act-6', task: 'Implementasi 360-degree feedback kuartalan', deadline: '2026-11-07', owner: 'Nadia K.', completed: true }
    ],
    diagnosticScore: 85,
    tags: ['Resilience', 'People Management', 'GROW Model']
  },
  {
    id: 'SES-2026-004',
    title: 'Founder Mastermind: International Market Entry (GCC & SEA)',
    clientName: 'Farhan Zulkarnain',
    clientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    clientCompany: 'Fintech Nusa Halal',
    clientEmail: 'farhan@nusahalal.id',
    mentorName: 'Ir. Siti Rahmawati',
    mentorAvatar: '/src/assets/images/avatar_consultant_tech_1793447600120.jpg',
    type: 'Group Mastermind',
    date: '2026-10-30',
    time: '16:00',
    durationMinutes: 90,
    status: 'Completed',
    fee: 8500000,
    currency: 'IDR',
    meetingUrl: 'https://meet.murshid.ai/room-group-004',
    hijriDate: '19 Jumada al-Ula 1448 H',
    prayerBufferConflict: false,
    isEncrypted: true,
    encryptedNotes: 'E2E::99aa3312cb66::44ea5901cb0098df',
    actionItems: [
      { id: 'act-7', task: 'Dokumentasi kepatuhan regulasi OJK & SAMA', deadline: '2026-11-02', owner: 'Farhan Z.', completed: true },
      { id: 'act-8', task: 'MoU kerjasama kanal perbankan Riyadh', deadline: '2026-11-15', owner: 'Farhan Z.', completed: false }
    ],
    diagnosticScore: 94,
    tags: ['Cross-Border', 'Halal Fintech', 'Mastermind']
  },
  {
    id: 'SES-2026-005',
    title: 'Financial Restructuring & Sharia Compliance Advisory',
    clientName: 'Bambang Hartono',
    clientAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    clientCompany: 'Barakah Food Chain',
    clientEmail: 'bambang@barakahfoods.com',
    mentorName: 'Dr. Tariq Al-Mansoor',
    mentorAvatar: '/src/assets/images/avatar_mentor_lead_1793447599005.jpg',
    type: 'Strategic Consulting',
    date: '2026-10-28',
    time: '11:00',
    durationMinutes: 90,
    status: 'Completed',
    fee: 7500000,
    currency: 'IDR',
    meetingUrl: 'https://meet.murshid.ai/room-strat-005',
    hijriDate: '17 Jumada al-Ula 1448 H',
    prayerBufferConflict: false,
    isEncrypted: true,
    encryptedNotes: 'E2E::44aa77bb9900::99df1234ea56bc78',
    actionItems: [
      { id: 'act-9', task: 'Rebalancing utang konvensional ke sukuk ijarah', deadline: '2026-11-10', owner: 'Bambang H.', completed: true }
    ],
    diagnosticScore: 90,
    tags: ['Sukuk', 'Capital Structure', 'Sharia Compliance']
  }
];

export const INITIAL_CLIENTS: ClientProfile[] = [
  {
    id: 'CLI-001',
    name: 'Sarah Jenkins',
    company: 'Aura Logistics Tech',
    role: 'Founder & CEO',
    email: 'sarah.jenkins@auralogistics.io',
    avatar: '/src/assets/images/avatar_client_founder_1793447600202.jpg',
    activeTier: 'Enterprise Retainer',
    totalSessions: 14,
    completedSessions: 12,
    satisfactionScore: 4.95,
    joinDate: '2026-01-15',
    confidentialVaultNotes: 'Evaluasi kepemimpinan eksekutif menuju putaran Series B $15M. Fokus restrukturisasi hierarki manajemen puncak.',
    radarScores: {
      leadership: 92,
      strategy: 90,
      execution: 85,
      resilience: 88,
      financialAcumen: 84,
      teamAlignment: 89
    }
  },
  {
    id: 'CLI-002',
    name: 'Reza Pratama, M.Sc',
    company: 'Sinergi Solusi Cloud',
    role: 'CTO & Co-Founder',
    email: 'reza@sinergicloud.co.id',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    activeTier: 'Executive Advisory',
    totalSessions: 8,
    completedSessions: 7,
    satisfactionScore: 4.90,
    joinDate: '2026-03-20',
    confidentialVaultNotes: 'Penguatan fondasi engineering lead dan transisi menuju arsitektur multi-tenant berstandar ISO 27001.',
    radarScores: {
      leadership: 80,
      strategy: 94,
      execution: 95,
      resilience: 82,
      financialAcumen: 78,
      teamAlignment: 86
    }
  },
  {
    id: 'CLI-003',
    name: 'Nadia Kusuma',
    company: 'Nuansa Media Digital',
    role: 'Managing Director',
    email: 'nadia@nuansamedia.com',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    activeTier: 'Growth Mentee',
    totalSessions: 6,
    completedSessions: 5,
    satisfactionScore: 4.88,
    joinDate: '2026-05-10',
    confidentialVaultNotes: 'Peningkatan kapasitas resolusi konflik dan pembangunan kultur kerja berbasis kepercayaan antar departemen.',
    radarScores: {
      leadership: 86,
      strategy: 82,
      execution: 80,
      resilience: 91,
      financialAcumen: 83,
      teamAlignment: 88
    }
  },
  {
    id: 'CLI-004',
    name: 'Farhan Zulkarnain',
    company: 'Fintech Nusa Halal',
    role: 'Chief Executive Officer',
    email: 'farhan@nusahalal.id',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    activeTier: 'Enterprise Retainer',
    totalSessions: 16,
    completedSessions: 15,
    satisfactionScore: 4.98,
    joinDate: '2025-11-01',
    confidentialVaultNotes: 'Ekspansi regional ke pasar Timur Tengah (Riyadh & Dubai), lisensi open-banking syariah.',
    radarScores: {
      leadership: 95,
      strategy: 96,
      execution: 92,
      resilience: 94,
      financialAcumen: 91,
      teamAlignment: 93
    }
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'INV-2026-089',
    invoiceNumber: 'INV/2026/10/089',
    clientName: 'Sarah Jenkins',
    clientCompany: 'Aura Logistics Tech',
    amount: 18000000,
    currency: 'IDR',
    issueDate: '2026-10-25',
    dueDate: '2026-11-05',
    status: 'Paid',
    paymentMethod: 'QRIS',
    serviceDescription: 'Paket Executive Advisory Bulanan (4 Sesi Mentoring + E2EE Vault)'
  },
  {
    id: 'INV-2026-090',
    invoiceNumber: 'INV/2026/10/090',
    clientName: 'Reza Pratama, M.Sc',
    clientCompany: 'Sinergi Solusi Cloud',
    amount: 12500000,
    currency: 'IDR',
    issueDate: '2026-10-28',
    dueDate: '2026-11-08',
    status: 'Pending',
    paymentMethod: 'Virtual Account BCA',
    serviceDescription: 'Advisory Strategic Consulting AI Architecture & GTM POC'
  },
  {
    id: 'INV-2026-091',
    invoiceNumber: 'INV/2026/10/091',
    clientName: 'Farhan Zulkarnain',
    clientCompany: 'Fintech Nusa Halal',
    amount: 25000000,
    currency: 'IDR',
    issueDate: '2026-10-15',
    dueDate: '2026-10-30',
    status: 'Paid',
    paymentMethod: 'Credit Card',
    serviceDescription: 'Mastermind Retainer Cross-Border GCC Scaling Hub'
  },
  {
    id: 'INV-2026-092',
    invoiceNumber: 'INV/2026/10/092',
    clientName: 'Nadia Kusuma',
    clientCompany: 'Nuansa Media Digital',
    amount: 7600000,
    currency: 'IDR',
    issueDate: '2026-10-29',
    dueDate: '2026-11-09',
    status: 'Pending',
    paymentMethod: 'Mandiri Bill',
    serviceDescription: '1-on-1 Leadership & Emotional Resilience Coaching (Bi-weekly)'
  },
  {
    id: 'INV-2026-085',
    invoiceNumber: 'INV/2026/09/085',
    clientName: 'Bambang Hartono',
    clientCompany: 'Barakah Food Chain',
    amount: 15000000,
    currency: 'IDR',
    issueDate: '2026-09-20',
    dueDate: '2026-10-05',
    status: 'Paid',
    paymentMethod: 'Bank Transfer',
    serviceDescription: 'Restrukturisasi Sukuk Finansial & Sharia Audit Review'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Sesi Virtual Segera Dimulai',
    message: 'Sesi Executive Mentoring bersama Sarah Jenkins dimulai dalam 15 menit. Enkripsi E2E siap aktif.',
    timestamp: '10 menit yang lalu',
    type: 'session_alert',
    read: false,
    channel: 'Push'
  },
  {
    id: 'notif-2',
    title: 'Peringatan Buffer Waktu Sholat',
    message: 'Jadwal sesi 13:30 berada 1 jam 44 menit dari waktu sholat Ashar (15:04). Jadwal aman dan terlindungi.',
    timestamp: '45 menit yang lalu',
    type: 'prayer_buffer',
    read: false,
    channel: 'WhatsApp'
  },
  {
    id: 'notif-3',
    title: 'Pembayaran Diterima via QRIS Instan',
    message: 'Invoice INV/2026/10/089 senilai Rp 18.000.000 dari Aura Logistics Tech telah terverifikasi lunas.',
    timestamp: '2 jam yang lalu',
    type: 'invoice_reminder',
    read: true,
    channel: 'Push'
  },
  {
    id: 'notif-4',
    title: 'Laporan Otomatis Akhir Bulan Tersedia',
    message: 'Laporan Kinerja Bulanan Oktober 2026 siap diunduh dalam format PDF Eksekutif dan master dataset Excel.',
    timestamp: '1 hari yang lalu',
    type: 'task_followup',
    read: true,
    channel: 'Email'
  }
];

export const INITIAL_INTEGRATIONS: ThirdPartyConfig[] = [
  {
    id: 'int-1',
    name: 'Google Calendar API',
    provider: 'Google Calendar',
    category: 'calendar',
    connected: true,
    lastSync: 'Hari ini, 10:45 WIB',
    apiKeyMasked: 'AIzaSyD-•••••••••••••••••••••••••K90',
    webhookUrl: 'https://api.murshid.ai/v1/integrations/google-calendar/sync'
  },
  {
    id: 'int-2',
    name: 'Zoom / Google Meet Gateway',
    provider: 'Zoom / Meet',
    category: 'video',
    connected: true,
    lastSync: 'Hari ini, 09:30 WIB',
    apiKeyMasked: 'zoom_sec_•••••••••••••••••••••••8X7',
    webhookUrl: 'https://api.murshid.ai/v1/integrations/virtual-room/webhook'
  },
  {
    id: 'int-3',
    name: 'WhatsApp Business API Automated Reminders',
    provider: 'WhatsApp Business',
    category: 'notification',
    connected: true,
    lastSync: 'Hari ini, 10:50 WIB',
    apiKeyMasked: 'wa_live_••••••••••••••••••••••••3M2',
    webhookUrl: 'https://api.murshid.ai/v1/integrations/whatsapp/reminders'
  },
  {
    id: 'int-4',
    name: 'Midtrans Payment Gateway (QRIS & VA)',
    provider: 'Midtrans Payment',
    category: 'payment',
    connected: true,
    lastSync: 'Hari ini, 10:52 WIB',
    apiKeyMasked: 'Mid-server-•••••••••••••••••••••1P4',
    webhookUrl: 'https://api.murshid.ai/v1/integrations/midtrans/notification'
  },
  {
    id: 'int-5',
    name: 'Stripe Global Enterprise Gateway',
    provider: 'Stripe Global',
    category: 'payment',
    connected: true,
    lastSync: 'Kemarin, 18:20 WIB',
    apiKeyMasked: 'sk_live_••••••••••••••••••••••••9W1',
    webhookUrl: 'https://api.murshid.ai/v1/integrations/stripe/webhook'
  }
];

export const INITIAL_MONTHLY_KPIS: MonthlyKpiTarget[] = [
  {
    id: 'kpi-1',
    category: 'operational',
    title: 'Jam Konsultasi Eksekutif',
    description: 'Total jam tatap muka pembinaan langsung dengan klien',
    metricUnit: 'Jam',
    targetValue: 60,
    actualValue: 48.5,
    formatType: 'hours',
    weightPercent: 20,
    trend: 'up',
    trendLabel: '+6.5 jam vs bulan lalu'
  },
  {
    id: 'kpi-2',
    category: 'operational',
    title: 'Volume Sesi Terlaksana',
    description: 'Sesi terselesaikan tanpa pembatalan sepihak',
    metricUnit: 'Sesi',
    targetValue: 40,
    actualValue: 36,
    formatType: 'number',
    weightPercent: 20,
    trend: 'up',
    trendLabel: '90% tercapai'
  },
  {
    id: 'kpi-3',
    category: 'financial',
    title: 'Target Penerimaan Billing Bulanan',
    description: 'Pendapatan invoice yang berhasil diselesaikan via gateway',
    metricUnit: 'IDR',
    targetValue: 80000000,
    actualValue: 78100000,
    formatType: 'currency',
    weightPercent: 25,
    trend: 'up',
    trendLabel: '97.6% dari target Rp 80M'
  },
  {
    id: 'kpi-4',
    category: 'quality',
    title: 'Indeks Kepuasan & Net Promoter (CSAT)',
    description: 'Skor survei kepuasan digital klien setelah sesi',
    metricUnit: '%',
    targetValue: 95,
    actualValue: 98.4,
    formatType: 'percentage',
    weightPercent: 15,
    trend: 'up',
    trendLabel: '+3.4% melampaui standar'
  },
  {
    id: 'kpi-5',
    category: 'quality',
    title: 'Penyelesaian Action Items Klien',
    description: 'Rasio penyelesaian tugas strategis coachee tepat waktu',
    metricUnit: '%',
    targetValue: 85,
    actualValue: 78.5,
    formatType: 'percentage',
    weightPercent: 10,
    trend: 'stable',
    trendLabel: '78.5% dieksekusi'
  },
  {
    id: 'kpi-6',
    category: 'ethics',
    title: 'Kepatuhan Buffer Waktu Sholat',
    description: '100% sesi bebas benturan waktu ibadah fardhu',
    metricUnit: '%',
    targetValue: 100,
    actualValue: 100,
    formatType: 'percentage',
    weightPercent: 10,
    trend: 'stable',
    trendLabel: 'Nol insiden benturan'
  }
];

