<script lang="ts">
  import { HEADINGS } from "../../utils";

  const { editor, accentSoft = false, ariaLabel = "Headings",  onToggleDropdown, } = $props();

  function handleClick(event: MouseEvent) {
    onToggleDropdown?.(event, "headings-dropdown");
  }
</script>

<!-- Headings dropdown btn  -->
<button
  type="button"
  onclick={handleClick}
  class:is-active={$editor.isActive("heading") || $editor.isActive("h1") || $editor.isActive("h2") || $editor.isActive("h3") || $editor.isActive("h4") || $editor.isActive("h5") || $editor.isActive("h6")}
  class:accent-soft={accentSoft}
  aria-label={ariaLabel}
>
  {#if $editor.isActive("heading")}
    {#each HEADINGS as heading}
      {#if $editor.isActive("heading", { level: Number(heading.level) })}
        {@html heading.icon}
      {/if}
    {/each}
  {:else if $editor.isActive("h1")}
    {@html HEADINGS[0].icon}
  {:else if $editor.isActive("h2")}
    {@html HEADINGS[1].icon}
  {:else if $editor.isActive("h3")}
    {@html HEADINGS[2].icon}
  {:else if $editor.isActive("h4")}
    {@html HEADINGS[3].icon}
  {:else if $editor.isActive("h5")}
    {@html HEADINGS[4].icon}
  {:else if $editor.isActive("h6")}
    {@html HEADINGS[5].icon}

  {:else}
     <svg
        width="24"
        height="24"
        class="tiptap-button-icon"
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        ><path
          d="M6 3C6.55228 3 7 3.44772 7 4V11H17V4C17 3.44772 17.4477 3 18 3C18.5523 3 19 3.44772 19 4V20C19 20.5523 18.5523 21 18 21C17.4477 21 17 20.5523 17 20V13H7V20C7 20.5523 6.55228 21 6 21C5.44772 21 5 20.5523 5 20V4C5 3.44772 5.44772 3 6 3Z"
          fill="currentColor"
        ></path></svg
      >
  {/if}

  <svg
    class="toogle-dropdown-button-icon"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 20 12"
  >
    <defs>
      <symbol id="dropdown-arrow" viewBox="0 0 10 6" fill="none">
        <path
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="m1 1 4 4 4-4"
        ></path>
      </symbol>
    </defs>
    <use href="#dropdown-arrow"></use>
  </svg>
</button>
