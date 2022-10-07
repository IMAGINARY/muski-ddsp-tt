import EventEmitter from 'events';
// eslint-disable-next-line import/no-unresolved
import { SPICE, DDSP } from '@magenta/music';
import encodeWAV from './lib/encode-wav';

export default class MuskiDDSPTT {
  constructor(models) {
    this.events = new EventEmitter();
    this.spice = new SPICE();
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
