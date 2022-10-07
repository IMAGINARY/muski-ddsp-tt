import '../scss/muski-ddsp-tt.scss';
import RecorderService from './lib/recorder-service';

export default class MusKiDDSPTTUI {
  constructor(ddsptt, options) {
    this.ddsptt = ddsptt;
    this.options = options;
    this.recorderService = null;
    this.lastRecording = null;

    this.$element = $('<div></div>')
      .addClass('muski-ddsp-tt');

    this.$initButton = $('<button></button>')
      .attr('type', 'button')
      .addClass(['btn', 'btn-primary', 'mb-3'])
      .text('Start')
      .on('click', () => {
        this.handleInitButton();
      })
      .appendTo(this.$element);

    this.$status = $('<div></div>')
      .addClass(['alert', 'alert-secondary', 'muski-toy-status'])
      .appendTo(this.$element);

    this.$inputButtons = $('<div></div>')
      .addClass(['btn-group', 'd-block', 'mb-3'])
      .appendTo(this.$element);

    this.$recordButton = $('<button></button>')
      .attr('type', 'button')
      .addClass(['btn', 'btn-primary', 'mb-3'])
      .text('Record')
      .on('click', () => {
        this.handleRecordButton();
      })
      .appendTo(this.$inputButtons);

    this.$stopButton = $('<button></button>')
      .attr('type', 'button')
      .addClass(['btn', 'btn-primary', 'mb-3'])
      .text('Stop')
      .on('click', () => {
        this.handleStopButton();
      })
      .appendTo(this.$inputButtons);

    this.$toneButtons = Object.keys(this.options.models).map((model) => (
      $('<button></button>')
        .addClass(['btn', 'btn-secondary', 'mr-2'])
        .attr('type', 'button')
        .on('click', () => {
          this.handleToneButton(model);
        })
        .text(model)
    ));

    this.$toneButtonPanel = $('<div></div>')
      .addClass('btn-group mb-3')
      .append(this.$toneButtons)
      .appendTo(this.$element)
      .hide();

    this.$player = $('<audio></audio>')
      .attr('controls', 'controls')
      .css({ display: 'none' })
      .appendTo(this.$element);

    this.ddsptt.events.on('initStart', () => {
      this.onInitStart();
    }).on('initEnd', () => {
      this.onInitEnd();
      this.$toneButtonPanel.show();
    }).on('status', (message) => {
      this.onStatus(message);
    }).on('toneTransferred', (url) => {
      this.$player.attr('src', url);
      this.$player.css({ display: 'block' });
    });
  }

  setStatus(message) {
    this.$status.text(message);
  }

  async handleInitButton() {
    this.recorderService = new RecorderService();
    this.recorderService.em.addEventListener('recording', (ev) => {
      this.onRecording(ev.detail.recording);
    });
    this.$initButton.hide();
    await this.ddsptt.init();
    // await this.ddsptt.loadAudio('audio/plinplin.mp3');
  }

  async handleRecordButton() {
    await this.recorderService.startRecording();
    this.setStatus('Recording...');
  }

  async handleStopButton() {
    this.recorderService.stopRecording();
  }

  async handleToneButton(model) {
    this.$player.hide();
    await this.ddsptt.toneTransfer(this.options.models[model]);
    this.$player.show();
  }

  onInitStart() {
    this.setStatus('Initializing...');
  }

  onInitEnd() {
    this.setStatus('Initialized!');
  }

  onStatus(message) {
    this.setStatus(message);
  }

  async onRecording(recording) {
    this.lastRecording = recording;
    this.setStatus('Recording done.');
    console.log(this.lastRecording.blobUrl, this.lastRecording.mimeType, this.lastRecording.size);
    await this.ddsptt.loadAudio(this.lastRecording.blobUrl);
  }
}
