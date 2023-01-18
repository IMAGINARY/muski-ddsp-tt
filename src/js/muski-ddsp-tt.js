import EventEmitter from 'events';
// eslint-disable-next-line import/no-unresolved
import { SPICE, DDSP } from '@magenta/music';
import encodeWAV from './lib/encode-wav';

export default class MuskiDDSPTT {
  constructor(spiceCheckpointUrl) {
    this.events = new EventEmitter();
    this.spice = new SPICE(spiceCheckpointUrl);
    this.audioContext = null;
  }

  async init() {
    this.events.emit('initStart');
    await this.spice.initialize();
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContext();
    this.events.emit('initEnd');
  }

  async loadAudio(src) {
    this.events.emit('status', 'Loading audio...');
    const audioFile = await fetch(src);
    const arrayBuffer = await audioFile.arrayBuffer();
    this.events.emit('status', 'Decoding audio...');
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    this.events.emit('status', 'Determining audio features...');
    this.audioFeatures = await this.spice.getAudioFeatures(audioBuffer);

    function inspect(name, obj) {
      const items = [name, typeof obj];
      if (Array.isArray(obj) && obj.length > 0) {
        items.push(`of ${typeof obj[0]}`);
        if (typeof obj[0] === 'number') {
          items.push(`between (${Math.min(...obj)} and ${Math.max(...obj)})`);
        }
      } else if (typeof obj === 'object') {
        items.push(`with keys ${Object.keys(obj).join(', ')}`);
      }

      if (obj.length) {
        items.push(`length: ${obj.length}`);
      }
      console.log(...items);
    }

    // Todo: Use the data below to create a visualization of the audio features.
    // f0_hz is the frequency of audio in 32ms frames
    // (actually, I think it's 16000/512 ms, but Magenta guys treat it as 32ms)
    // inspect('f0_hz', this.audioFeatures.f0_hz);
    // loudness_db is the loudness of audio
    // (in 4ms frames?)
    // inspect('loudness_db', this.audioFeatures.loudness_db);
    // inspect('confidences', this.audioFeatures.confidences);
    // window.features = this.audioFeatures;
    this.events.emit('status', 'Done.');
  }

  async toneTransfer(model, settings = null) {
    const ddsp = new DDSP(model, settings);
    await ddsp.initialize();
    const toneTransferredAudioData = await ddsp.synthesize(this.audioFeatures);
    const dataview = encodeWAV(toneTransferredAudioData, this.audioContext.sampleRate);
    const blob = new Blob([dataview], { type: 'audio/wav' });
    ddsp.dispose();
    const url = window.URL.createObjectURL(blob);
    this.events.emit('toneTransferred', url);
    return url;
  }
}
