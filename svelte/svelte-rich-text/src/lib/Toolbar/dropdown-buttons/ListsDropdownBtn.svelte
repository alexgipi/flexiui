<script lang="ts">
  const {
    editor,
    accentSoft = false,
    ariaLabel = "Lists",
    onToggleDropdown,
  } = $props();

  function handleClick(event: MouseEvent) {
    onToggleDropdown?.(event, "lists-dropdown");
  }
</script>

<!-- Lists dropdown btn -->
<button
  aria-label={ariaLabel}
  type="button"
  onclick={handleClick}
  class:is-active={$editor.isActive("bulletList") || $editor.isActive("orderedList") || $editor.isActive("taskList")}
  class:accent-soft={accentSoft}
>
  {#if $editor.isActive("bulletList")}
    <svg
      width="24"
      height="24"
      class="tiptap-button-icon"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      ><path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M7 6C7 5.44772 7.44772 5 8 5H21C21.5523 5 22 5.44772 22 6C22 6.55228 21.5523 7 21 7H8C7.44772 7 7 6.55228 7 6Z"
        fill="currentColor"
      ></path><path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M7 12C7 11.4477 7.44772 11 8 11H21C21.5523 11 22 11.4477 22 12C22 12.5523 21.5523 13 21 13H8C7.44772 13 7 12.5523 7 12Z"
        fill="currentColor"
      ></path><path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M7 18C7 17.4477 7.44772 17 8 17H21C21.5523 17 22 17.4477 22 18C22 18.5523 21.5523 19 21 19H8C7.44772 19 7 18.5523 7 18Z"
        fill="currentColor"
      ></path><path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M2 6C2 5.44772 2.44772 5 3 5H3.01C3.56228 5 4.01 5.44772 4.01 6C4.01 6.55228 3.56228 7 3.01 7H3C2.44772 7 2 6.55228 2 6Z"
        fill="currentColor"
      ></path><path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M2 12C2 11.4477 2.44772 11 3 11H3.01C3.56228 11 4.01 11.4477 4.01 12C4.01 12.5523 3.56228 13 3.01 13H3C2.44772 13 2 12.5523 2 12Z"
        fill="currentColor"
      ></path><path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M2 18C2 17.4477 2.44772 17 3 17H3.01C3.56228 17 4.01 17.4477 4.01 18C4.01 18.5523 3.56228 19 3.01 19H3C2.44772 19 2 18.5523 2 18Z"
        fill="currentColor"
      ></path></svg
    >
  {:else if $editor.isActive("orderedList")}
    <svg
      width="24"
      height="24"
      class="tiptap-button-icon"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      ><path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M9 6C9 5.44772 9.44772 5 10 5H21C21.5523 5 22 5.44772 22 6C22 6.55228 21.5523 7 21 7H10C9.44772 7 9 6.55228 9 6Z"
        fill="currentColor"
      ></path><path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M9 12C9 11.4477 9.44772 11 10 11H21C21.5523 11 22 11.4477 22 12C22 12.5523 21.5523 13 21 13H10C9.44772 13 9 12.5523 9 12Z"
        fill="currentColor"
      ></path><path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M9 18C9 17.4477 9.44772 17 10 17H21C21.5523 17 22 17.4477 22 18C22 18.5523 21.5523 19 21 19H10C9.44772 19 9 18.5523 9 18Z"
        fill="currentColor"
      ></path><path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M3 6C3 5.44772 3.44772 5 4 5H5C5.55228 5 6 5.44772 6 6V10C6 10.5523 5.55228 11 5 11C4.44772 11 4 10.5523 4 10V7C3.44772 7 3 6.55228 3 6Z"
        fill="currentColor"
      ></path><path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M3 10C3 9.44772 3.44772 9 4 9H6C6.55228 9 7 9.44772 7 10C7 10.5523 6.55228 11 6 11H4C3.44772 11 3 10.5523 3 10Z"
        fill="currentColor"
      ></path><path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M5.82219 13.0431C6.54543 13.4047 6.99997 14.1319 6.99997 15C6.99997 15.5763 6.71806 16.0426 6.48747 16.35C6.31395 16.5814 6.1052 16.8044 5.91309 17H5.99997C6.55226 17 6.99997 17.4477 6.99997 18C6.99997 18.5523 6.55226 19 5.99997 19H3.99997C3.44769 19 2.99997 18.5523 2.99997 18C2.99997 17.4237 3.28189 16.9575 3.51247 16.65C3.74323 16.3424 4.03626 16.0494 4.26965 15.8161C4.27745 15.8083 4.2852 15.8006 4.29287 15.7929C4.55594 15.5298 4.75095 15.3321 4.88748 15.15C4.96287 15.0495 4.99021 14.9922 4.99911 14.9714C4.99535 14.9112 4.9803 14.882 4.9739 14.8715C4.96613 14.8588 4.95382 14.845 4.92776 14.8319C4.87723 14.8067 4.71156 14.7623 4.44719 14.8944C3.95321 15.1414 3.35254 14.9412 3.10555 14.4472C2.85856 13.9533 3.05878 13.3526 3.55276 13.1056C4.28839 12.7378 5.12272 12.6934 5.82219 13.0431Z"
        fill="currentColor"
      ></path></svg
    >
  {:else if $editor.isActive("taskList")}
    <svg
      width="24"
      height="24"
      class="tiptap-button-icon"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      ><path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M2 6C2 4.89543 2.89543 4 4 4H8C9.10457 4 10 4.89543 10 6V10C10 11.1046 9.10457 12 8 12H4C2.89543 12 2 11.1046 2 10V6ZM8 6H4V10H8V6Z"
        fill="currentColor"
      ></path><path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M9.70711 14.2929C10.0976 14.6834 10.0976 15.3166 9.70711 15.7071L5.70711 19.7071C5.31658 20.0976 4.68342 20.0976 4.29289 19.7071L2.29289 17.7071C1.90237 17.3166 1.90237 16.6834 2.29289 16.2929C2.68342 15.9024 3.31658 15.9024 3.70711 16.2929L5 17.5858L8.29289 14.2929C8.68342 13.9024 9.31658 13.9024 9.70711 14.2929Z"
        fill="currentColor"
      ></path><path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M12 6C12 5.44772 12.4477 5 13 5H21C21.5523 5 22 5.44772 22 6C22 6.55228 21.5523 7 21 7H13C12.4477 7 12 6.55228 12 6Z"
        fill="currentColor"
      ></path><path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M12 12C12 11.4477 12.4477 11 13 11H21C21.5523 11 22 11.4477 22 12C22 12.5523 21.5523 13 21 13H13C12.4477 13 12 12.5523 12 12Z"
        fill="currentColor"
      ></path><path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M12 18C12 17.4477 12.4477 17 13 17H21C21.5523 17 22 17.4477 22 18C22 18.5523 21.5523 19 21 19H13C12.4477 19 12 18.5523 12 18Z"
        fill="currentColor"
      ></path></svg
    >
  {:else}
    <svg
      width="24"
      height="24"
      class="tiptap-button-icon"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      ><path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M7 6C7 5.44772 7.44772 5 8 5H21C21.5523 5 22 5.44772 22 6C22 6.55228 21.5523 7 21 7H8C7.44772 7 7 6.55228 7 6Z"
        fill="currentColor"
      ></path><path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M7 12C7 11.4477 7.44772 11 8 11H21C21.5523 11 22 11.4477 22 12C22 12.5523 21.5523 13 21 13H8C7.44772 13 7 12.5523 7 12Z"
        fill="currentColor"
      ></path><path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M7 18C7 17.4477 7.44772 17 8 17H21C21.5523 17 22 17.4477 22 18C22 18.5523 21.5523 19 21 19H8C7.44772 19 7 18.5523 7 18Z"
        fill="currentColor"
      ></path><path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M2 6C2 5.44772 2.44772 5 3 5H3.01C3.56228 5 4.01 5.44772 4.01 6C4.01 6.55228 3.56228 7 3.01 7H3C2.44772 7 2 6.55228 2 6Z"
        fill="currentColor"
      ></path><path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M2 12C2 11.4477 2.44772 11 3 11H3.01C3.56228 11 4.01 11.4477 4.01 12C4.01 12.5523 3.56228 13 3.01 13H3C2.44772 13 2 12.5523 2 12Z"
        fill="currentColor"
      ></path><path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M2 18C2 17.4477 2.44772 17 3 17H3.01C3.56228 17 4.01 17.4477 4.01 18C4.01 18.5523 3.56228 19 3.01 19H3C2.44772 19 2 18.5523 2 18Z"
        fill="currentColor"
      ></path></svg
    >
  {/if}

  <svg
    class="toogle-dropdown-button-icon"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 10 6"
  >
    <use href="#dropdown-arrow"></use>
  </svg>
</button>
