import RichText from './RichText.svelte';
import { renderHTMLFromJSON } from './renderRichText';
import { Placeholder as PlaceholderExt } from './extensions/Placeholder';
import { Audio as AudioExt } from './extensions/Audio';
import { audioAttributes } from './extensions/audioStore';

export {
    RichText,
    PlaceholderExt,
    AudioExt,
    renderHTMLFromJSON,
    audioAttributes,
};