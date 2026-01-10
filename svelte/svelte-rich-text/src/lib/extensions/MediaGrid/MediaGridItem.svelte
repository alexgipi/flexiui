<script lang="ts">
  import {
    computePosition,
    offset,
    autoUpdate,
    size,
    autoPlacement,
  } from "@floating-ui/dom";
  import type { NodeViewProps } from "@tiptap/core";
  import { onMount, onDestroy } from "svelte";
  import cx from "clsx";
  import { NodeViewContent, NodeViewWrapper } from "svelte-tiptap";
  import { refreshUserToken } from "./auth-service";

  const { node, editor, getPos, selected }: NodeViewProps = $props();

  const UPLOAD_API_URL = "http://localhost:3500/api/media";
  const UPLOADS_URL =
    "https://pub-503cb197f1134814ac02f257b9cde1c1.r2.dev/uploads/";
  let token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2Njk5NzY3ZTBhNmM3MzI3OTMwZWMxMGQiLCJuYW1lIjpudWxsLCJ1c2VybmFtZSI6ImFsZXhncDg5NSIsImVtYWlsIjoiYWxleGdwODk1QGdtYWlsLmNvbSIsInJvbGUiOiJzdXBlcl9hZG1pbiIsInJvbGVzIjpbInN1cGVyX2FkbWluIl0sImFkZHJlc3MiOiJDYXJyZXIgUHVpZ21hcsOtLCA3MTYiLCJsYXN0TG9nZ2VkSW5UZW5hbnQiOm51bGwsImlhdCI6MTc2MjQ3MDk2NiwiZXhwIjoxNzYyNDcxODY2fQ.BTkbEyT6vsim7EvHoxSyyCTErnh0smsqy-HsnHqCeQw";
  const refreshToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2Njk5NzY3ZTBhNmM3MzI3OTMwZWMxMGQiLCJuYW1lIjpudWxsLCJ1c2VybmFtZSI6ImFsZXhncDg5NSIsImVtYWlsIjoiYWxleGdwODk1QGdtYWlsLmNvbSIsInJvbGUiOiJzdXBlcl9hZG1pbiIsInJvbGVzIjpbInN1cGVyX2FkbWluIl0sImFkZHJlc3MiOiJDYXJyZXIgUHVpZ21hcsOtLCA3MTYiLCJ0ZW5hbnRzIjpbXSwibGFzdExvZ2dlZEluVGVuYW50IjpudWxsLCJpYXQiOjE3NjI0NjU3NjMsImV4cCI6MTc2NTA1Nzc2M30.V9IHMl8JwEOeEOMBeZRJ0BTAeEIoxzzWA87E1aAYBuU";
  let showIndicator = $state(false);
  let indicatorType = $state("numeric");
  let index = $state(0);
  let hasImage = $state(false);
  let dragging = $state(false);
  let uploading = $state(false);
  let uploadedFiles = [];
  let tooltipVisible = $state(false);
  let tooltipX = $state(0);
  let tooltipY = $state(0);
  let tooltip: HTMLDivElement = $state(null) as HTMLDivElement;
  let cleanup: () => void;
  let addGridMediaIconEl: HTMLElement = $state(null) as HTMLElement;
  let fileInput: HTMLInputElement = $state(null) as HTMLInputElement;

  function recompute() {
    const pos = typeof getPos === "function" ? getPos() : getPos;
    if (typeof pos !== "number") return;
    const resolvedPos = editor.state.doc.resolve(pos);
    const parent = resolvedPos.parent;

    if (parent?.type?.name === "MediaGridComponent") {
      showIndicator = !!parent.attrs.showIndicator;
      indicatorType = parent.attrs.indicatorType ?? "numeric";
      index = resolvedPos.index(resolvedPos.depth); // 👈 aquí el cambio
    } else {
      showIndicator = false;
    }

    if (node.childCount === 0) {
      hasImage = false;
    } else {
      hasImage = true;
    }
  }

  // Ejecuta al montar / cuando node cambie (útil para la primera vez)
  $effect(() => {
    recompute();
  });

  // Suscribe a los eventos del editor para detectar cambios en el documento
  let _onUpdate: () => void;
  let _onTransaction: ({ transaction }: any) => void;

  onMount(() => {
    _onUpdate = () => recompute();
    _onTransaction = ({ transaction }: any) => {
      // solo recalcular si el doc ha cambiado (evita work innecesario)
      if (transaction.docChanged) recompute();
    };

    editor.on("update", _onUpdate);
    editor.on("transaction", _onTransaction);
  });

  onDestroy(() => {
    if (_onUpdate) editor.off("update", _onUpdate);
    if (_onTransaction) editor.off("transaction", _onTransaction);
  });

  // function handleAddMedia() {
  //   insertImage();
  // }

  function insertImage(url: string | ArrayBuffer | null = null) {
    const pos = getPos();

    if (!url) {
      url = window.prompt("Enter the URL of the image:");
    }

    if (url) {
      // editor
      //   .chain()
      //   .focus()
      //   .setTextSelection(pos + 1) // 👈 entra dentro del content
      //   .setImage({ src: url })
      //   .run();

      editor
        .chain()
        .insertContentAt(pos + 1, [
          {
            type: "image",
            attrs: {
              src: url,
            },
          },
        ])
        .focus()
        .run();
      hasImage = true;
      hideTooltip();
    }
  }

  async function handleDragOver(e: any) {
    console.log(e);
    dragging = true;
    e.preventDefault();
    console.log("Drag over");
  }

  async function handleDrop(e: DragEvent) {
    const types = e.dataTransfer?.types || [];

    // Verifica si es un archivo real (desde ordenador)
    const isFileDrop = Array.from(types).includes("Files");

    if (isFileDrop) {
      e.preventDefault(); // solo prevenimos el comportamiento por defecto si viene del ordenador
      dragging = false;

      const files = Array.from(e.dataTransfer!.files).filter((file) =>
        file.type.startsWith("image/")
      );

      if (files.length > 0) {
        console.log("Dropped local files:", files);
        await uploadFiles(files);
      }
    } else {
      dragging = false;
      console.log("Dropped external content:", types);

      // puede ser desde navegador (ejemplo: arrastrar imagen desde otra pestaña)
      if (types.includes("text/uri-list")) {
        const url = e.dataTransfer?.getData("text/uri-list");
        if (url) {
          console.log("Dropped image URL:", url);
          insertImage(url);
        }
      }
    }
  }

  function handleDragEnter(e: any) {
    console.log("Drag enter");
    dragging = true;
  }

  function handleDragLeave(e: any) {
    console.log("Drag leave");
    dragging = false;
  }

  function handleFileChange(e: any) {
    console.log("File change");
    const files = [...e.target.files];
    console.log(files);

    uploadFiles(files);
  }

  async function uploadFiles(files: any) {
    uploading = true;

    // console.log(newSelectedFiles)
    let formData = new FormData();

    files.forEach(async (file) => {
      formData.append("file", file);
    });

    const response = await fetch(UPLOAD_API_URL, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: formData,
    });

    const json = await response?.json();

    if (json.error) {
      // console.log({ errorMessage: docs.message });

      if (json.error === "Token expired") {
        console.log("Token expired: MediaModal.svelte");
        // return Astro.redirect('/admin/logout');
        const refreshTokenData = await refreshUserToken(refreshToken);

        if (refreshTokenData?.ok) {
          token = refreshTokenData.token;

          uploadFiles(files);

          return;

          // return Astro.redirect('/admin/changes/history')
        } else {
          const { error, message } = refreshTokenData;
          console.error({ error, message });
        }
      } else if (json.error === "Token missing or invalid") {
        console.log("Token missing or invalid");
      }
    }

    uploadedFiles = json.data;
    let newImageNodes = [];

    if (uploadedFiles.length > 0) {
      uploading = false;
      newImageNodes = uploadedFiles.map((file) => {
        return {
          type: "image",
          attrs: {
            src: UPLOADS_URL + file?.file,
          },
        };
      });

      setTimeout(() => {
        editor
          .chain()
          .focus()
          .insertContentAt(getPos() + 1, newImageNodes)
          .run();
      }, 1000);
    }
  }

  function dragAreaClickHandler(e) {
    console.log("Clicked drag area");
    if (addGridMediaIconEl) {
      console.log("Add grid Media icon el: ", addGridMediaIconEl);
      showTooltip(addGridMediaIconEl);
    }
  }

  let currentTriggerEl: HTMLElement | null = null;

  function showTooltip(el: HTMLElement) {
    // Si ya hay uno abierto en OTRO elemento → cerramos primero
    if (tooltipVisible && currentTriggerEl && currentTriggerEl !== el) {
      hideTooltip();
    }

    // Si ya está abierto en el mismo elemento → no hacemos nada
    if (tooltipVisible && currentTriggerEl === el) {
      return;
    }

    hideTooltip(); // limpiar antes de abrir
    currentTriggerEl = el;
    tooltipVisible = true;
    document.body.append(tooltip);

    document.addEventListener("mousedown", handleClickOutside);
    cleanup = autoUpdate(el, tooltip, () => updatePosition(el));
  }

  function hideTooltip() {
    tooltipVisible = false;
    tooltip?.remove();
    document.removeEventListener("mousedown", handleClickOutside);
    cleanup && cleanup();
    currentTriggerEl = null;
  }

  function handleClickOutside(e: MouseEvent) {
    if (!tooltip) return;
    const target = e.target as Node;

    // Excepciones: tooltip, trigger actual, y el drag-area contenedor
    if (
      tooltip.contains(target) ||
      currentTriggerEl?.contains(target) ||
      currentTriggerEl?.closest(".fl-image-upload-drag-area")?.contains(target)
    ) {
      return; // no cerrar
    }

    hideTooltip();
  }

  function updatePosition(el: HTMLElement) {
    computePosition(el, tooltip, {
      placement: "bottom",
      middleware: [
        offset(4),
        size({
          apply({ rects, elements }) {
            // Object.assign(elements.floating.style, {
            //   height: `${rects.reference.height}px`,
            //   // minHeight: `64px`,
            // });
          },
        }),
        // autoPlacement({
        //   allowedPlacements: ["left-start", "bottom-end",],
        // }),
      ],
    }).then(({ x, y }) => {
      tooltipX = x;
      tooltipY = y;
    });
  }
</script>

<NodeViewWrapper
  data-selected={selected}
  class={cx(`fl-media-grid-item ${!hasImage ? "is-empty" : ""}`)}
  data-drag-handle=""
  ondragover={handleDragOver}
  ondrop={handleDrop}
  ondragenter={handleDragEnter}
  ondragleave={handleDragLeave}
>
  {#if !hasImage}
    <!-- <label class="fl-upload-file-panel">
      <input type="file" accept="image/*" multiple onchange={handleFileChange} />
    </label> -->
    <div
      class="fl-image-upload-drag-area"
      class:dragging
      role="button"
      tabindex="0"
      onclick={dragAreaClickHandler}
      onkeydown={(e) =>
        e.key === "Enter" || e.key === " " ? dragAreaClickHandler(e) : null}
      contenteditable="false"
    >
      {#if !dragging}
        <span class="fl-add-grid-media-icon" bind:this={addGridMediaIconEl}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="icon icon-tabler icons-tabler-filled icon-tabler-circle-plus"
            ><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path
              d="M4.929 4.929a10 10 0 1 1 14.141 14.141a10 10 0 0 1 -14.14 -14.14zm8.071 4.071a1 1 0 1 0 -2 0v2h-2a1 1 0 1 0 0 2h2v2a1 1 0 1 0 2 0v-2h2a1 1 0 1 0 0 -2h-2v-2z"
            ></path></svg
          >
        </span>
        <input bind:this={fileInput} type="file" accept="image/*" multiple onchange={handleFileChange} style="display: none;"/>
      {/if}
    </div>
  {/if}

  {#if showIndicator}
    <span class="fl-grid-indicator" contenteditable="false">
      {indicatorType === "numeric"
        ? index + 1
        : String.fromCharCode(65 + index)}
    </span>
  {/if}

  <NodeViewContent
    class="media-grid-item-view-content"
    contenteditable={false}
  />

  {#if !hasImage}
    <div
      bind:this={tooltip}
      id="tooltip"
      class="tooltip fl-dropdown-panel"
      style="display: {tooltipVisible
        ? 'flex'
        : 'none'}; left: {tooltipX}px; top: {tooltipY}px;"
    >
      <button onclick={() => fileInput.click()}>Subir archivo/s</button>
      <button onclick={() => insertImage()}>Añadir desde url</button>
    </div>
  {/if}
</NodeViewWrapper>

<!-- <Dropdown
  bind:refreshDropdown
  bind:calculatePosition={recalculateDropdownPosition}
  bind:toggleByKey
  position={activePosition}
  yOffset={0}
  xOffset={0}
  margin={3}
  id="dropdown"
  on:close={handleCloseDropdown}
  on:open={handleOpenDropdown}
>

</Dropdown> -->

<style>
  
  .fl-dropdown-panel {
    background: #0d0d0da8;
    border: 1px solid #ffffff12;
    backdrop-filter: blur(42px);
    border-radius: 14px;
    padding: 8px;
    position: absolute;
    z-index: 50;
    flex-direction: column;
    gap: 6px;

    button {
        border: none;
        background-color: #6b6b6b75;
        padding: 6px 12px;
        border-radius: 8px;
        cursor: pointer;
        transition: background-color 0.2s ease-in-out;
        &:hover {
          background-color: #6b6b6b96;
        }
    }
  }
  .fl-image-upload-drag-area {
    border: 1px dashed #eeeeee3d;
    width: 100%;
    aspect-ratio: 16 / 9;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
    position: absolute;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    &:hover {
      border-color: #eeeeee6f;

      .fl-add-grid-media-icon {
        color: #fff;
      }
    }

    &:active {
      border-color: #8086ff;
    }

    &.dragging {
      background: #535bf214;
      border-color: #535bf2;
    }
  }

  .fl-add-grid-media-icon {
    background: transparent;
    border-radius: 18px;
    border: none;
    padding: 0;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    color: rgba(255, 255, 255, 0.7);
    display: flex;
  }

  .fl-upload-file-panel {
    position: absolute;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }
</style>
