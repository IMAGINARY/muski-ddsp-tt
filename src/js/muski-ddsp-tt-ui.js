import '../scss/muski-ddsp-tt.scss';
import RecorderService from './lib/recorder-service';

const MAX_RECORDING_LEN = 15000;

export default class MusKiDDSPTTUI {
  constructor(ddsptt, options) {
    this.ddsptt = ddsptt;
    this.options = options;
    this.isBusy = false;
    this.isRecording = false;
    this.recorderService = null;
    this.lastRecording = null;
    this.recordingTimeout = null;

    this.$element = $('<div></div>')
      .addClass('muski-ddsp-tt');

    this.$status = $('<div></div>')
      .addClass(['alert', 'alert-secondary', 'muski-toy-status'])
      .hide()
      .appendTo(this.$element);

    this.$recordPane = $('<div></div>')
      .addClass(['record-pane', 'mb-3'])
      .appendTo(this.$element);

    this.$recordButton = $('<button></button>')
      .attr('type', 'button')
      .addClass(['btn', 'btn-record-stop'])
      .text('Record')
      .on('click', () => {
        this.handleRecordStopButton();
      })
      .appendTo(this.$recordPane);

    this.$recordBar = $('<div></div>')
      .addClass('record-progress-bar')
      .append($('<div></div>')
        .addClass('bar'))
      .appendTo(this.$recordPane);

    this.$recordSpinner = $('<div></div>')
      .addClass(['spinner-border', 'text-danger', 'record-spinner'])
      .append($('<span></span>')
        .addClass('visually-hidden')
        .text('Processing recording...'))
      .appendTo(this.$recordPane);

    this.hideRecordingSpinner();

    this.$toneButtons = Object.keys(this.options.models).map((model) => (
      $('<button></button>')
        .addClass(['btn', 'mx-2', 'mb-2', 'muski-ddsp-tt-tone', `muski-ddsp-tt-tone-${model}`])
        .attr('type', 'button')
        .on('click', () => {
          this.handleToneButton(model);
        })
        .text(model)
    ));

    this.$toneButtonPanel = $('<div></div>')
      .addClass('tone-buttons text-center mb-3')
      .append(this.$toneButtons)
      .append(this.$toneSpinner)
      .appendTo(this.$element)
      .hide();

    this.$audioPane = $('<div></div>')
      .addClass('audio-pane')
      .appendTo(this.$element);

    this.$player = $('<audio></audio>')
      .attr('controls', 'controls')
      .appendTo(this.$audioPane);

    this.hidePlayer();

    this.$audioSpinner = $('<div></div>')
      .addClass(['spinner-border', 'audio-spinner'])
      .append($('<span></span>')
        .addClass('visually-hidden')
        .text('Transferring tone...'))
      .appendTo(this.$audioPane);

    this.hideAudioSpinner();

    this.ddsptt.events.on('initStart', () => {
      this.onInitStart();
    }).on('initEnd', () => {
      this.onInitEnd();
      this.$toneButtonPanel.show();
    }).on('status', (message) => {
      this.onStatus(message);
    }).on('toneTransferred', (url) => {
      this.$player.attr('src', url);
      this.hideAudioSpinner();
      this.showPlayer();
      this.$player[0].play();
    });

    this.disableToneButtons();
  }

  setStatus(message) {
    this.$status.text(message);
  }

  disableToneButtons() {
    this.$toneButtons.forEach((button) => {
      button.attr('disabled', 'disabled').addClass('disabled');
    });
  }

  enableToneButtons() {
    this.$toneButtons.forEach((button) => {
      button.removeAttr('disabled').removeClass('disabled');
    });
  }

  hidePlayer() {
    this.$player[0].pause();
    this.$player.css({ visibility: 'hidden' });
  }

  showPlayer() {
    this.$player.css({ visibility: 'visible' });
  }

  showRecordingSpinner() {
    this.$recordButton.addClass('busy');
    this.$recordSpinner.show();
  }

  hideRecordingSpinner() {
    this.$recordButton.removeClass('busy');
    this.$recordSpinner.hide();
  }

  showAudioSpinner() {
    this.$audioSpinner.show();
  }

  hideAudioSpinner() {
    this.$audioSpinner.hide();
  }

  async init() {
    this.recorderService = new RecorderService();
    this.recorderService.em.addEventListener('recording', (ev) => {
      this.onRecording(ev.detail.recording);
    });
    await this.ddsptt.init();
    // await this.ddsptt.loadAudio('audio/plinplin.mp3');
  }

  async handleRecordStopButton() {
    if (!this.isBusy) {
      this.isBusy = true;
      if (!this.isRecording) {
        this.startRecording();
      } else {
        this.stopRecording();
      }
      this.isBusy = false;
    }
  }

  async startRecording() {
    if (!this.isRecording) {
      this.isRecording = true;
      this.$recordButton.addClass('recording');
      this.$recordBar.addClass('recording');
      this.disableToneButtons();
      this.hidePlayer();
      this.recordingTimeout = setTimeout(() => {
        this.stopRecording();
      }, MAX_RECORDING_LEN);
      await this.recorderService.startRecording();
      this.setStatus('Recording...');
    }
  }

  stopRecording() {
    if (this.isRecording) {
      this.recorderService.stopRecording();
      this.$recordButton.removeClass('recording');
      this.$recordBar.removeClass('recording');
      this.isRecording = false;
    }
  }

  async handleToneButton(model) {
    if (!this.isBusy) {
      this.isBusy = true;
      this.hidePlayer();
      this.showAudioSpinner();
      await this.ddsptt.toneTransfer(this.options.models[model]);
      this.isBusy = false;
    }
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
    this.showRecordingSpinner();
    await this.ddsptt.loadAudio(this.lastRecording.blobUrl);
    this.enableToneButtons();
    this.hideRecordingSpinner();
  }
}
