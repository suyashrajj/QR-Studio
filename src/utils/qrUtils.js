import QRCode from 'qrcode';

export const DEFAULT_FORM = {
  url: { url: 'https://example.com' },
  text: { text: '' },
  email: { email: '', subject: '', message: '' },
  phone: { phone: '' },
  wifi: { ssid: '', security: 'WPA', password: '', hidden: false }
};

export const DEFAULT_SETTINGS = {
  size: 320, foreground: '#20231F', background: '#FFFFFF', correction: 'H', margin: 4
};

export const PRESETS = {
  Classic: { foreground: '#20231F', background: '#FFFFFF', correction: 'M', margin: 4 },
  Ink: { foreground: '#20231F', background: '#F5F3ED', correction: 'H', margin: 4 },
  Terracotta: { foreground: '#D94F30', background: '#FFFFFF', correction: 'H', margin: 4 },
  Reverse: { foreground: '#FFFFFF', background: '#20231F', correction: 'H', margin: 4 }
};

export const QR_TYPES = [
  { id: 'url', label: 'URL', hint: 'Open a website' },
  { id: 'text', label: 'Plain text', hint: 'Share a message' },
  { id: 'email', label: 'Email', hint: 'Start an email' },
  { id: 'phone', label: 'Phone', hint: 'Call a number' },
  { id: 'wifi', label: 'Wi-Fi', hint: 'Join a network' }
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function escapeWifi(value = '') {
  return String(value).replace(/([\\;,:"'])/g, '\\$1');
}

export function buildPayload(type, form) {
  const values = form[type] || {};
  if (type === 'url') {
    const raw = (values.url || '').trim();
    if (!raw) return { payload: '', error: 'Enter a URL to create a QR code.' };
    try {
      const parsed = new URL(raw);
      if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname) throw new Error();
      return { payload: parsed.href, error: '' };
    } catch { return { payload: '', error: 'Enter a valid URL beginning with http:// or https://.' }; }
  }
  if (type === 'text') {
    const text = values.text || '';
    return text.trim() ? { payload: text, error: '' } : { payload: '', error: 'Enter some text. Blank content cannot be encoded.' };
  }
  if (type === 'email') {
    const email = (values.email || '').trim();
    if (!email) return { payload: '', error: 'Enter a recipient email address.' };
    if (!emailPattern.test(email)) return { payload: '', error: 'Enter a valid email address, such as name@example.com.' };
    const params = new URLSearchParams();
    if (values.subject) params.set('subject', values.subject);
    if (values.message) params.set('body', values.message);
    const query = params.toString();
    return { payload: `mailto:${email}${query ? `?${query}` : ''}`, error: '' };
  }
  if (type === 'phone') {
    const phone = (values.phone || '').trim();
    if (!phone) return { payload: '', error: 'Enter a phone number.' };
    if (!/^\+?[\d\s()\-]+$/.test(phone) || phone.replace(/\D/g, '').length < 7 || phone.replace(/\D/g, '').length > 15) {
      return { payload: '', error: 'Use digits, spaces, parentheses or hyphens, with 7–15 digits.' };
    }
    return { payload: `tel:${phone.replace(/[\s()\-]/g, '')}`, error: '' };
  }
  if (type === 'wifi') {
    const ssid = values.ssid || '';
    if (!ssid.trim()) return { payload: '', error: 'Enter the Wi-Fi network name (SSID).' };
    if (values.security !== 'nopass' && !(values.password || '')) return { payload: '', error: 'Enter a password for this secured network.' };
    const security = values.security === 'None' ? 'nopass' : values.security;
    const payload = `WIFI:T:${security};S:${escapeWifi(ssid)};${security === 'nopass' ? '' : `P:${escapeWifi(values.password)};`}H:${Boolean(values.hidden)};;`;
    return { payload, error: '' };
  }
  return { payload: '', error: 'Choose a QR type.' };
}

export function getLabel(type, form) {
  const values = form[type] || {};
  const raw = type === 'url' ? values.url : type === 'text' ? values.text : type === 'email' ? values.email : type === 'phone' ? values.phone : values.ssid;
  return String(raw || '').trim().replace(/^https?:\/\//, '').split(/[\n]/)[0].slice(0, 44) || QR_TYPES.find(item => item.id === type)?.label || 'QR code';
}

export function generateDataUrl(payload, settings) {
  return QRCode.toDataURL(payload, {
    width: Number(settings.size), margin: Number(settings.margin), errorCorrectionLevel: settings.correction,
    color: { dark: settings.foreground, light: settings.background }
  });
}

export function getContrastRatio(hex1, hex2) {
  const luminance = hex => {
    const channels = hex.replace('#', '').match(/.{2}/g).map(part => parseInt(part, 16) / 255).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  };
  const a = luminance(hex1), b = luminance(hex2);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
