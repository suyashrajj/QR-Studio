import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { RotateCcw, Trash2, Clock3 } from 'lucide-react';
import { QR_TYPES } from '../utils/qrUtils.js';

export default function RecentHistory({ history, onRestore, onDelete, onClear }) {
  const [thumbnails, setThumbnails] = useState({});
  useEffect(() => {
    let cancelled = false;
    Promise.all(history.map(async item => {
      try { return [item.id, await QRCode.toDataURL(item.payload, { width: 74, margin: 2, errorCorrectionLevel: item.settings.correction, color: { dark: item.settings.foreground, light: item.settings.background } })]; }
      catch { return [item.id, '']; }
    })).then(entries => { if (!cancelled) setThumbnails(Object.fromEntries(entries)); });
    return () => { cancelled = true; };
  }, [history]);
  const clear = () => { if (history.length && window.confirm('Clear all recent QR codes from this browser?')) onClear(); };
  return <section className="history-section" aria-labelledby="history-heading">
    <div className="history-heading"><div className="section-heading"><span className="section-number">03</span><div><h2 id="history-heading">Recently made</h2><p>Your last 10 codes, saved only on this device.</p></div></div><button type="button" className="clear-history" onClick={clear} disabled={!history.length}><Trash2 size={14}/>Clear history</button></div>
    {!history.length ? <div className="history-empty"><Clock3 size={18}/><span>Your recent QR codes will show up here after you download one.</span></div> : <div className="history-list">{history.map(item => <article className="history-item" key={item.id}>
      <div className="history-thumb" style={{ background: item.settings.background }}>{thumbnails[item.id] ? <img src={thumbnails[item.id]} alt="" /> : <span style={{ background: item.settings.foreground }} />}</div>
      <button type="button" className="history-main" onClick={() => onRestore(item)} title="Restore this QR code"><strong>{item.label || 'QR code'}</strong><span>{QR_TYPES.find(type => type.id === item.type)?.label || item.type} · {new Date(item.timestamp).toLocaleDateString()}</span></button>
      <button type="button" className="history-reuse" onClick={() => onRestore(item)} aria-label={`Reuse ${item.label}`}><RotateCcw size={15}/><span>Reuse</span></button>
      <button type="button" className="history-delete" onClick={() => onDelete(item.id)} aria-label={`Delete ${item.label}`}><Trash2 size={15}/></button>
    </article>)}</div>}
  </section>;
}
