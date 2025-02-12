<script lang="ts">
  // create labels types {plural: string, singular, string}

  export let name;
  export let field;
  export let tags = [];
  export let min;
  export let max;
  export let separator = null;
  export let allowDuplicates = false;
  export let bidimensional = false;
  export let bidimensionalSeparator = null;
  export let lang = "en";
  export let placeholder = "Press enter to add a new tag";
  export let required = false;
  export let labels = null;

  let view = "tags";

  if (!labels) labels = { singular: "Tag", plural: "Tags" };

  let duplicatedTags = [];

  function keyDownHandler(e) {
    if (e.key !== "Enter") return;

    e.preventDefault();
    e.stopPropagation();

    const inputValue = e.target.value.trim();
    if (!inputValue) return;

    const values = separator
      ? inputValue.split(separator).map((tag) => tag.trim())
      : [inputValue];

    const newTags = allowDuplicates
      ? values
      : values.filter((tag) => {
          if (tags.includes(tag)) {
            duplicatedTags = [...duplicatedTags, tag];
            return false;
          }
          return true;
        });
	
	// TODO: Hay que separar esto un poco!!!
	// La regex es para que solo se separe por el primer bidimensionalSeparator
	// Ej: bgImage: url("https://etcetera.com")
	// Sin el regex los ":" de despues de https tambien se separarían.
	// Por lo que el valor final sería: bgImage: url("https 
	tags = [
		...tags,
		...(!bidimensional
			? newTags
			: newTags.map(tag => tag.split(new RegExp(`${bidimensionalSeparator}(.*)`, 's')).slice(0, 2))
		),
	];

    e.target.value = duplicatedTags.join(separator || " ") || "";
  }

  function keyUpHandler(e) {
    if (e.key === "Backspace" && e.target.value.length === 0) resetError();
  }

  function removeTagHandler(tagIndex) {
    tags = tags.filter((_, index) => index !== tagIndex);
  }

  function resetError() {
    duplicatedTags = [];
  }

  function toggleView() {
    view = view === "tags" ? "raw" : "tags";
  }
</script>

<div class="tags-field">
  <!-- <p class="field-message">Press enter to add a new tag</p> -->
  <div class="tags-field-content">
    {#if tags.length > 0}
      {#if view === "tags"}
        <div class="tags-field-tags">
          {#each tags as tag, tagIndex}
            <span class="tag" class:bidimensional-tag={bidimensional}>
              {#if bidimensional}
                <span
                  bind:innerText={tag[0]}
                  class="tag-content"
                  contenteditable
                >
                </span>

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="#e8eaed"
                  viewBox="0 -960 960 960"
                  ><path
                    d="M280-280 80-480l200-200 56 56-103 104h494L624-624l56-56 200 200-200 200-56-56 103-104H233l103 104-56 56Z"
                  /></svg
                >

                <span
                  bind:innerText={tag[1]}
                  class="tag-content"
                  contenteditable
                ></span>
              {:else}
                <span
                  bind:innerText={tags[tagIndex]}
                  class="tag-content"
                  contenteditable
                ></span>
              {/if}

              <button
                aria-label="Remove tag"
                on:click={() => removeTagHandler(tagIndex)}
                type="button"
                class="tag-remove-button"
              >
                <svg
                  class="remove-tag-icon"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                  ><path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  ></path></svg
                >
              </button>
            </span>
          {/each}
        </div>
      {:else if view === "raw"}
        <!-- Raw debe ser: 
			   Simple: tag -> separator -> tag ...
			   Bidimensional: tag[0] -> bidimensionalSeparator -> tag[1] -> separator -> tag[... -->
        <div class="tags-field-raw">
          <p>
            {#if bidimensional}
              {tags
                .map((tag) => tag.join(bidimensionalSeparator + " "))
                .join(separator + " ")}
            {:else}
              {tags.join(separator + " ")}
            {/if}
          </p>

          <!-- <button type="button" aria-label="Copy text" class="copy-button"></button> -->
        </div>
      {/if}
    {/if}

    <div class="tags-field-input-box">
      <input
        type="text"
        {placeholder}
        on:keydown={keyDownHandler}
        on:keyup={keyUpHandler}
        class="add-tags-input"
        class:error={duplicatedTags?.length > 0}
      />

      <input
        type="hidden"
        name="{name}__flexi-tags-field"
        value={JSON.stringify(tags)}
      />

      <div class="toggle-view">
        <button
          type="button"
          class:active={view === "tags"}
          on:click={toggleView}>Tags</button
        >
        <button
          type="button"
          class:active={view === "raw"}
          on:click={toggleView}>Text</button
        >
      </div>
    </div>
  </div>
  <div class="tags-field-actions">
    <div class="flex gap-4 items-center">
      {#if duplicatedTags?.length === 1}
        <span class="error-badge"> Esta etíqueta ya existe </span>
      {:else if duplicatedTags?.length > 1}
        <span class="error-badge">
          Estas {duplicatedTags.length} etiquetas ya existen
        </span>
      {/if}

      <span>
        {tags.length}
        {tags.length === 1
          ? labels.singular?.[lang] || labels.singular
          : labels.plural?.[lang] || labels.plural}
      </span>
    </div>

    <button type="button" on:click={() => (tags = [])}> Remove all </button>
  </div>
</div>

<!-- <pre class="output-console">
    {JSON.stringify(tags, null, 3)}
</pre> -->

<style>
  .tags-field {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .tags-field-content {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    padding: 16px;
    border: 1px solid #ffffff0f;
    border-radius: 8px;
  }

  .tags-field-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .tag {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 6px 7px 6px 12px;
    background: #ffffff0a;
    color: #b2b2b2;
    font-size: 0.9rem;
    border-radius: 8px;
  }

  .tag-content {
    outline: none;
    min-width: 28px;
  }

  .tag.bidimensional-tag .tag-content {
    box-shadow: 0 1px 0 0 #ffffff14;
  }

  .tag-remove-button {
    background: transparent;
    border: none;
    cursor: pointer;
    color: #fff;
    padding: 4px;
    background: #ffffff0a;
    border-radius: 13px;
    margin-top: 0px;
    height: 23px;
    width: 23px;
    transition: background 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;

    .remove-tag-icon {
      width: 11px;
      height: 11px;
    }

    &:hover {
      background: #ffffff12;
    }
  }

  .tags-field-actions {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
    font-size: 0.96rem;
    color: #747474;

    button {
      padding: 3px 9px;
      border-radius: 6px;
      background: #ffffff0f;
      color: #acacac;
      font-size: 14px;
    }
  }

  .add-tags-input {
    background-color: transparent;
    outline: none;
    border: none;
    padding: 0;
    box-shadow: none;
    flex: auto;

    &::placeholder {
      color: #ffffff40;
    }

    &.error {
      color: #ff798f;
    }
  }

  .error-badge {
    border-radius: 5px;
    color: #ff798f;
    padding: 5px 10px;
    background: #ff46650d;
    font-size: 14px;
  }

  .tags-field-input-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .toggle-view {
    display: flex;
    align-items: center;
    padding: 4px;
    background: #ffffff05;
    border-radius: 6px;
  }

  .toggle-view button {
    padding: 3px 8px;
    font-size: 11px;
    color: #ffffff69;
    border-radius: 6px;
    background-color: transparent;
    transition: background-color 0.2s ease;

    &:hover {
      border-color: transparent;
    }

    &:focus {
      outline: none;
    }

    &.active {
      background-color: #ffffff0a;
      color: #ffffffcf;
    }
  }

  .tags-field-raw {
    position: relative;

    p {
      text-align: left;
      margin: 0;
      padding-right: 24px;
    }
  }

  .copy-button {
    mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='1.75'%3E%3Cpath d='M3 19a2 2 0 0 1-1-2V2a2 2 0 0 1 1-1h13a2 2 0 0 1 2 1'/%3E%3Crect x='6' y='5' width='16' height='18' rx='1.5' ry='1.5'/%3E%3C/svg%3E");
    mask-repeat: no-repeat;
    width: 16px;
    height: 16px;
    background-color: #ffffff;
    position: absolute;
    top: 0;
    right: 0;
    padding: 0;
    border-radius: 0;
    border: none;
  }
</style>
