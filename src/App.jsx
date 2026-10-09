import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Moon, Sun, ArrowUpRight, Sparkles } from 'lucide-react';
import QRForm from './components/QRForm.jsx';
import QRPreview from './components/QRPreview.jsx';
import CustomizationPanel from './components/CustomizationPanel.jsx';
import PresetSelector from './components/PresetSelector.jsx';
import RecentHistory from './components/RecentHistory.jsx';
import { DEFAULT_FORM, DEFAULT_SETTINGS, PRESETS, buildPayload, generateDataUrl, getContrastRatio, getLabel, QR_TYPES } from './utils/qrUtils.js';
import { readHistory, saveHistoryEntry, removeHistoryEntry, clearHistory, readTheme, saveTheme } from './utils/storage.js';

function App() {
  const [type, setType] = useState('url');
  const [form, setForm] = useState(() => structuredClone(DEFAULT_FORM));
  const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS });
  const [activePreset, setActivePreset] = useState('Ink');
  const [history, setHistory] = useState(() => readHistory());
  const [theme, setTheme] = useState(() => readTheme());
  const [dataUrl, setDataUrl] = useState('');
  const [generationError, setGenerationError] = useState('');
  const [downloadError, setDownloadError] = useState('');
  const [saved, setSaved] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');

  const result = useMemo(() => buildPayload(type, form), [type, form]);
  const valid = Boolean(result.payload) && !result.error;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    saveTheme(theme);
  }, [theme]);

  useEffect(() => {
    let cancelled = false;
    setSaved(false);
    setDownloadError('');
    if (!valid) { setDataUrl(''); setGenerationError(''); return; }
    generateDataUrl(result.payload, settings).then(url => {
      if (!cancelled) { setDataUrl(url); setGenerationError(''); }
    }).catch(() => {
      if (!cancelled) { setDataUrl(''); setGenerationError('This content is too long or could not be encoded. Try shorter content or a larger size.'); }
    });
    return () => { cancelled = true; };
  }, [result.payload, valid, settings]);

  useEffect(() => {
    if (activePreset === 'Custom') return;
    const preset = PRESETS[activePreset];
    if (preset && (settings.foreground !== preset.foreground || settings.background !== preset.background || settings.correction !== preset.correction || settings.margin !== preset.margin)) setActivePreset('Custom');
  }, [settings, activePreset]);

  const contrast = getContrastRatio(settings.foreground, settings.background);
  const warnings = [];
  if (contrast < 4.5) warnings.push(`Low color contrast (${contrast.toFixed(1)}:1). Dark foreground on a light background is easier to scan.`);
  if (settings.margin < 4) warnings.push('Quiet zone is under 4 modules. Leave clear space around the QR code for more reliable scanning.');
  if (result.payload.length > 180) warnings.push('This payload is fairly long. Dense QR codes and small output sizes can be harder to scan.');
  if (result.payload.length > 90 && settings.size <= 256) warnings.push('Consider a larger output size for this longer payload.');

  const saveCurrent = useCallback(() => {
    if (!valid || !dataUrl) return;
    const entry = { type, form: structuredClone(form), payload: result.payload, label: getLabel(type, form), settings: { ...settings } };
    setHistory(saveHistoryEntry(entry));
    setSaved(true);
  }, [valid, dataUrl, type, form, result.payload, settings]);

  const download = async () => {
    setDownloadError('');
    if (!valid || !result.payload) return;
    try {
      const finalUrl = await generateDataUrl(result.payload, settings);
      const link = document.createElement('a');
      link.href = finalUrl;
      link.download = `qr-studio-${type}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      saveCurrent();
    } catch {
      setDownloadError('Could not create the PNG. Try reducing the content or changing the settings.');
    }
  };

  const copyPayload = async () => {
    try {
      await navigator.clipboard.writeText(result.payload);
      setCopyMessage('Payload copied');
      window.setTimeout(() => setCopyMessage(''), 1800);
    } catch { setCopyMessage('Clipboard access unavailable'); window.setTimeout(() => setCopyMessage(''), 2200); }
  };

  const restore = item => {
    setType(item.type);
    setForm(current => ({ ...current, [item.type]: { ...item.form[item.type] } }));
    setSettings({ ...item.settings });
    const match = Object.entries(PRESETS).find(([, preset]) => ['foreground', 'background', 'correction', 'margin'].every(key => preset[key] === item.settings[key]));
    setActivePreset(match?.[0] || 'Custom');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const typeLabel = QR_TYPES.find(item => item.id === type)?.label || type;
  return <div className="app-shell">
    <header className="site-header">
      <a className="wordmark" href="#top" aria-label="QR Studio home"><span className="wordmark-symbol">qr/</span><span>STUDIO</span></a>
      <span className="header-descriptor">LOCAL QR WORKSPACE</span>
      <button className="theme-toggle" type="button" onClick={() => setTheme(current => current === 'light' ? 'dark' : 'light')} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}>{theme === 'light' ? <Moon size={17}/> : <Sun size={17}/>}<span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span></button>
    </header>

    <main id="top" className="main-content">
      <section className="intro-block">
        <div className="eyebrow"><span className="live-dot good"/> BROWSER-BASED GENERATION <span className="eyebrow-rule"/></div>
        <h1>Make it scannable.<br/><span>Make it yours.</span></h1>
        <div className="intro-bottom"><p>Generate, style and export QR codes directly in your browser. Your data stays on this device.</p><div className="privacy-chip"><Sparkles size={14}/> No account. No upload.</div></div>
      </section>

      <div className="workspace-grid">
        <div className="editor-column">
          <QRForm type={type} setType={setType} form={form} setForm={setForm} error={result.error}/>
          <div className="editor-divider"/>
          <CustomizationPanel settings={settings} setSettings={setSettings} activePreset={activePreset} setActivePreset={setActivePreset}/>
          <PresetSelector settings={settings} setSettings={setSettings} activePreset={activePreset} setActivePreset={setActivePreset}/>
        </div>
        <QRPreview dataUrl={dataUrl} valid={valid && Boolean(dataUrl)} error={generationError} settings={settings} payload={result.payload} warnings={warnings} onDownload={download} onCopy={copyPayload} downloadError={downloadError} saved={saved}/>
      </div>

      <section className="feature-strip" aria-label="QR Studio features">
        <div className="feature-main"><span className="feature-index">A / FORMATS</span><h3>One code.<br/>Five ways to connect.</h3><p>Link to a site, share text, start an email or call, or let people join Wi-Fi.</p><div className="format-pills">{['URL','TEXT','EMAIL','PHONE','WI-FI'].map(label => <span key={label}>{label}</span>)}</div></div>
        <div className="feature-style"><span className="feature-index">B / CONTROL</span><div className="mini-contrast"><span/><span/><span/><span/><span/><span/><span/><span/><span/></div><h3>Style with intent.</h3><p>Colors, size, quiet zone and error correction — all in your hands.</p></div>
        <div className="feature-local"><span className="feature-index">C / LOCAL FIRST</span><div className="local-mark"><span>qr/</span><ArrowUpRight size={21}/></div><h3>Yours to keep.</h3><p>Your recent codes stay on this device. Restore one whenever you need it.</p></div>
      </section>

      <RecentHistory history={history} onRestore={restore} onDelete={id => setHistory(removeHistoryEntry(id))} onClear={() => setHistory(clearHistory())}/>
      <div className="status-line"><span>{typeLabel} · {valid ? 'Content valid' : 'Needs attention'}</span><span>{copyMessage || 'Made for the everyday scan.'}</span></div>
    </main>

    <footer className="site-footer"><span className="footer-mark">qr/ STUDIO</span><span>QR generation happens locally in your browser.</span><a href="#top">Back to top ↑</a></footer>
  </div>;
}

export default App;
