import React from 'react';
import { X, Info, ShieldCheck, AlertCircle, FileText } from 'lucide-react';
import { getTranslation } from '../i18n/translations';

export default function InfoModal({ isOpen, onClose, language }) {
  if (!isOpen) return null;
  const t = (key) => getTranslation(key, language);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-slate-100 overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 flex-shrink-0">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 font-cinzel">
            <Info className="w-4 h-4 text-ayurveda-primary" />
            {t('infoTitle')}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 text-sm text-slate-700">
          <div>
            <h4 className="font-bold text-ayurveda-dark mb-1.5">{t('infoWhatIsHeading')}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{t('infoWhatIs')}</p>
          </div>

          <div>
            <h4 className="font-bold text-ayurveda-dark mb-2">{t('infoScopeHeading')}</h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-ayurveda-primary font-bold">✓</span>
                <span>{t('infoScope1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ayurveda-primary font-bold">✓</span>
                <span>{t('infoScope2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ayurveda-primary font-bold">✓</span>
                <span>{t('infoScope3')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ayurveda-primary font-bold">✓</span>
                <span>{t('infoScope4')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ayurveda-primary font-bold">✓</span>
                <span>{t('infoScope5')}</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl">
            <h4 className="font-bold text-amber-900 text-xs flex items-center gap-1.5 mb-1">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              {t('infoNotScopeHeading')}
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              {t('infoNotScope')}
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-4 h-4 text-ayurveda-primary" />
              {t('infoDisclaimerHeading')}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('infoDisclaimer')}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            {t('closeBtn')}
          </button>
        </div>
      </div>
    </div>
  );
}
