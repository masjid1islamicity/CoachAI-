export type SessionType = 
  | '1-on-1 Coaching'
  | 'Executive Mentoring'
  | 'Strategic Consulting'
  | 'Group Mastermind';

export type SessionStatus = 'Upcoming' | 'In Progress' | 'Completed' | 'Cancelled';

export interface ActionItem {
  id: string;
  task: string;
  deadline: string;
  owner: string;
  completed: boolean;
}

export interface Session {
  id: string;
  title: string;
  clientName: string;
  clientAvatar: string;
  clientCompany: string;
  clientEmail: string;
  mentorName: string;
  mentorAvatar: string;
  type: SessionType;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  status: SessionStatus;
  fee: number;
  currency: 'IDR' | 'USD' | 'SAR';
  meetingUrl: string;
  hijriDate: string;
  prayerBufferConflict: boolean;
  isEncrypted: boolean;
  encryptedNotes: string; // Ciphertext or raw
  actionItems: ActionItem[];
  diagnosticScore: number;
  tags: string[];
}

export interface ClientProfile {
  id: string;
  name: string;
  company: string;
  role: string;
  email: string;
  avatar: string;
  activeTier: 'Growth Mentee' | 'Executive Advisory' | 'Enterprise Retainer';
  totalSessions: number;
  completedSessions: number;
  satisfactionScore: number; // e.g. 4.9
  joinDate: string;
  confidentialVaultNotes: string;
  radarScores: {
    leadership: number;
    strategy: number;
    execution: number;
    resilience: number;
    financialAcumen: number;
    teamAlignment: number;
  };
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientCompany: string;
  amount: number;
  currency: 'IDR' | 'USD' | 'SAR';
  issueDate: string;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  paymentMethod?: 'QRIS' | 'Virtual Account BCA' | 'Mandiri Bill' | 'Credit Card' | 'Bank Transfer';
  serviceDescription: string;
}

export interface PrayerTime {
  name: string;
  arabicName: string;
  time: string;
  isNext?: boolean;
}

export interface IslamicDateInfo {
  hijriDay: number;
  hijriMonthName: string;
  hijriYear: number;
  hijriFormatted: string;
  currentEvent?: string;
  ramadanMode: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'session_alert' | 'invoice_reminder' | 'task_followup' | 'prayer_buffer' | 'security_alert';
  read: boolean;
  channel: 'Push' | 'WhatsApp' | 'Email';
}

export interface ThirdPartyConfig {
  id: string;
  name: string;
  provider: 'Google Calendar' | 'Zoom / Meet' | 'WhatsApp Business' | 'Midtrans Payment' | 'Stripe Global';
  category: 'calendar' | 'video' | 'notification' | 'payment';
  connected: boolean;
  lastSync: string;
  apiKeyMasked: string;
  webhookUrl: string;
}

export interface MonthlyKpiTarget {
  id: string;
  category: 'operational' | 'financial' | 'quality' | 'ethics';
  title: string;
  description: string;
  metricUnit: string;
  targetValue: number;
  actualValue: number;
  formatType: 'currency' | 'number' | 'percentage' | 'hours';
  weightPercent: number; // Contribution to overall coaching composite index
  trend: 'up' | 'stable' | 'down';
  trendLabel: string;
}

export interface CoachPrivateNote {
  id: string;
  clientId: string;
  content: string;
  category: 'Observasi' | 'Tantangan' | 'Prioritas' | 'Mindset' | 'Etika';
  createdAt: string; // ISO timestamp
  isEncrypted?: boolean;
}

export interface KpiInsightRecommendation {
  kpiId: string;
  statusAssessment: string;
  tacticalAction: string;
  growthLever: string;
  estimatedImpact: string;
}

export type SupportedLanguage = 'id' | 'en' | 'ar';
export type DisplayTheme = 'emerald' | 'navy' | 'obsidian';
export type DisplayDensity = 'comfortable' | 'compact';
