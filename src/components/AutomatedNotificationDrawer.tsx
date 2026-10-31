import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  Clock, 
  CheckCheck, 
  MessageSquare, 
  Mail, 
  Smartphone, 
  Send, 
  CheckCircle2, 
  AlertTriangle,
  Calendar,
  DollarSign
} from 'lucide-react';
import { NotificationItem, SupportedLanguage } from '../types';
import { getTranslation } from '../utils/i18n';

interface AutomatedNotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
  lang: SupportedLanguage;
}

export const AutomatedNotificationDrawer: React.FC<AutomatedNotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  setNotifications,
  lang,
}) => {
  const t = getTranslation(lang);
  const [filterChannel, setFilterChannel] = useState<'All' | 'Push' | 'WhatsApp' | 'Email'>('All');
  const [testPushText, setTestPushText] = useState('');

  if (!isOpen) return null;

  const filteredNotifs = notifications.filter(
    (n) => filterChannel === 'All' || n.channel === filterChannel
  );

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleSendCustomPush = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPushText.trim()) return;

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Pemberitahuan Sistem MurshidAI',
      message: testPushText,
      timestamp: 'Baru saja',
      type: 'session_alert',
      read: false,
      channel: 'Push',
    };

    setNotifications((prev) => [newNotif, ...prev]);
    setTestPushText('');
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'WhatsApp':
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />;
      case 'Email':
        return <Mail className="w-3.5 h-3.5 text-blue-500" />;
      default:
        return <Smartphone className="w-3.5 h-3.5 text-purple-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
      <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Pusat Notifikasi & Pengingat Otomatis
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Channel Filters */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            {(['All', 'Push', 'WhatsApp', 'Email'] as const).map((ch) => (
              <button
                key={ch}
                onClick={() => setFilterChannel(ch)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  filterChannel === ch
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {ch === 'All' ? 'Semua' : ch}
              </button>
            ))}
          </div>

          <button
            onClick={markAllRead}
            className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Tandai Semua Dibaca
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredNotifs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Tidak ada notifikasi aktif pada saluran ini.
            </div>
          ) : (
            filteredNotifs.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border text-xs transition-colors ${
                  item.read
                    ? 'bg-white dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'
                    : 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    {getChannelIcon(item.channel)}
                    <span className="font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {item.timestamp}
                  </span>
                </div>

                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed mt-1">
                  {item.message}
                </p>

                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400">
                  <span>Saluran: {item.channel} Notification</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {item.read ? 'Terkirim' : 'Baru'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Push Notification Simulator Form */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800">
          <form onSubmit={handleSendCustomPush} className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
              Simulasikan Kirim Notifikasi Push Real-Time:
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Pesan notifikasi (misal: Sesi dimulai...)"
                value={testPushText}
                onChange={(e) => setTestPushText(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer transition-colors"
              >
                Kirim
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};
