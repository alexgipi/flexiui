<script lang="ts">
  import * as Popover from "$lib/components/ui/popover/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { SliderAlpha } from "$lib/components/ui/slider/index.js";
  import { SliderHue } from "$lib/components/ui/slider-hue/index.js";

  let showColorPicker: boolean = false;
  const fruits = [
    { value: "hex", label: "HEX" },
    { value: "rgb", label: "RGB" },
    { value: "hsl", label: "HSL" },
    { value: "hsb", label: "HSB" },
  ];

  let value = $state("hex");

  let areaThumbLeftPosition = $state(75);
  let areaThumbTopPosition = $state(17);

  let alpha = $state(18);
  let hue = $state(147);
  let hex = $state("#35d47c");

  const triggerContent = $derived(
    fruits.find((f) => f.value === value)?.label ?? "Select a fruit",
  );

  function toggleColorPicker(e) {
    showColorPicker = !showColorPicker;
    console.log(showColorPicker);
  }

  function colorPickerAreaClick(e:any) {
    const areaWidth = e.target.clientWidth;
    const areaHeight = e.target.clientHeight;
    console.log(e);
    const offsetY = e.offsetY;
    const offsetX = e.offsetX;

    console.log(offsetY);
    console.log(offsetX);
    areaThumbTopPosition = offsetY / areaHeight * 100;
    areaThumbLeftPosition = offsetX / areaWidth * 100;
  }
</script>

<Popover.Root>
  <Popover.Trigger class="flex">Open</Popover.Trigger>
  <Popover.Content class="flex flex-col gap-4 min-w-74.25 p-2.25" portalProps={{}}>
    <div class="flex flex-col gap-4">
      <div
        aria-label="Color picker area"
        tabindex="0"
        role="button"
        onmousedown={colorPickerAreaClick}
        data-slot="color-picker-area"
        class="relative h-40 w-full cursor-crosshair touch-none rounded-lg border"
      >
        <div class="color-picker-area-wrapper absolute inset-0 rounded-lg">
          <div
            class="base absolute inset-0 rounded-lg"
            style="background-color: {hex};"
          ></div>

          <div
            class="white absolute inset-0 rounded-lg"
            style="background: linear-gradient(to right, rgb(255, 255, 255), transparent);"
          ></div>

          <div
            class="black absolute inset-0 rounded-lg"
            style="background: linear-gradient(transparent, rgb(0, 0, 0));"
          ></div>
        </div>

        <div
          class="color-picker-area-thumb absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm"
          style="left: {areaThumbLeftPosition}%; top: {areaThumbTopPosition}%;"
        ></div>
      </div>

      <div class="flex items-center gap-2">
        <button
          aria-label="Eye dropper"
          data-slot="color-picker-eye-dropper"
          class="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50 size-9"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-pipette"
            aria-hidden="true"
            ><path
              d="m12 9-8.414 8.414A2 2 0 0 0 3 18.828v1.344a2 2 0 0 1-.586 1.414A2 2 0 0 1 3.828 21h1.344a2 2 0 0 0 1.414-.586L15 12"
            ></path><path
              d="m18 9 .4.4a1 1 0 1 1-3 3l-3.8-3.8a1 1 0 1 1 3-3l.4.4 3.4-3.4a1 1 0 1 1 3 3z"
            ></path><path d="m2 22 .414-.414"></path></svg
          >
        </button>

        <div class="flex flex-1 flex-col gap-2">
          <SliderHue
            type="single"
            bind:value={hue}
            max={360}
            step={1}
            class="w-full h-3 slider rounded-3xl color-picker-slider color-picker-slider--hue bg-[linear-gradient(to_right,#ff0000_0%,#ffff00_16.66%,#00ff00_33.33%,#00ffff_50%,#0000ff_66.66%,#ff00ff_83.33%,#ff0000_100%)]"
          />

          <SliderAlpha
            type="single"
            bind:value={alpha}
            max={100}
            step={1}
            class="w-full h-3 slider color-picker-slider color-picker-slider--alpha"
            style="background-image: repeating-conic-gradient(#ffffff 0% 25%, #b7b7b7 0% 50%);
          background-size: 8px 8px;
          border-radius: 20px;"
          />
        </div>
      </div>

      <div class="flex items-center gap-2">
        <Select.Root type="single" name="favoriteFruit" bind:value>
          <Select.Trigger class="max-h-8 min-w-19">
            {triggerContent}
          </Select.Trigger>
          <Select.Content
            class="max-w-20 min-w-20"
            portalProps={{ style: "width: 100%" }}
          >
            <Select.Group>
              {#each fruits as fruit (fruit.value)}
                <Select.Item
                  class="select-item"
                  value={fruit.value}
                  label={fruit.label}
                  disabled={fruit.value === "grapes"}
                >
                  {fruit.label}
                </Select.Item>
              {/each}
            </Select.Group>
          </Select.Content>
        </Select.Root>

        <div data-slot="color-picker-input-wrapper" class="flex items-center">

          {#if value === "hex"}
            <Input
              type="text"
              placeholder="Hex value"
              class="h-8 border-r-none rounded-tr-none rounded-br-none"
              bind:value={hex}
            />
          {:else if value === "rgb"}
            <input 
            data-slot="color-picker-input"
            class="flex min-w-0 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 h-8 [-moz-appearance:textfield] focus-visible:z-10 focus-visible:ring-1 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none rounded-e-none" 
            aria-label="Green color component (0-255)" 
            placeholder="0" inputmode="numeric" 
            pattern="[0-9]*" 
            min="0" 
            max="255" 
            value="53"
            />

            <input 
            data-slot="color-picker-input"
            class="flex min-w-0 w-full border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 h-8 [-moz-appearance:textfield] focus-visible:z-10 focus-visible:ring-1 [&amp;::-webkit-inner-spin-button]:m-0 [&amp;::-webkit-inner-spin-button]:appearance-none [&amp;::-webkit-outer-spin-button]:m-0 [&amp;::-webkit-outer-spin-button]:appearance-none -ms-px rounded-none border-l-0" 
            aria-label="Red color component (0-255)"
            placeholder="0" inputmode="numeric" 
            pattern="[0-9]*" 
            min="0" 
            max="255" 
            value="53"
            />

            <input 
            data-slot="color-picker-input"
            class="flex min-w-0 w-full border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 h-8 [-moz-appearance:textfield] focus-visible:z-10 focus-visible:ring-1 [&amp;::-webkit-inner-spin-button]:m-0 [&amp;::-webkit-inner-spin-button]:appearance-none [&amp;::-webkit-outer-spin-button]:m-0 [&amp;::-webkit-outer-spin-button]:appearance-none -ms-px rounded-none border-l-0" 
            aria-label="Blue color component (0-255)" 
            placeholder="0" inputmode="numeric" 
            pattern="[0-9]*" 
            min="0" 
            max="255" 
            value="53"
            />
            
          {:else}
            <input
              data-slot="color-picker-input"
              class="flex min-w-0 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 h-8 [-moz-appearance:textfield] focus-visible:z-10 focus-visible:ring-1 [&amp;::-webkit-inner-spin-button]:m-0 [&amp;::-webkit-inner-spin-button]:appearance-none [&amp;::-webkit-outer-spin-button]:m-0 [&amp;::-webkit-outer-spin-button]:appearance-none rounded-e-none"
              aria-label="Hue degree (0-360)"
              placeholder="0"
              inputmode="numeric"
              pattern="[0-9]*"
              min="0"
              max="360"
              bind:value={hue}
            />

            <input
              class="flex min-w-0 w-full border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 h-8 [-moz-appearance:textfield] focus-visible:z-10 focus-visible:ring-1 [&amp;::-webkit-inner-spin-button]:m-0 [&amp;::-webkit-inner-spin-button]:appearance-none [&amp;::-webkit-outer-spin-button]:m-0 [&amp;::-webkit-outer-spin-button]:appearance-none -ms-px rounded-none border-l-0"
              aria-label="Saturation percentage (0-100)"
              placeholder="0"
              inputmode="numeric"
              pattern="[0-9]*"
              min="0"
              max="100"
              value="50"
            />

            {#if value === "hsl"}
              <input
                data-slot="color-picker-input"
                class="flex min-w-0 w-full border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 h-8 [-moz-appearance:textfield] focus-visible:z-10 focus-visible:ring-1 [&amp;::-webkit-inner-spin-button]:m-0 [&amp;::-webkit-inner-spin-button]:appearance-none [&amp;::-webkit-outer-spin-button]:m-0 [&amp;::-webkit-outer-spin-button]:appearance-none -ms-px rounded-none border-l-0"
                aria-label="Lightness percentage (0-100)"
                placeholder="0"
                inputmode="numeric"
                pattern="[0-9]*"
                min="0"
                max="100"
                value="42"
              />
            {:else if value === "hsb"}
              <input
                data-slot="color-picker-input"
                class="flex min-w-0 w-full border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 h-8 [-moz-appearance:textfield] focus-visible:z-10 focus-visible:ring-1 [&amp;::-webkit-inner-spin-button]:m-0 [&amp;::-webkit-inner-spin-button]:appearance-none [&amp;::-webkit-outer-spin-button]:m-0 [&amp;::-webkit-outer-spin-button]:appearance-none -ms-px rounded-none border-l-0"
                aria-label="Brightness percentage (0-100)"
                placeholder="0"
                inputmode="numeric"
                pattern="[0-9]*"
                min="0"
                max="100"
                value="63"
              />
            {/if}
          {/if}

          <!-- <input
            data-slot="color-picker-input"
            class="flex min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 h-8 [-moz-appearance:textfield] focus-visible:z-10 focus-visible:ring-1 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none -ms-px rounded-s-none border-l-0 w-14"
            aria-label="Alpha transparency percentage"
            placeholder="100"
            inputmode="numeric"
            pattern="[0-9]*"
            min="0"
            max="100"
            value="18"
          /> -->

          <Input
            bind:value={alpha}
            class="input-numeric {value === 'hex' ? 'w-auto' : 'w-full'} border border-input  px-3 py-1 text-base shadow-xs outline-none h-8 [-moz-appearance:textfield] focus-visible:z-10 focus-visible:ring-1 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none -ms-px rounded-s-none border-l-0"
            type="number"
            aria-label="Alpha transparency percentage"
            placeholder="100"
            inputmode="numeric"
            pattern="[0-9]*"
            min="0"
            max="100"
          />
        </div>
      </div>
    </div>
  </Popover.Content>
</Popover.Root>

<style>
  .color-area {
    height: 10rem;
    border-radius: 4px;
    border: 1px solid #000;
    background: linear-gradient(to right, #fff, transparent),
      linear-gradient(to bottom, transparent, #000), rgb(0, 255, 115);
  }

  .color-picker-area-wrapper {
    .base,
    .white {
      max-height: calc(100% - 2px);
    }

    .base,
    .white,
    .black {
    }
  }
</style>
