import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ChatTab from './components/ChatTab';
import ClassifierTab from './components/ClassifierTab';
import LockerTab from './components/LockerTab';
import KnowledgeTab from './components/KnowledgeTab';
import SettingsModal from './components/SettingsModal';
import InfoModal from './components/InfoModal';
import { getTranslation } from './i18n/translations';

export default function App() {
  const [language, setLanguage] = useState(() => localStorage.getItem('ayuth_lang') || 'en');
  const [activeTab, setActiveTab] = useState('chat');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('ayuth_groq_key') || '');

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('ayuth_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('ayuth_messages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const cleaned = parsed.filter(m => !m.content?.includes('[Offline Mode]'));
        if (cleaned.length > 0) return cleaned;
      } catch (e) {}
    }
    return [
      {
        role: 'assistant',
        content: getTranslation('greetingMessage', localStorage.getItem('ayuth_lang') || 'en'),
        proof_documents: [],
        citations: [],
      },
    ];
  });

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem('ayuth_lang', newLang);
    setMessages((prev) => {
      if (prev.length <= 1 && prev[0]?.role === 'assistant') {
        const updated = [
          {
            role: 'assistant',
            content: getTranslation('greetingMessage', newLang),
            proof_documents: [],
            citations: [],
          },
        ];
        localStorage.setItem('ayuth_messages', JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
  };

  useEffect(() => {
    localStorage.setItem('ayuth_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (profile) {
      localStorage.setItem('ayuth_profile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('ayuth_profile');
    }
  }, [profile]);

  const handleSaveApiKey = (key) => {
    setApiKey(key);
    if (key) {
      localStorage.setItem('ayuth_groq_key', key);
    } else {
      localStorage.removeItem('ayuth_groq_key');
    }
  };

  const handleSendMessage = async (text) => {
    const userMsg = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          jurisdiction: 'all',
          inventionProfile: profile,
          language: language,
          apiKey: apiKey || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const assistantMsg = {
        role: 'assistant',
        content: data.answer,
        rag_used: Boolean(data.rag_used),
        sources: data.sources || data.proof_documents || [],
        proof_documents: data.proof_documents || data.sources || [],
        citations: data.citations || [],
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Failed to complete RAG synthesis: ${err.message}. Please check that the backend server is active.`,
          proof_documents: [],
          citations: [],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSession = () => {
    setProfile(null);
    localStorage.removeItem('ayuth_profile');
    const initialGreeting = [
      {
        role: 'assistant',
        content: getTranslation('greetingMessage', language),
        proof_documents: [],
        citations: [],
      },
    ];
    setMessages(initialGreeting);
    localStorage.setItem('ayuth_messages', JSON.stringify(initialGreeting));
  };

  return (
    <div className="h-screen w-screen bg-slate-100 flex flex-col overflow-hidden selection:bg-ayurveda-primary selection:text-white">
      {/* Navigation Header */}
      <Navbar
        language={language}
        onLanguageChange={handleLanguageChange}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenInfo={() => setIsInfoOpen(true)}
      />

      {/* Main Single-Viewport Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-4 min-h-0 overflow-hidden">
        <div className="h-full flex flex-col md:flex-row gap-4 items-stretch min-h-0">
          {/* Left Sidebar */}
          <Sidebar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            language={language}
            profile={profile}
            messageCount={messages.filter((m) => m.role === 'user').length}
          />

          {/* Right Tab Content Container */}
          <section className="flex-1 w-full min-w-0 h-full overflow-hidden flex flex-col">
            {activeTab === 'chat' && (
              <ChatTab
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                language={language}
                inventionProfile={profile}
              />
            )}

            {activeTab === 'classifier' && (
              <div className="h-full overflow-y-auto custom-scrollbar pr-1">
                <ClassifierTab
                  profile={profile}
                  onSaveProfile={setProfile}
                  onClearProfile={() => setProfile(null)}
                  language={language}
                />
              </div>
            )}

            {activeTab === 'locker' && (
              <div className="h-full overflow-y-auto custom-scrollbar pr-1">
                <LockerTab language={language} />
              </div>
            )}

            {activeTab === 'knowledge' && (
              <div className="h-full overflow-y-auto custom-scrollbar pr-1">
                <KnowledgeTab language={language} />
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        onClearSession={handleClearSession}
        language={language}
      />

      <InfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        language={language}
      />
    </div>
  );
}
