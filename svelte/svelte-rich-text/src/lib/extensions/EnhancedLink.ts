import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Link } from '@tiptap/extension-link';

export const EnhancedLink = Link.extend({
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('linkClickHandler'),
        props: {
          handleClick: (view, _pos, event) => {
            // Special-handling only for Cmd+Click or mouse-wheel clicks, otherwise let TipTap handle it
            const qualifiedClick =
              event.button === 1 || (event.button === 0 && (event.metaKey || event.ctrlKey));

            if (!view.editable || !qualifiedClick) {
              return false;
            }

            let target = event.target as HTMLElement;
            while (target !== null && target.nodeName !== 'A' && target.nodeName !== 'DIV') {
              target = target.parentNode as HTMLElement;
            }

            if (target?.nodeName !== 'A') {
              return false;
            }

            const href = target.getAttribute('href');
            if (href === null) {
              return false;
            }

            window.open(href, '_blank', 'noreferrer');
            return true;
          },

        },
      }),
    ];
  },
});