/* Small pure PCM encoder shared by the SFX confirmation and its tests. */
(function (root) {
  function encode(audio, db) {
    if (!Number.isInteger(db) || db < -24 || db > 12) throw new Error('Invalid gain');
    const channels = audio.numberOfChannels, frames = audio.length, rate = audio.sampleRate;
    if (channels < 1 || channels > 2) throw new Error('Use 0 dB to insert multichannel audio unchanged.');
    const size = frames * channels * 2;
    if (size + 44 > 64 * 1024 * 1024) throw new Error('Sound is too long to adjust here. Use 0 dB for the original.');
    const bytes = new Uint8Array(size + 44), view = new DataView(bytes.buffer);
    const text = (at, s) => { for (let i = 0; i < s.length; i++) bytes[at + i] = s.charCodeAt(i); };
    text(0, 'RIFF'); view.setUint32(4, size + 36, true); text(8, 'WAVE'); text(12, 'fmt ');
    view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, channels, true);
    view.setUint32(24, rate, true); view.setUint32(28, rate * channels * 2, true);
    view.setUint16(32, channels * 2, true); view.setUint16(34, 16, true);
    text(36, 'data'); view.setUint32(40, size, true);
    const data = Array.from({ length: channels }, (_, ch) => audio.getChannelData(ch));
    const gain = Math.pow(10, db / 20);
    let clipped = false;
    for (let i = 0, at = 44; i < frames; i++) for (let ch = 0; ch < channels; ch++, at += 2) {
      const raw = data[ch][i] * gain;
      if (Math.abs(raw) > 1) clipped = true;
      const sample = Math.max(-1, Math.min(1, raw));
      view.setInt16(at, Math.round(sample * (sample < 0 ? 32768 : 32767)), true);
    }
    // Do not silently distort loud sounds: the user can turn down the gain and try again.
    if (clipped) throw new Error('This gain would clip. Reduce the volume and apply again.');
    return bytes;
  }
  if (typeof module !== 'undefined') module.exports = { encode };
  else root.daggerAudio = { encode };
})(typeof window !== 'undefined' ? window : globalThis);
