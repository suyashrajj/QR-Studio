import React from 'react';
import { PRESETS } from '../utils/qrUtils.js';

export default function PresetSelector({ settings, setSettings, activePreset, setActivePreset }) {
  const choose = name => { setSettings(current => ({ ...current, ...PRESETS[name] })); setActivePreset(name); };
  return <section className="preset-section" aria-labelledby="preset-heading">
    <div className="preset-title"><h3 id="preset-heading">Quick looks</h3><span className="active-preset">{activePreset}</span></div>
    <div className="preset-list">{Object.entries(PRESETS).map(([name, preset]) => <button key={name} type="button" className={`preset ${activePreset === name ? 'selected' : ''}`} onClick={() => choose(name)} aria-pressed={activePreset === name}>
      <span className="preset-swatch" style={{ '--swatch-fg': preset.foreground, '--swatch-bg': preset.background }}><i/><i/><i/><i/><i/><i/><i/><i/><i/></span><span>{name}</span>
    </button>)}</div>
  </section>;
}
