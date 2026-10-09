import React from 'react';
import { Link, Type, Mail, Phone, Wifi } from 'lucide-react';
import { QR_TYPES } from '../utils/qrUtils.js';

const icons = { url: Link, text: Type, email: Mail, phone: Phone, wifi: Wifi };

export default function QRForm({ type, setType, form, setForm, error }) {
  const values = form[type];
  const update = (key, value) => setForm(current => ({ ...current, [type]: { ...current[type], [key]: value } }));
  return <section className="form-section" aria-labelledby="content-heading">
    <div className="section-heading"><span className="section-number">01</span><div><h2 id="content-heading">Content</h2><p>Choose what your QR code should do.</p></div></div>
    <div className="type-selector" role="group" aria-label="QR code type">
      {QR_TYPES.map(item => { const Icon = icons[item.id]; return <button key={item.id} type="button" className={`type-option ${type === item.id ? 'active' : ''}`} onClick={() => setType(item.id)} aria-pressed={type === item.id}>
        <Icon size={17} strokeWidth={1.8}/><span>{item.label}</span>
      </button>; })}
    </div>
    <div className="fields">
      {type === 'url' && <label className="field"><span>Website URL</span><input type="url" value={values.url} onChange={e => update('url', e.target.value)} placeholder="https://example.com" autoComplete="url" /></label>}
      {type === 'text' && <label className="field"><span>Your text</span><textarea rows="4" value={values.text} onChange={e => update('text', e.target.value)} placeholder="Write a message, address, or any plain text…" /></label>}
      {type === 'email' && <><label className="field"><span>Recipient email</span><input type="email" value={values.email} onChange={e => update('email', e.target.value)} placeholder="hello@example.com" autoComplete="email" /></label><label className="field"><span>Subject <em>Optional</em></span><input value={values.subject} onChange={e => update('subject', e.target.value)} placeholder="A quick hello" /></label><label className="field"><span>Message <em>Optional</em></span><textarea rows="3" value={values.message} onChange={e => update('message', e.target.value)} placeholder="Add a message…" /></label></>}
      {type === 'phone' && <label className="field"><span>Phone number</span><input type="tel" value={values.phone} onChange={e => update('phone', e.target.value)} placeholder="+91 98765 43210" autoComplete="tel" /></label>}
      {type === 'wifi' && <><label className="field"><span>Network name (SSID)</span><input value={values.ssid} onChange={e => update('ssid', e.target.value)} placeholder="Your Wi-Fi name" autoComplete="off" /></label><label className="field"><span>Security</span><select value={values.security} onChange={e => update('security', e.target.value)}><option value="WPA">WPA / WPA2</option><option value="WEP">WEP</option><option value="None">None (open network)</option></select></label>{values.security !== 'None' && <label className="field"><span>Password</span><input type="password" value={values.password} onChange={e => update('password', e.target.value)} placeholder="Network password" autoComplete="new-password" /></label>}<label className="check-field"><input type="checkbox" checked={values.hidden} onChange={e => update('hidden', e.target.checked)} /><span><strong>Hidden network</strong><small>Network name is not broadcast publicly.</small></span></label></>}
    </div>
    {error && <p className="validation-message" role="alert">{error}</p>}
  </section>;
}
