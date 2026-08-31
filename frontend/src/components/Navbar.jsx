import React from 'react';
import { LANGUAGES, getTranslation } from '../i18n/translations';
import { Settings, Info, Leaf, ShieldCheck } from 'lucide-react';

export default function Navbar({ language, onLanguageChange, onOpenSettings, onOpenInfo }) {
  const t = (key) => getTranslation(key, language);

  return (
    <header className="bg-gradient-to-r from-ayurveda-dark via-ayurveda-primary to-ayurveda-medium text-white shadow-md border-b border-ayurveda-gold/30 flex-shrink-0 z-30">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-ayurveda-gold/20 flex items-center justify-center border border-ayurveda-gold/40 shadow-inner">
            <Leaf className="w-4 h-4 text-ayurveda-cream" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-wider font-cinzel text-ayurveda-cream leading-none">
                {t('headerTitle')}
              </h1>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-ayurveda-gold/20 text-ayurveda-cream font-medium border border-ayurveda-gold/30 flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5 text-emerald-300" /> RAG Agent
              </span>
            </div>
            <p className="text-[10px] text-ayurveda-cream/80 tracking-wide font-medium leading-tight">
              {t('headerSubtitle')}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="relative">
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="bg-white/10 hover:bg-white/20 text-ayurveda-cream border border-white/20 rounded-lg px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ayurveda-gold transition appearance-none pr-7 cursor-pointer"
              aria-label="Select Language"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="text-slate-900 bg-white">
                  {lang.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-ayurveda-cream/80 text-[10px]">
              ▼
            </div>
          </div>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white/90 transition cursor-pointer"
            title="Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* Info */}
          <button
            onClick={onOpenInfo}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white/90 transition cursor-pointer"
            title={t('infoTitle')}
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
