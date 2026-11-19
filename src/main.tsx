import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MostAiWorkbench } from './app/views/MostAiWorkbench';
import { LanguageProvider } from './app/i18n/LanguageContext';
import { getAiSettings, saveAiSettings, type AiSettings } from './app/lib/aiClient';
import './styles/index.css';
const field = 'mt-1 w-full rounded-lg border border-border bg-white px-3 py-2';

function App() {
  const [settings, setSettings] = useState(getAiSettings);
  const [active, setActive] = useState(getAiSettings);
  function update<K extends keyof AiSettings>(key: K, value: AiSettings[K]) {
    setSettings(current => ({ ...current, [key]: value }));
  }
  return <LanguageProvider>
    <header className="border-b border-border bg-white px-4 py-4 sm:px-8">
      <form className="mx-auto max-w-7xl space-y-3" onSubmit={event => {
        event.preventDefault();
        setActive(saveAiSettings(settings));
      }}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm">服务<select className={field} value={settings.provider} onChange={event => {
            const provider = event.target.value === 'gemini' ? 'gemini' : 'openai';
            setSettings({ provider, model: provider === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4o', key: '', baseUrl: 'https://api.openai.com/v1' });
          }}><option value="openai">OpenAI / 兼容接口</option><option value="gemini">Google Gemini</option></select></label>
          <label className="text-sm">模型<input className={field} required value={settings.model} onChange={event => update('model', event.target.value)} /></label>
          <label className="text-sm">API Key<input className={field} type="password" autoComplete="off" value={settings.key} onChange={event => update('key', event.target.value)} /></label>
          {settings.provider === 'openai' && <label className="text-sm">Base URL<input className={field} type="url" required value={settings.baseUrl} onChange={event => update('baseUrl', event.target.value)} /></label>}
        </div>
        <div className="flex flex-wrap items-center gap-3"><button className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white">应用模型</button><span className="text-xs text-muted-foreground" role="status">当前：{active.provider} / {active.model}</span></div>
      </form>
    </header>
    <MostAiWorkbench />
  </LanguageProvider>;
}
createRoot(document.getElementById('root')!).render(<App/>);
