import React from 'react';

export default function CustomizationPanel({ settings, setSettings, activePreset, setActivePreset }) {
  const update = (key, value) => { setSettings(current => ({ ...current, [key]: value })); setActivePreset('Custom'); };
  return <section className="custom-section" aria-labelledby="custom-heading">
    <div className="section-heading"><span className="section-number">02</span><div><h2 id="custom-heading">Make it yours</h2><p>Fine-tune the look and scan reliability.</p></div></div>
    <div className="custom-grid">
      <label className="field"><span>Output size</span><select value={settings.size} onChange={e => update('size', Number(e.target.value))}><option value="192">192 px</option><option value="256">256 px</option><option value="320">320 px</option><option value="512">512 px</option></select></label>
      <label className="field"><span>Error correction</span><select value={settings.correction} onChange={e => update('correction', e.target.value)}><option value="L">L · ~7%</option><option value="M">M · ~15%</option><option value="Q">Q · ~25%</option><option value="H">H · ~30%</option></select></label>
      <label className="field color-field"><span>Foreground</span><span className="color-control"><input aria-label="Foreground color" type="color" value={settings.foreground} onChange={e => update('foreground', e.target.value)} /><input aria-label="Foreground hex value" className="hex-input" value={settings.foreground.toUpperCase()} readOnly /></span></label>
      <label className="field color-field"><span>Background</span><span className="color-control"><input aria-label="Background color" type="color" value={settings.background} onChange={e => update('background', e.target.value)} /><input aria-label="Background hex value" className="hex-input" value={settings.background.toUpperCase()} readOnly /></span></label>
      <label className="field full-field"><span>Quiet zone <small>Clear space around the code</small></span><select value={settings.margin} onChange={e => update('margin', Number(e.target.value))}><option value="0">0 modules</option><option value="2">2 modules</option><option value="4">4 modules · Recommended</option><option value="8">8 modules</option></select></label>
    </div>
    <div className="micro-note">Higher correction can help a code tolerate damage, but may increase its density. A quiet zone of at least 4 modules is recommended.</div>
  </section>;
}
