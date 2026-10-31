import React, { useState } from 'react';
import { 
  Network, 
  CheckCircle2, 
  XCircle, 
  Send, 
  Key, 
  Terminal, 
  ExternalLink, 
  Copy, 
  Check, 
  Eye, 
  EyeOff,
  RefreshCw,
  Calendar,
  Video,
  MessageSquare,
  CreditCard
} from 'lucide-react';
import { ThirdPartyConfig, SupportedLanguage } from '../types';
import { getTranslation } from '../utils/i18n';

interface ThirdPartyApiHubProps {
  integrations: ThirdPartyConfig[];
  setIntegrations: React.Dispatch<React.SetStateAction<ThirdPartyConfig[]>>;
  lang: SupportedLanguage;
  onTriggerNotification: (title: string, message: string, channel: 'Push' | 'WhatsApp' | 'Email') => void;
}

export const ThirdPartyApiHub: React.FC<ThirdPartyApiHubProps> = ({
  integrations,
  setIntegrations,
  lang,
  onTriggerNotification,
}) => {
  const t = getTranslation(lang);

  const [selectedWebhook, setSelectedWebhook] = useState('whatsapp_session_reminder');
  const [isSendingWebhook, setIsSendingWebhook] = useState(false);
  const [webhookResponse, setWebhookResponse] = useState<any | null>(null);
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});

  const toggleRevealKey = (id: string) => {
    setRevealedKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleTestWebhook = () => {
    setIsSendingWebhook(true);
    setWebhookResponse(null);

    setTimeout(() => {
      let respData = {};
      if (selectedWebhook === 'whatsapp_session_reminder') {
        respData = {
          status: 'delivered',
          channel: 'WhatsApp Business API v18.0',
          recipient: '+6281298765432',
          templateId: 'tpl_session_reminder_15m',
          timestamp: new Date().toISOString(),
          httpStatus: 200,
        };
        onTriggerNotification(
          'Pengingat WA Terkirim',
          'Notifikasi WhatsApp 15 menit sebelum sesi berhasil dikirimkan ke Sarah Jenkins.',
          'WhatsApp'
        );
      } else if (selectedWebhook === 'google_calendar_sync') {
        respData = {
          status: 'synced',
          calendar: 'primary@google.com',
          eventsSynced: 4,
          syncToken: 'gcal_sync_token_990141',
          httpStatus: 200,
        };
        onTriggerNotification(
          'Google Calendar Sinkron',
          'Jadwal 4 sesi mentoring berhasil disinkronkan ke Google Calendar pengguna.',
          'Push'
        );
      } else {
        respData = {
          status: 'settlement_acknowledged',
          gateway: 'Midtrans Snap Engine',
          orderId: 'INV/2026/10/089',
          grossAmount: 18000000,
          paymentType: 'qris',
          httpStatus: 200,
        };
        onTriggerNotification(
          'Webhook Pembayaran Sukses',
          'Midtrans mengonfirmasi pelunasan QRIS Rp 18.000.000.',
          'Push'
        );
      }

      setWebhookResponse(respData);
      setIsSendingWebhook(false);
    }, 900);
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'Google Calendar':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'Zoom / Meet':
        return <Video className="w-5 h-5 text-sky-500" />;
      case 'WhatsApp Business':
        return <MessageSquare className="w-5 h-5 text-emerald-500" />;
      default:
        return <CreditCard className="w-5 h-5 text-purple-500" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Network className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {t.apiHub.title}
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.apiHub.subtitle}
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 font-semibold">
            5 Integrasi Aktif & Terverifikasi
          </span>
        </div>
      </div>

      {/* Integrations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((item) => {
          const isKeyRevealed = !!revealedKeys[item.id];
          return (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    {getProviderIcon(item.provider)}
                  </div>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {t.apiHub.connected}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {item.name}
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                  Sinkron: {item.lastSync}
                </span>

                {/* API Key Masked / Unmasked */}
                <div className="mt-3 p-2 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                    <span>API Key Credential</span>
                    <button
                      onClick={() => toggleRevealKey(item.id)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {isKeyRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="font-mono text-xs text-slate-800 dark:text-slate-200 truncate">
                    {isKeyRevealed ? 'AIzaSyD88192040182763541K90' : item.apiKeyMasked}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="font-mono text-[10px] text-slate-400 truncate max-w-[180px]">
                  {item.webhookUrl}
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold cursor-pointer hover:underline text-[11px]">
                  Konfigurasi
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Webhook Test Console */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Konsol Pengujian Webhook & Integrasi Otomatis
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Event Payload Dispatcher
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Dispatch Form */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Pilih Skenario Webhook Event:
              </label>
              <select
                value={selectedWebhook}
                onChange={(e) => setSelectedWebhook(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="whatsapp_session_reminder">WhatsApp Business: Pengingat Sesi 15 Menit</option>
                <option value="google_calendar_sync">Google Calendar: Sinkronisasi Jadwal 2-Arah</option>
                <option value="midtrans_payment_settlement">Midtrans: Notifikasi Pembayaran QRIS Lunas</option>
              </select>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Mensimulasikan panggilan webhook pihak ketiga dan memicu notifikasi otomatis secara real-time pada sistem MurshidAI.
            </p>

            <button
              onClick={handleTestWebhook}
              disabled={isSendingWebhook}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg shadow-xs cursor-pointer transition-colors"
            >
              {isSendingWebhook ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Mengirim Payload...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{t.apiHub.testWebhook}</span>
                </>
              )}
            </button>
          </div>

          {/* Response Payload Viewer */}
          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 flex flex-col justify-between font-mono text-xs">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] text-slate-400">
                <span>HTTP Response Status: {webhookResponse ? '200 OK' : 'Siap Menunggu Event'}</span>
                <span>Latency: 48ms</span>
              </div>
              <pre className="text-emerald-400 overflow-x-auto text-[11px] leading-relaxed">
                {webhookResponse
                  ? JSON.stringify(webhookResponse, null, 2)
                  : `// Klik "Uji Kirim Webhook" untuk mensimulasikan payload masuk...`}
              </pre>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
