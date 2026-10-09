import React from 'react';
import { Download, Copy, ScanLine, AlertTriangle, Check } from 'lucide-react';

export default function QRPreview({ dataUrl, valid, error, settings, payload, warnings, onDownload, onCopy, downloadError, saved }) {
  return <aside className="preview-column" aria-label="QR code preview">
    <div className="preview-topline"><span><span className={`live-dot ${valid ? 'good' : ''}`}/>{valid ? 'LIVE PREVIEW' : 'PREVIEW ON HOLD'}</span><span>{settings.size} × {settings.size} PX</span></div>
    <div className={`preview-paper ${!valid ? 'is-empty' : ''}`}>
      {valid && dataUrl ? <img className="qr-image" src={dataUrl} alt="Generated QR code preview" /> : <div className="empty-preview"><ScanLine size={42} strokeWidth={1.2}/><strong>Your code will appear here</strong><span>Enter valid content to generate a preview.</span></div>}
    </div>
    <div className="preview-caption"><div><strong>{valid ? 'Ready to scan' : 'Waiting for valid content'}</strong><span>{valid ? 'Preview reflects your current settings.' : 'Your previous preview is not current.'}</span></div><span className="preview-status">{valid ? <Check size={14}/> : <AlertTriangle size={14}/>}</span></div>
    {warnings.length > 0 && <div className="warning-list" aria-live="polite">{warnings.map((warning, i) => <p key={i}><AlertTriangle size={15}/><span>{warning}</span></p>)}</div>}
    {error && <p className="preview-error" role="status">{error}</p>}
    {downloadError && <p className="preview-error" role="alert">{downloadError}</p>}
    <div className="download-actions"><button className="download-button" type="button" onClick={onDownload} disabled={!valid || !dataUrl}><Download size={17}/>Download PNG</button><button className="copy-button" type="button" onClick={onCopy} disabled={!valid} aria-label="Copy QR payload" title="Copy QR payload"><Copy size={17}/></button></div>
    {saved && <p className="saved-message" role="status"><Check size={14}/> Saved to this device's history</p>}
    <p className="privacy-note">Your content stays in this browser. QR codes are generated on-device.</p>
  </aside>;
}
