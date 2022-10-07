import MuskiDDSPTT from './muski-ddsp-tt';
import MusKiDDSPTTUI from './muski-ddsp-tt-ui';

const ddsptt = new MuskiDDSPTT();

$('[data-component=muski-ddsp-tt]').each((i, element) => {
  const ui = new MusKiDDSPTTUI(ddsptt, {
    models: {
      trumpet: 'models/trumpet',
      violin: 'models/violin',
      flute: 'models/flute',
      tenor_saxophone: 'models/tenor_saxophone',
    },
  });
  $(element).append(ui.$element);
});
