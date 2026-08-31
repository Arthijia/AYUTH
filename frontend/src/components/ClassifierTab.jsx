import React, { useState, useEffect } from 'react';
import { getTranslation } from '../i18n/translations';
import { CheckCircle, AlertTriangle, ShieldAlert, Sparkles, Trash2, Save } from 'lucide-react';

export default function ClassifierTab({ profile, onSaveProfile, onClearProfile, language }) {
  const t = (key) => getTranslation(key, language);

  const [formData, setFormData] = useState({
    description: '',
    problem: '',
    novelty: '',
    disclosure: '',
    disclosureOther: '',
    bioResources: '',
    bioResourcesOther: '',
  });

  const [evaluation, setEvaluation] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        description: profile.description || '',
        problem: profile.problem || '',
        novelty: profile.novelty || '',
        disclosure: profile.disclosure?.startsWith('Other:') ? 'other' : (profile.disclosure || ''),
        disclosureOther: profile.disclosure?.startsWith('Other:') ? profile.disclosure.replace('Other:', '').trim() : '',
        bioResources: profile.bioResources?.startsWith('Other:') ? 'other' : (profile.bioResources || ''),
        bioResourcesOther: profile.bioResources?.startsWith('Other:') ? profile.bioResources.replace('Other:', '').trim() : '',
      });
      runEvaluation(profile);
    }
  }, [profile]);

  const runEvaluation = async (profileData) => {
    setIsEvaluating(true);
    try {
      const res = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: profileData }),
      });
      if (res.ok) {
        const data = await res.json();
        setEvaluation(data);
      }
    } catch (err) {
      console.warn('Evaluation offline fallback', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.description || !formData.problem || !formData.novelty || !formData.disclosure || !formData.bioResources) {
      alert("Please complete all 5 questions to build your invention profile.");
      return;
    }

    if (formData.disclosure === 'other' && !formData.disclosureOther.trim()) {
      alert("Please describe your custom public disclosure circumstances.");
      return;
    }

    if (formData.bioResources === 'other' && !formData.bioResourcesOther.trim()) {
      alert("Please describe your custom biological resources or traditional knowledge.");
      return;
    }

    const finalProfile = {
      description: formData.description,
      problem: formData.problem,
      novelty: formData.novelty,
      disclosure: formData.disclosure === 'other' ? `Other: ${formData.disclosureOther}` : formData.disclosure,
      bioResources: formData.bioResources === 'other' ? `Other: ${formData.bioResourcesOther}` : formData.bioResources,
      savedAt: new Date().toLocaleString(),
    };

    onSaveProfile(finalProfile);
    runEvaluation(finalProfile);
  };

  return (
    <div className="space-y-6">
      {/* Form Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 font-cinzel">
            <Sparkles className="w-5 h-5 text-ayurveda-primary" />
            {t('classifierTitle')}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t('classifierDescription')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Q1 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              {t('q1Label')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('q1Placeholder')}
              rows={3}
              className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-ayurveda-primary focus:ring-2 focus:ring-ayurveda-primary/20 transition outline-none"
            />
          </div>

          {/* Q2 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              {t('q2Label')}
            </label>
            <textarea
              value={formData.problem}
              onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
              placeholder={t('q2Placeholder')}
              rows={2}
              className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-ayurveda-primary focus:ring-2 focus:ring-ayurveda-primary/20 transition outline-none"
            />
          </div>

          {/* Q3 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              {t('q3Label')}
            </label>
            <textarea
              value={formData.novelty}
              onChange={(e) => setFormData({ ...formData, novelty: e.target.value })}
              placeholder={t('q3Placeholder')}
              rows={2}
              className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-ayurveda-primary focus:ring-2 focus:ring-ayurveda-primary/20 transition outline-none"
            />
          </div>

          {/* Q4 with Dynamic Other */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              {t('q4Label')}
            </label>
            <select
              value={formData.disclosure}
              onChange={(e) => setFormData({ ...formData, disclosure: e.target.value })}
              className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-ayurveda-primary focus:ring-2 focus:ring-ayurveda-primary/20 transition outline-none"
            >
              <option value="">{t('q4Placeholder')}</option>
              <option value="no">{t('q4No')}</option>
              <option value="yes_limited">{t('q4YesLimited')}</option>
              <option value="yes_public">{t('q4YesPublic')}</option>
              <option value="other">{t('q4Other')}</option>
            </select>

            {formData.disclosure === 'other' && (
              <div className="mt-3 p-3 bg-ayurveda-pale/40 border border-ayurveda-light/40 rounded-xl animate-fadeIn">
                <label className="block text-xs font-bold text-ayurveda-dark mb-1.5">
                  {t('q4OtherLabel')}
                </label>
                <textarea
                  value={formData.disclosureOther}
                  onChange={(e) => setFormData({ ...formData, disclosureOther: e.target.value })}
                  placeholder="Describe disclosure circumstances (conferences, symposiums, NDAs)..."
                  rows={2}
                  className="w-full p-2.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-ayurveda-primary"
                />
              </div>
            )}
          </div>

          {/* Q5 with Dynamic Other */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              {t('q5Label')}
            </label>
            <select
              value={formData.bioResources}
              onChange={(e) => setFormData({ ...formData, bioResources: e.target.value })}
              className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-ayurveda-primary focus:ring-2 focus:ring-ayurveda-primary/20 transition outline-none"
            >
              <option value="">{t('q5Placeholder')}</option>
              <option value="no">{t('q5No')}</option>
              <option value="biological_nontraditional">{t('q5Biological')}</option>
              <option value="traditional_knowledge">{t('q5TK')}</option>
              <option value="both">{t('q5Both')}</option>
              <option value="other">{t('q5Other')}</option>
            </select>

            {formData.bioResources === 'other' && (
              <div className="mt-3 p-3 bg-ayurveda-pale/40 border border-ayurveda-light/40 rounded-xl animate-fadeIn">
                <label className="block text-xs font-bold text-ayurveda-dark mb-1.5">
                  {t('q5OtherLabel')}
                </label>
                <textarea
                  value={formData.bioResourcesOther}
                  onChange={(e) => setFormData({ ...formData, bioResourcesOther: e.target.value })}
                  placeholder="Describe your botanical species, Himalayan herbs, tribal medicine lineage..."
                  rows={2}
                  className="w-full p-2.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-ayurveda-primary"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-ayurveda-primary to-ayurveda-medium hover:from-ayurveda-medium hover:to-ayurveda-dark text-white rounded-xl font-semibold text-sm shadow-md shadow-ayurveda-primary/20 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {t('saveProfileBtn')}
            </button>

            {profile && (
              <button
                type="button"
                onClick={onClearProfile}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-xl font-semibold text-sm transition"
              >
                <Trash2 className="w-4 h-4" />
                {t('clearProfileBtn')}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Statutory Evaluation & Hurdles Report */}
      {evaluation && evaluation.flags && evaluation.flags.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-200">
          <h3 className="text-base font-bold text-amber-900 flex items-center gap-2 mb-4">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            Statutory Patentability Evaluation ({evaluation.totalHurdles} Hurdles Identified)
          </h3>

          <div className="space-y-3">
            {evaluation.flags.map((flag, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm text-amber-900">{flag.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-200 text-amber-900">
                    {flag.severity}
                  </span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">{flag.message}</p>
              </div>
            ))}
          </div>

          {evaluation.recommendations && evaluation.recommendations.length > 0 && (
            <div className="mt-4 pt-4 border-t border-amber-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Recommended Actions:
              </h4>
              <ul className="space-y-1 text-xs text-slate-600">
                {evaluation.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-ayurveda-primary font-bold">✓</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
