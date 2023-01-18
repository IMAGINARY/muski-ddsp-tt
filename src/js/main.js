import MuskiDDSPTT from './muski-ddsp-tt';
import MusKiDDSPTTUI from './muski-ddsp-tt-ui';

$('[data-component=muski-ddsp-tt]').first().each(async (i, element) => {
  const checkpointUrl = $(element).data('checkpoint-url') || 'models';
  const ddsptt = new MuskiDDSPTT(`${checkpointUrl}/spice`);
  const ui = new MusKiDDSPTTUI(ddsptt, {
    models: {
      trumpet: `${checkpointUrl}/trumpet`,
      violin: `${checkpointUrl}/violin`,
      flute: `${checkpointUrl}/flute`,
      tenor_saxophone: `${checkpointUrl}/tenor_saxophone`,
    },
  });
  await ui.init();
  $(element).replaceWith(ui.$element);
});
