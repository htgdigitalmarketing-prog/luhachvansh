// Browser speech recognition for Mitra (https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition).
// Started only by an explicit click, one utterance at a time. It never submits a question: the transcript lands
// in the editable text box. Cancel restores the text that was there before listening started.
export const VOICE_LANGS = { hi: 'hi-IN', en: 'en-IN' };
export const speechSupport = (w = globalThis) => w?.SpeechRecognition || w?.webkitSpeechRecognition || null;
// Maps SpeechRecognitionErrorEvent.error codes to the messages Mitra shows; `aborted` follows our own cancel.
export function voiceError(code) {
  if (code === 'aborted') return null;
  return ({ 'not-allowed': 'denied', 'service-not-allowed': 'denied', 'audio-capture': 'no-microphone', 'no-speech': 'no-speech', network: 'network', 'language-not-supported': 'language' })[code] || 'failed';
}
export function joinTranscript(base, spoken) {
  const words = String(spoken || '').replace(/\s+/g, ' ').trim();
  if (!words) return base;
  return base.trim() ? base.replace(/\s+$/, '') + ' ' + words : words;
}
export function createVoiceSession({ Recognition, lang, base = '', onText, onState }) {
  const r = new Recognition();
  r.lang = lang; r.interimResults = true; r.continuous = false; r.maxAlternatives = 1;
  let final = '', interim = '', cancelled = false, ended = false;
  r.onstart = () => onState({ listening: true });
  r.onresult = (e) => {
    interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const result = e.results[i];
      if (result.isFinal) final += ' ' + result[0].transcript; else interim += ' ' + result[0].transcript;
    }
    if (!cancelled) onText(joinTranscript(base, final + ' ' + interim));
  };
  r.onerror = (e) => { const error = voiceError(e.error); if (error && !cancelled) onState({ listening: false, error }); };
  r.onend = () => {
    ended = true;
    // Keep the last words shown even if the service ended before marking them final.
    if (!cancelled) onText(joinTranscript(base, final.trim() ? final : interim));
    onState({ listening: false });
  };
  r.start();
  return {
    stop() { if (!ended) r.stop(); },
    cancel() { cancelled = true; onText(base); if (!ended) r.abort(); },
    // Used when the chat closes or the page is hidden: stop the microphone, keep the text already shown.
    dispose() { cancelled = true; if (!ended) r.abort(); },
  };
}
