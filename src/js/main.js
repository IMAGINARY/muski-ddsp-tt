import MuskiDDSPTT from './muski-ddsp-tt';
import MusKiDDSPTTUI from './muski-ddsp-tt-ui';

$('[data-component=muski-ddsp-tt]').first().each(async (i, element) => {
  const ddsptt = new MuskiDDSPTT();
  const ui = new MusKiDDSPTTUI(ddsptt, {
    models: {
      trumpet: 'models/trumpet',
      violin: 'models/violin',
      flute: 'models/flute',
      tenor_saxophone: 'models/tenor_saxophone',
    },
  });
  await ui.init();
  $(element).replaceWith(ui.$element);
});
