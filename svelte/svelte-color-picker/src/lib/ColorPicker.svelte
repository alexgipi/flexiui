<script lang="ts">
  import * as Popover from "$lib/components/ui/popover/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { SliderAlpha } from "$lib/components/ui/slider/index.js";
  import { SliderHue } from "$lib/components/ui/slider-hue/index.js";
  import { ColorPickerSwatch } from "$lib";
  import { setContext, getContext } from "svelte";

  // ─── Context ───────────────────────────────────────────────────────────────────
  const COLOR_PICKER_CONTEXT_KEY = "color-picker";

  interface ColorPickerContext {
    color: string;
    currentColor: string;
    open: boolean;
    setOpen: (open: boolean) => void;
  }

  function createColorPickerContext() {
    let color = $state("");
    let currentColor = $state("");
    let open = $state(false);

    return {
      get color() { return color; },
      set color(v) { color = v; },
      get currentColor() { return currentColor; },
      set currentColor(v) { currentColor = v; },
      get open() { return open; },
      set open(v) { open = v; },
      setOpen: (v: boolean) => { open = v; },
    };
  }

  const context = createColorPickerContext();
  setContext<ColorPickerContext>(COLOR_PICKER_CONTEXT_KEY, context);

  // ─── Props (dirui-style) ───────────────────────────────────────────────────────
  type ColorFormat = "hex" | "rgb" | "hsl" | "hsb";
  type Direction = "ltr" | "rtl";

  interface Props {
    // Format
    format?: ColorFormat;
    defaultFormat?: ColorFormat;
    onFormatChange?: (format: ColorFormat) => void;
    
    // Form
    name?: string;
    required?: boolean;
    
    // State
    disabled?: boolean;
    readOnly?: boolean;
    
    // Presentation
    inline?: boolean;
    rtl?: Direction;
    
    // Two-way binding
    value?: string;
    onChange?: (value: any) => void;
    
    // Popover control
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    
    class?: string;
    children?: any;
  }

  let {
    // Format
    format,
    defaultFormat = "hex",
    onFormatChange,
    
    // Form
    name,
    required = false,
    
    // State
    disabled = false,
    readOnly = false,
    
    // Presentation
    inline = false,
    rtl = "ltr",
    
    // Two-way binding
    value = $bindable(),
    onChange,
    
    // Popover control
    defaultOpen = false,
    open = $bindable(),
    onOpenChange,
    
    class: className,
    children,
  }: Props = $props();

  // ─── Tipos internos ───────────────────────────────────────────────────────────
  type ColorMode = "hex" | "rgb" | "hsl" | "hsb";

  // ─── Estado principal (todo en HSV internamente) ──────────────────────────────
  let hue = $state(147);         // 0–360
  let satHSV = $state(75);       // 0–100  → posición X del thumb
  let valHSV = $state(83);       // 0–100  → posición Y invertida del thumb
  let alpha = $state(100);       // 0–100

  // Color mode: usar format si está controlado, si no usar defaultFormat
  let internalColorMode = $state<ColorMode>(defaultFormat);
  let colorMode = $derived(format ?? internalColorMode);
  let isColorModeControlled = $derived(format !== undefined);

  // Sincronizar valor externo (two-way binding)
  let lastExternalValue = $state(value);
  $effect(() => {
    if (value !== lastExternalValue) {
      const rgb = hexToRgb(value);
      if (rgb) {
        const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
        hue = hsv.h;
        satHSV = hsv.s;
        valHSV = hsv.v;
      }
      lastExternalValue = value;
    }
  });

  let isDragging = $state(false);
  let areaEl = $state<HTMLElement | null>(null);

  const modes: { value: ColorMode; label: string }[] = [
    { value: "hex", label: "HEX" },
    { value: "rgb", label: "RGB" },
    { value: "hsl", label: "HSL" },
    { value: "hsb", label: "HSB" },
  ];

  // ─── Posición del thumb derivada del estado HSV ───────────────────────────────
  let thumbLeft = $derived(satHSV);          // %
  let thumbTop  = $derived(100 - valHSV);    // %

  // ─── Conversiones ─────────────────────────────────────────────────────────────

  /** HSV → HSL */
  function hsvToHsl(h: number, s: number, v: number) {
    s /= 100; v /= 100;
    const l = v * (1 - s / 2);
    const sl = (l === 0 || l === 1) ? 0 : (v - l) / Math.min(l, 1 - l);
    return { h: Math.round(h), s: Math.round(sl * 100), l: Math.round(l * 100) };
  }

  /** HSV → RGB (0–255) */
  function hsvToRgb(h: number, s: number, v: number) {
    s /= 100; v /= 100;
    const k = (n: number) => (n + h / 60) % 6;
    const f = (n: number) => v - v * s * Math.max(0, Math.min(k(n), 4 - k(n), 1));
    return {
      r: Math.round(f(5) * 255),
      g: Math.round(f(3) * 255),
      b: Math.round(f(1) * 255),
    };
  }

  /** RGB → HEX */
  function rgbToHex(r: number, g: number, b: number) {
    return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
  }

  /** HSL → HSV */
  function hslToHsv(h: number, s: number, l: number) {
    s /= 100; l /= 100;
    const v = l + s * Math.min(l, 1 - l);
    const sv = v === 0 ? 0 : 2 * (1 - l / v);
    return { h, s: Math.round(sv * 100), v: Math.round(v * 100) };
  }

  /** HEX → RGB */
  function hexToRgb(hex: string) {
    const clean = hex.replace("#", "");
    if (clean.length !== 6) return null;
    const num = parseInt(clean, 16);
    if (isNaN(num)) return null;
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }

  /** RGB → HSV */
  function rgbToHsv(r: number, g: number, b: number) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    if (d !== 0) {
      if (max === r) h = ((g - b) / d) % 6;
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h = Math.round(h * 60);
      if (h < 0) h += 360;
    }
    return {
      h,
      s: Math.round(max === 0 ? 0 : (d / max) * 100),
      v: Math.round(max * 100),
    };
  }

  // ─── Colores derivados ─────────────────────────────────────────────────────────
  let rgb  = $derived(hsvToRgb(hue, satHSV, valHSV));
  let hsl  = $derived(hsvToHsl(hue, satHSV, valHSV));
  let hex  = $derived(rgbToHex(rgb.r, rgb.g, rgb.b));

  // Color del fondo del área (hue puro)
  let areaBaseColor = $derived(`hsl(${hue}, 100%, 50%)`);

  // Color actual con alpha para el trigger
  let currentColor = $derived(
    alpha < 100
      ? `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${alpha / 100})`
      : hex
  );

  // Actualizar context
  $effect(() => {
    context.color = value ?? "";
    context.currentColor = currentColor;
  });

  // Color del thumb del slider de alpha
  let alphaGradient = $derived(
    `linear-gradient(to right, transparent, ${hex})`
  );

  // triggerContent para el select
  const triggerContent = $derived(
    modes.find(m => m.value === colorMode)?.label ?? "HEX"
  );

  // ─── Edición manual de inputs ─────────────────────────────────────────────────

  // HEX input (edición directa)
  let hexInput = $state(hex);
  $effect(() => { hexInput = hex; });

  function onHexInput(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    hexInput = val;
    const rgb = hexToRgb(val);
    if (rgb) {
      const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
      hue = hsv.h; satHSV = hsv.s; valHSV = hsv.v;
    }
  }

  // RGB inputs
  let rInput = $state(0), gInput = $state(0), bInput = $state(0);
  $effect(() => { rInput = rgb.r; gInput = rgb.g; bInput = rgb.b; });

  function onRgbChange() {
    const hsv = rgbToHsv(
      Math.min(255, Math.max(0, rInput)),
      Math.min(255, Math.max(0, gInput)),
      Math.min(255, Math.max(0, bInput))
    );
    hue = hsv.h; satHSV = hsv.s; valHSV = hsv.v;
  }

  // HSL inputs
  let hslHInput = $state(0), hslSInput = $state(0), hslLInput = $state(0);
  $effect(() => { hslHInput = hsl.h; hslSInput = hsl.s; hslLInput = hsl.l; });

  function onHslChange() {
    const hsv = hslToHsv(
      Math.min(360, Math.max(0, hslHInput)),
      Math.min(100, Math.max(0, hslSInput)),
      Math.min(100, Math.max(0, hslLInput))
    );
    hue = hsv.h; satHSV = hsv.s; valHSV = hsv.v;
  }

  // HSB inputs
  let hsbHInput = $state(0), hsbSInput = $state(0), hsbBInput = $state(0);
  $effect(() => { hsbHInput = hue; hsbSInput = satHSV; hsbBInput = valHSV; });

  // Efecto para notificar cambios al usuario
  let isInitialized = $state(false);
  $effect(() => {
    // Actualizar valor bindeado
    value = hex;

    if(colorMode === "hex") {
      value = hex;
    } else if(colorMode === "rgb") {
      value = `rgb(${rInput} ${gInput} ${bInput} / ${alpha}%)`;
    } else if(colorMode === "hsl") {
      value = `hsl(${hslHInput}deg ${hslSInput}% ${hslLInput}% / ${alpha}%)`;
    } else if(colorMode === "hsb") {
      value = `hsba(${hsbHInput}%, ${hsbSInput}%, ${hsbBInput}%, ${alpha / 100})`;
    }

    // Notificar cambio (solo después de inicializado)
    if (isInitialized) {
      onChange?.({
        hex,
        rgb: `rgb(${rInput} ${gInput} ${bInput} / ${alpha})`,
        hsl: `hsl(${hslHInput}deg ${hslSInput}% ${hslLInput}% / ${alpha}%)`,
        hsb: `hsba(${hsbHInput}%, ${hsbSInput}%, ${hsbBInput}%, ${alpha / 100})`,
        alpha,
      });
    }
    // Marcar como inicializado después del primer ciclo
    isInitialized = true;
  });

  function onHsbChange() {
    hue = Math.min(360, Math.max(0, hsbHInput));
    satHSV = Math.min(100, Math.max(0, hsbSInput));
    valHSV = Math.min(100, Math.max(0, hsbBInput));
  }

  // ─── Interacción con el área ───────────────────────────────────────────────────

  function updateFromPointer(e: MouseEvent | PointerEvent) {
    if (!areaEl) return;
    const rect = areaEl.getBoundingClientRect();
    const x = Math.min(Math.max(0, e.clientX - rect.left), rect.width);
    const y = Math.min(Math.max(0, e.clientY - rect.top), rect.height);
    satHSV = Math.round((x / rect.width) * 100);
    valHSV = Math.round((1 - y / rect.height) * 100);
  }

  function onAreaPointerDown(e: PointerEvent) {
    isDragging = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    updateFromPointer(e);
  }

  function onAreaPointerMove(e: PointerEvent) {
    if (!isDragging) return;
    updateFromPointer(e);
  }

  function onAreaPointerUp(e: PointerEvent) {
    isDragging = false;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  }

  // ─── Eye dropper ──────────────────────────────────────────────────────────────
  async function openEyeDropper() {
    if (!("EyeDropper" in window)) return;
    try {
      const dropper = new (window as any).EyeDropper();
      const result = await dropper.open();
      const rgbVal = hexToRgb(result.sRGBHex);
      if (rgbVal) {
        const hsv = rgbToHsv(rgbVal.r, rgbVal.g, rgbVal.b);
        hue = hsv.h; satHSV = hsv.s; valHSV = hsv.v;
      }
    } catch {}
  }

  function handleSelectChange(newMode: ColorMode) {
    if (!isColorModeControlled) {
      internalColorMode = newMode;
    }
    onFormatChange?.(newMode);
  }
</script>

<Popover.Root 
  open={open} 
  defaultOpen={defaultOpen} 
  onOpenChange={onOpenChange}
  dir={rtl}
>
  <!-- Trigger -->
  {#if children}

    {@render children?.()}
    
  {:else}
    <Popover.Trigger 
      class="flex items-center gap-2"
      disabled={disabled}
    >
      <ColorPickerSwatch class="w-5 h-5" />
      <span class="text-sm font-mono">
        {value}
      </span>
    </Popover.Trigger>
  {/if}

  <Popover.Content class="flex flex-col gap-4 min-w-76 p-2.25" portalProps={{}}>
    <div class="flex flex-col gap-4 {className}">

      <!-- ── Área de color ────────────────────────────────────────────────── -->
      <div
        bind:this={areaEl}
        aria-label="Color picker area"
        tabindex="0"
        role="slider"
        aria-valuetext="Saturation {satHSV}%, Brightness {valHSV}%"
        onpointerdown={onAreaPointerDown}
        onpointermove={onAreaPointerMove}
        onpointerup={onAreaPointerUp}
        data-slot="color-picker-area"
        class="relative h-40 w-full cursor-crosshair touch-none rounded-lg border select-none"
      >
        <!-- Fondo: hue puro -->
        <div
          class="absolute inset-0 rounded-lg"
          style="background-color: {areaBaseColor};height: calc(100% - 2px);"
        ></div>
        <!-- Gradiente blanco → transparente (izquierda → derecha) -->
        <div
          class="absolute inset-0 rounded-lg"
          style="background: linear-gradient(to right, rgb(255,255,255), transparent);height: calc(100% - 2px);"
        ></div>
        <!-- Gradiente transparente → negro (arriba → abajo) -->
        <div
          class="absolute inset-0 rounded-lg"
          style="background: linear-gradient(to bottom, transparent, rgb(0,0,0));"
        ></div>

        <!-- Thumb -->
        <div
          class="color-picker-area-thumb pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md ring-1 ring-black/20"
          style="left: {thumbLeft}%; top: {thumbTop}%;"
        ></div>
      </div>

      <!-- ── Sliders ──────────────────────────────────────────────────────── -->
      <div class="flex items-center gap-2">
        <!-- Eye dropper -->
        <button
          aria-label="Eye dropper"
          onclick={openEyeDropper}
          class="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50 size-9"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" aria-hidden="true">
            <path d="m12 9-8.414 8.414A2 2 0 0 0 3 18.828v1.344a2 2 0 0 1-.586 1.414A2 2 0 0 1 3.828 21h1.344a2 2 0 0 0 1.414-.586L15 12"/>
            <path d="m18 9 .4.4a1 1 0 1 1-3 3l-3.8-3.8a1 1 0 1 1 3-3l.4.4 3.4-3.4a1 1 0 1 1 3 3z"/>
            <path d="m2 22 .414-.414"/>
          </svg>
        </button>

        <div class="flex flex-1 flex-col gap-2">
          <!-- Hue slider -->
          <SliderHue
            type="single"
            bind:value={hue}
            max={360}
            step={1}
            class="w-full h-3 slider rounded-3xl color-picker-slider color-picker-slider--hue bg-[linear-gradient(to_right,#ff0000_0%,#ffff00_16.66%,#00ff00_33.33%,#00ffff_50%,#0000ff_66.66%,#ff00ff_83.33%,#ff0000_100%)]"
          />

          <!-- Alpha slider -->
          <SliderAlpha
            type="single"
            bind:value={alpha}
            max={100}
            step={1}
            class="w-full h-3 slider color-picker-slider color-picker-slider--alpha"
            style=""
            baseColor={hex}
          />
        </div>
      </div>

      <!-- ── Inputs ───────────────────────────────────────────────────────── -->
      <div class="flex items-center gap-2">
        <!-- Selector de modo -->
        <Select.Root 
          type="single" 
          name="colorMode" 
          value={colorMode} 
          onValueChange={handleSelectChange}
          disabled={disabled || readOnly}
        >
          <Select.Trigger class="max-h-8 min-w-19">
            {triggerContent}
          </Select.Trigger>
          <Select.Content class="max-w-20 min-w-20" portalProps={{ style: "width: 100%" }}>
            <Select.Group>
              {#each modes as mode (mode.value)}
                <Select.Item class="select-item" value={mode.value} label={mode.label}>
                  {mode.label}
                </Select.Item>
              {/each}
            </Select.Group>
          </Select.Content>
        </Select.Root>

        <!-- Campos según modo -->
        <div data-slot="color-picker-input-wrapper" class="flex flex-1 items-center">

          {#if colorMode === "hex"}
            <!-- HEX: un solo input + alpha -->
            <Input
              type="text"
              placeholder="#000000"
              class="h-8 rounded-tr-none rounded-br-none flex-1 font-mono"
              value={hexInput}
              oninput={onHexInput}
            />

          {:else if colorMode === "rgb"}
            <!-- R -->
            <Input
              type="number"
              placeholder="0"
              class={inputClass("rounded-e-none")}
              aria-label="Red (0-255)"
              inputmode="numeric"
              pattern="[0-9]*"
              min="0"
              max="255"
              bind:value={rInput}
              onchange={onRgbChange}
            />
            <!-- G -->
            <Input
              type="number"
              placeholder="0"
              class={inputClass("rounded-none border-l-0")}
              aria-label="Green (0-255)"
              inputmode="numeric"
              pattern="[0-9]*"
              min="0"
              max="255"
              bind:value={gInput}
              onchange={onRgbChange}
            />

            <!-- B -->
            <Input
              type="number"
              placeholder="0"
              class={inputClass("rounded-none border-l-0")}
              aria-label="Blue (0-255)"
              inputmode="numeric"
              pattern="[0-9]*"
              min="0"
              max="255"
              bind:value={bInput}
              onchange={onRgbChange}
            />

          {:else if colorMode === "hsl"}
            <!-- H -->
            <Input
              type="number"
              placeholder="0"
              class={inputClass("-ms-px rounded-tr-none rounded-br-none")}
              aria-label="Hue (0-360)"
              inputmode="numeric"
              pattern="[0-9]*"
              min="0"
              max="360"
              bind:value={hslHInput}
              onchange={onHslChange}
            />

            <!-- S -->
            <Input
              type="number"
              placeholder="0"
              class={inputClass("-ms-px rounded-none border-l-0")}
              aria-label="Saturation (0-100)"
              inputmode="numeric"
              pattern="[0-9]*"
              min="0"
              max="100"
              bind:value={hslSInput}
              onchange={onHslChange}
            />

            <!-- L -->
            <Input
              type="number"
              placeholder="0"
              class={inputClass("-ms-px rounded-none border-l-0")}
              aria-label="Lightness (0-100)"
              inputmode="numeric"
              pattern="[0-9]*"
              min="0"
              max="100"
              bind:value={hslLInput}
              onchange={onHslChange}
            />

          {:else if colorMode === "hsb"}
            <!-- Hue -->
            <Input
              type="number"
              placeholder="0"
              class={inputClass("-ms-px rounded-tr-none rounded-br-none")}
              aria-label="Hue (0-360)"
              inputmode="numeric"
              pattern="[0-9]*"
              min="0"
              max="360"
              bind:value={hsbHInput}
              onchange={onHsbChange}
            />

            <!-- Saturation -->
            <Input
              type="number"
              placeholder="0"
              class={inputClass("-ms-px rounded-none border-l-0")}
              aria-label="Saturation (0-100)"
              inputmode="numeric"
              pattern="[0-9]*"
              min="0"
              max="100"
              bind:value={hsbSInput}
              onchange={onHsbChange}
            />

            <!-- Brightness -->
            <Input
              type="number"
              placeholder="0"
              class={inputClass("-ms-px rounded-none border-l-0")}
              aria-label="Brightness (0-100)"
              inputmode="numeric"
              pattern="[0-9]*"
              min="0"
              max="100"
              bind:value={hsbBInput}
              onchange={onHsbChange}
            />

          {/if}

          <!-- Alpha (siempre visible) -->
          <Input
            bind:value={alpha}
            class={inputClass("rounded-md rounded-tl-none rounded-bl-none border-l-0")}
            type="number"
            aria-label="Alpha (0-100)"
            placeholder="100"
            min="0"
            max="100"
          />
        </div>
      </div>

    </div>
  </Popover.Content>
</Popover.Root>

<!-- Helper: clases base para inputs numéricos del color picker -->
<script module lang="ts">
  function inputClass(extra = "") {
    return [
      "flex min-w-0 w-full flex-1 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 h-8 [-moz-appearance:textfield] focus-visible:z-10 focus-visible:ring-1 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none rounded-e-none",
      extra,
    ].join(" ");
  }
</script>