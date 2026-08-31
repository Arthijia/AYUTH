import React from 'react';
import { MessageSquare, FileText, Lock, BookOpen, Database } from 'lucide-react';
import { getTranslation } from '../i18n/translations';

export default function Sidebar({ activeTab, onSelectTab, language, profile, messageCount }) {
  const t = (key) => getTranslation(key, language);

  const navItems = [
    { id: 'chat', label: t('navChat'), icon: MessageSquare, badge: messageCount > 0 ? `${messageCount}` : null },
    { id: 'classifier', label: t('navClassifier'), icon: FileText, badge: profile ? '✓' : null },
    { id: 'locker', label: t('navLocker'), icon: Lock },
    { id: 'knowledge', label: t('navKnowledge'), icon: BookOpen },
  ];

  return (
    <aside className="w-full md:w-56 flex flex-col gap-3 flex-shrink-0 h-full overflow-y-auto custom-scrollbar">
      {/* Navigation Card */}
      <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-200/80">
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5 font-mono-code">
          {t('navHeader')}
        </h2>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium text-xs transition text-left cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-ayurveda-primary to-ayurveda-medium text-white shadow-sm shadow-ayurveda-primary/20 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-ayurveda-cream' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Session Status Card */}
      <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-200/80">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono-code">
            {t('navSession')}
          </h2>
          <span className="flex h-1.5 w-1.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
        </div>

        <div className="space-y-1.5 text-xs text-slate-600">
          <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100 text-[11px]">
            <span className="text-slate-500">{t('profileStatus')}</span>
            <span
              className={`font-semibold px-1.5 py-0.5 rounded text-[10px] ${
                profile
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {profile ? t('profileConfigured') : t('profileNotSet')}
            </span>
          </div>

          <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100 text-[11px]">
            <span className="text-slate-500">{t('messagesCount')}</span>
            <span className="font-semibold text-slate-700">{messageCount}</span>
          </div>

          <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100 text-[11px]">
            <span className="text-slate-500 flex items-center gap-1">
              <Database className="w-3 h-3 text-ayurveda-primary" /> ChromaDB:
            </span>
            <span className="font-semibold text-emerald-600">Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
