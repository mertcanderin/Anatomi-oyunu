/**
 * Ses Yöneticisi (AudioManager)
 * Harici ses dosyası gerektirmeden Web Audio API ile çocuk dostu oyun sesleri üretir,
 * ayrıca parça tanımlarında harici ses dosyası (audioUrl) varsa onu çalar ve
 * Web Speech API ile Türkçe seslendirme desteği sunar.
 */
export class AudioManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  /**
   * İlk kullanıcı dokunuşunda AudioContext'i başlatır (iOS/Android autoplay kısıtlaması için).
   */
  unlock() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Parça tutulduğunda tatlı bir "pop" sesi çalar.
   */
  playPickup() {
    if (!this.enabled) return;
    this.unlock();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(580, now + 0.09);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  /**
   * Parça doğru hedefe oturduğunda neşeli iki notalı başarı sesi çalar.
   */
  playSnapSuccess() {
    if (!this.enabled) return;
    this.unlock();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99]; // C5 - E5 - G5
    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.075;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    });
  }

  /**
   * Parça hedef dışına bırakılıp başlangıç noktasına dönerken yumuşak geri dönüş sesi çalar.
   */
  playReturn() {
    if (!this.enabled) return;
    this.unlock();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(360, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.14);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  /**
   * Modül tamamlandığında kutlama fanfarı çalar.
   */
  playCelebration() {
    if (!this.enabled) return;
    this.unlock();
    if (!this.ctx) return;

    const melody = [
      { freq: 523.25, delay: 0.0, dur: 0.15 },
      { freq: 659.25, delay: 0.13, dur: 0.15 },
      { freq: 783.99, delay: 0.26, dur: 0.15 },
      { freq: 1046.5, delay: 0.4, dur: 0.45 }
    ];

    melody.forEach((note) => {
      const now = this.ctx.currentTime + note.delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.freq, now);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + note.dur);
    });
  }

  /**
   * Parça adını Türkçe seslendirir (destekleyen cihazlarda).
   * @param {string} text
   */
  speak(text) {
    if (!this.enabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'tr-TR';
      utterance.rate = 0.95;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Seslendirme desteklenmiyorsa sessizce geç
    }
  }
}

