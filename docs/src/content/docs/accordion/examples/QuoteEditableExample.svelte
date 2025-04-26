<script lang="ts">
  import { Quote } from "@flexiui/svelte-quote";
  let content = `This is a quote component example with editable mode enabled.`;

  function handleFocus(e: any) {
    console.log("Focus event");
    console.log(e);
  }

  function handleKeyDown(e: any) {
    console.log("Keydown event");
    console.log(e);
  }

  function handleInput(e: any) {
    console.log("Input event");
    console.log(e);
  }
</script>

<Quote
  className="my-quote"
  id="my-quote-id"
  bgColor="transparent"
  editable={true}
  bind:value={content}
  on:focus={handleFocus}
  on:keydown={handleKeyDown}
  on:input={handleInput}
></Quote>
