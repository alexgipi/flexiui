<script lang="ts">
  import { BubbleMenu } from "svelte-tiptap";

  let { editor, accentSoft = false } = $props();

  let imageUrlInputEl: HTMLInputElement = $state(null) as HTMLInputElement;
  let imageUrlInputValue: string = $state(null);

  function setLink() {
    const previousUrl = $editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      $editor.chain().focus().extendMarkRange("link").unsetLink().run();

      return;
    }

    try {
      $editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();

      setTimeout(() => {
        const allLinks = $editor.view.dom.querySelectorAll("a");

        allLinks.forEach((link: any) => {
          link.addEventListener("click", (e: any) => {
            e.preventDefault();
          });
        });
      }, 100);
    } catch (e) {
      // console.log(e.message);
    }
  }
</script>

<!-- Image Menu -->
<div class="hidden">
  <BubbleMenu
    editor={$editor}
    shouldShow={() => {
      const emptySelection = $editor.state.selection.empty;
      if (emptySelection) {
        return false;
      }
      return $editor.isActive("image");
    }}
  >
    <div data-test-id="bubble-menu" class="fl-bubble-menu flex">
      <input
        class="fl-editor-image-url-input"
        type="text"
        placeholder="Insert image url"
        bind:this={imageUrlInputEl}
        value={$editor.getAttributes("image").src}
        oninput={(e: any) => {
          // console.log(e.target.value);
          imageUrlInputValue = e.target.value;
        }}
        onkeydown={(e: any) => {
          if (e.key === "Enter") {
            e.preventDefault();
            $editor
              .chain()
              .focus()
              .setImage({ src: imageUrlInputEl?.value })
              .run();
          }
        }}
      />
      <button
        type="button"
        aria-label="Insert image from url"
        disabled={!imageUrlInputValue ||
          imageUrlInputValue === $editor.getAttributes("image").src}
        class:is-active={imageUrlInputValue &&
          imageUrlInputValue !== $editor.getAttributes("image").src}
        class:accent-soft={accentSoft}
        onclick={() => {
          $editor
            .chain()
            .focus()
            .setImage({ src: imageUrlInputEl?.value })
            .run();
        }}
      >
        <svg
          width="16"
          height="16"
          class="tiptap-button-icon"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          ><path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M21 4C21 3.44772 20.5523 3 20 3C19.4477 3 19 3.44772 19 4V11C19 11.7956 18.6839 12.5587 18.1213 13.1213C17.5587 13.6839 16.7956 14 16 14H6.41421L9.70711 10.7071C10.0976 10.3166 10.0976 9.68342 9.70711 9.29289C9.31658 8.90237 8.68342 8.90237 8.29289 9.29289L3.29289 14.2929C2.90237 14.6834 2.90237 15.3166 3.29289 15.7071L8.29289 20.7071C8.68342 21.0976 9.31658 21.0976 9.70711 20.7071C10.0976 20.3166 10.0976 19.6834 9.70711 19.2929L6.41421 16H16C17.3261 16 18.5979 15.4732 19.5355 14.5355C20.4732 13.5979 21 12.3261 21 11V4Z"
            fill="currentColor"
            class="s-m1-89pp0R0Iu"
          ></path></svg
        >
      </button>

      <button
        type="button"
        onclick={() => setLink()}
        class="fl-bubble-menu-mark-button"
        class:is-active={$editor.isActive("link")}
        class:accent-soft={accentSoft}
        aria-label="Link"
      >
        <svg
          width="16"
          height="16"
          class="tiptap-button-icon"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          ><path
            d="M16.9958 1.06669C15.4226 1.05302 13.907 1.65779 12.7753 2.75074L12.765 2.76086L11.045 4.47086C10.6534 4.86024 10.6515 5.49341 11.0409 5.88507C11.4303 6.27673 12.0634 6.27858 12.4551 5.88919L14.1697 4.18456C14.9236 3.45893 15.9319 3.05752 16.9784 3.06662C18.0272 3.07573 19.0304 3.49641 19.772 4.23804C20.5137 4.97967 20.9344 5.98292 20.9435 7.03171C20.9526 8.07776 20.5515 9.08563 19.8265 9.83941L16.833 12.8329C16.4274 13.2386 15.9393 13.5524 15.4019 13.7529C14.8645 13.9533 14.2903 14.0359 13.7181 13.9949C13.146 13.9539 12.5894 13.7904 12.0861 13.5154C11.5827 13.2404 11.1444 12.8604 10.8008 12.401C10.47 11.9588 9.84333 11.8685 9.40108 12.1993C8.95883 12.5301 8.86849 13.1568 9.1993 13.599C9.71464 14.288 10.3721 14.858 11.1272 15.2705C11.8822 15.683 12.7171 15.9283 13.5753 15.9898C14.4334 16.0513 15.2948 15.9274 16.1009 15.6267C16.907 15.326 17.639 14.8555 18.2473 14.247L21.2472 11.2471L21.2593 11.2347C22.3523 10.1031 22.9571 8.58751 22.9434 7.01433C22.9297 5.44115 22.2987 3.93628 21.1863 2.82383C20.0738 1.71138 18.5689 1.08036 16.9958 1.06669Z"
            fill="currentColor"
          ></path><path
            d="M10.4247 8.0102C9.56657 7.94874 8.70522 8.07256 7.89911 8.37326C7.09305 8.67395 6.36096 9.14458 5.75272 9.753L2.75285 12.7529L2.74067 12.7653C1.64772 13.8969 1.04295 15.4125 1.05662 16.9857C1.07029 18.5589 1.70131 20.0637 2.81376 21.1762C3.9262 22.2886 5.43108 22.9196 7.00426 22.9333C8.57744 22.947 10.0931 22.3422 11.2247 21.2493L11.2371 21.2371L12.9471 19.5271C13.3376 19.1366 13.3376 18.5034 12.9471 18.1129C12.5565 17.7223 11.9234 17.7223 11.5328 18.1129L9.82932 19.8164C9.07555 20.5414 8.06768 20.9425 7.02164 20.9334C5.97285 20.9243 4.9696 20.5036 4.22797 19.762C3.48634 19.0203 3.06566 18.0171 3.05655 16.9683C3.04746 15.9222 3.44851 14.9144 4.17355 14.1606L7.16719 11.167C7.5727 10.7613 8.06071 10.4476 8.59811 10.2471C9.13552 10.0467 9.70976 9.96412 10.2819 10.0051C10.854 10.0461 11.4106 10.2096 11.9139 10.4846C12.4173 10.7596 12.8556 11.1397 13.1992 11.599C13.53 12.0412 14.1567 12.1316 14.5989 11.8007C15.0412 11.4699 15.1315 10.8433 14.8007 10.401C14.2854 9.71205 13.6279 9.14198 12.8729 8.72948C12.1178 8.31697 11.2829 8.07166 10.4247 8.0102Z"
            fill="currentColor"
          ></path></svg
        >
      </button>
    </div>
  </BubbleMenu>
</div>
