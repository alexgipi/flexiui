<script lang="ts" generics="T extends keyof SvelteHTMLElements = 'div'">
  import { onDestroy, onMount, tick } from 'svelte';
  import type { SvelteHTMLElements } from 'svelte/elements';
  import type { ComponentInputProps } from './types';

  type Props = ComponentInputProps<{}> & SvelteHTMLElements[T] & {
    as?: T;
  };

  const { editor, children, class: className, as = 'div' as T, ...rest }: Props = $props();
  let element: HTMLElement;

  const init = async () => {
    await tick();
    if (!element) {
      return;
    }

    if (!editor?.options.element) {
      return;
    }

    if (editor.contentElement) {
      return;
    }

    const editorElement = editor.options.element;
    
    if (editorElement instanceof HTMLElement) {
      element.append(...Array.from(editorElement.childNodes));
      editor.setOptions({ element });
      editor.contentElement = element;
    }
  };

  onMount(init);

  onDestroy(() => {
    if (!editor) {
      return;
    }

    editor.contentElement = null;

    const editorElement = editor.options.element;
    
    if (editorElement instanceof HTMLElement && editorElement.firstChild) {
      const newElement = document.createElement('div');
      newElement.append(...Array.from(editorElement.childNodes));

      editor.setOptions({
        element: newElement,
      });
    }
  });
</script>

<svelte:element this={as} bind:this={element} class={className} {...rest}>
  {#if children}
    {@render children()}
  {/if}
</svelte:element>