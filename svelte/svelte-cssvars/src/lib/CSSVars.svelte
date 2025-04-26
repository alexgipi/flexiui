<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import {
    fixCSSUrl,
    formatColor,
    getHref,
    isNumeric,
    isValidColor,
    isValidCSSUrl,
  } from "./utils";
  import { Dropdown, DropdownItem } from "@flexiui/svelte-dropdown";
  import { PrismCodeEditor } from "@flexiui/svelte-prism-code-editor";
  const defaultLangs = ["es", "en", "it"];
  let view = "tags";

  export let name;
  export let id;
  export const required = false;
  export let editable = true;
  export let styleConfig = {};
  export let tags = [];
  export let separator = ";";

  export let ruleSeparator = ":";
  export let lang = "es";
  export let placeholder = "Press enter to add a new tag";
  export let labels = null;

  export let varsCSS = null;
  export let varsCSSFixed = null;

  export let varsConfigFixed = {};
  export let varsConfig = { ...varsConfigFixed };

  export let varsObjectFixed = cssVarsToObject(varsCSS || varsCSSFixed);
  export let varsObject = { ...varsObjectFixed };

  let styleConfigCSSVariables = Object.entries(styleConfig).map(([key, value]) => `--${key}: ${value};`).join("\n");

  if (varsObject === null || Object.keys(varsObject).length === 0) {
    varsObject = varsObjectFixed;
  } else {
    varsObject = { ...varsObjectFixed, ...varsObject };
  }

  if(varsConfig === null || Object.keys(varsConfig).length === 0) {
    varsConfig = varsConfigFixed;
  } else {
    varsConfig = { ...varsConfigFixed, ...varsConfig };
  }

  if (!labels) {
    labels = { singular: "CSS Variable", plural: "CSS Variables" };
  }

  varsConfig = {...varsConfig, ...updateVarsConfig()}

  let activeProperty = null;

  let textInputs = {};

  let activeKey = null;

  let openedKey = null;

  let isCtrlPressed = false;

  let recalculateDropdownPosition = null;
  let refreshDropdown = null;

  onMount(() => {
    window.addEventListener("keydown", handleKeyDownGlobal);
    window.addEventListener("keyup", handleKeyUpGlobal);
  });

  // Handlers

  function handleKeyDownGlobal(e) {
    if (e.key === "Control") {
      isCtrlPressed = true;
    }
  }

  function handleKeyUpGlobal(e) {
    if (e.key === "Control") {
      isCtrlPressed = false;
    }
  }

  // Add new tag input (on key down 'Enter')
  function handleKewDown(e) {
    if (e.key !== "Enter") return;

    e.preventDefault();
    e.stopPropagation();

    let inputValue = e.target.value.trim();
    if (!inputValue) return;

    // Remove last character if is separator
    if (separator && inputValue.endsWith(separator)) {
      inputValue = inputValue.slice(0, -1);
    }

    const rules = separator // Separar por ';'
      ? inputValue.split(separator).map((tag) => tag.trim())
      : [inputValue];

    const cssRuleRegex = new RegExp(`${ruleSeparator}(.*)`, "s");

    rules.forEach((rule) => {
      let [key, value] = rule.split(cssRuleRegex);
      key = key.trim();
      value = value.trim();

      if (key.startsWith("--")) {
        key = key.slice(2);
      }

      // Set varsObject
      varsObject[key] = value;

      const data = { key, value };
      emitUpdate("added", data);

      // Set varsConfig
      let type = autoTypeVar(key, value);

      if (!varsConfig[key]) setVarConfig(key, type);
    });

    editor.setOptions({ value: getCSS() });

    refreshDropdown();

    e.target.value = "";
  }

  const dispatch = createEventDispatcher();
  function emitUpdate(type, data) {
    const event = {
      type,
      data,
    };
    dispatch("update", event);
  }

  function autoTypeVar(key, value) {
    let type = "text";

    const keyLC = key.toLowerCase();

    const autoTypeMarginOptions = ["margin"];
    const autoTypePaddingOptions = ["padding"];
    const isMarginType = autoTypeMarginOptions.some((option) =>
      keyLC.includes(option)
    );
    const isPaddingType = autoTypePaddingOptions.some((option) =>
      keyLC.includes(option)
    );

    //  Auto detect type

    if (isPaddingType) {
      type = "padding";
    }

    if (isMarginType) {
      type = "margin";
    }

    if (value.startsWith("url(")) {
      type = "url";
    } else if (value.startsWith("#")) {
      type = "color";
    }

    return type;
  }

  let prevVarsObject = null;

  // For icon indicators (Types: margin, padding, border-radius)
  function handleClick(e, key) {
    const element = e.target;
    activeKey = key;
    const type = varsConfig[key].type;
    detectCursorPosition(element, type);

    prevVarsObject = { ...varsObject };
  }

  // For text input (Types: text, url)
  function handleClickText(e, key) {
    if (isCtrlPressed) {
      return;
    }

    activeKey = key;

    // focus on textInput
    textInputs[key].focus();
    textInputs[key].select();

    prevVarsObject = { ...varsObject };
  }

  // On blur variable value box (Types: all)
  function handleBlur(e, key) {
    const element = e.target;
    activeProperty = null;
    activeKey = null;

    // if type is color
    if (varsConfig[key].type === "color") {
      const isValid = isValidColor(element.innerText);
      if (!isValid) {
        element.style.color = "red";
        return;
      } else {
        element.style.color = "unset";
      }
      varsObject[key] = element.innerText.toLowerCase();
    } else if (varsConfig[key].type === "text") {
      varsObject[key] = element.value;
    } else if (varsConfig[key].type === "url") {
      const isValid = isValidCSSUrl(element.value);
      if (isValid) {
        varsObject[key] = element.value;
      } else {
        // clean url, replace start url( or ) end ( representa que está malformado i si esta malformador es por que falta url( o el parentisis final))
        let validCSSUrl = fixCSSUrl(element.value);
        if (validCSSUrl.startsWith("url")) {
          validCSSUrl = validCSSUrl
            .replace("url", "")
            .trim()
            .replaceAll(")", "")
            .replaceAll("(", "");
        }

        // if(validCSSUrl.endsWith(')')) {
        //   validCSSUrl = validCSSUrl.slice(0, -1);
        // }

        const finalValue = `url(${validCSSUrl})`;
        varsObject[key] = finalValue;
        element.value = finalValue;
      }
    } else if (
      varsConfig[key].type === "multi-value" ||
      varsConfig[key].type === "border-radius" ||
      varsConfig[key].type === "padding" ||
      varsConfig[key].type === "margin"
    ) {
      if (element.innerHTML.endsWith("&nbsp;")) {
        varsObject[key] = varsObject[key].slice(0, -1);
      }
    }

    editor.setOptions({ value: getCSS() });

    console.log({ prevVarsObject, varsObject });
    getObjectDifferences(prevVarsObject, varsObject);
    prevVarsObject = null;
  }

  function handleFocus(e, key) {
    selectElementText(e.target);
    prevVarsObject = { ...varsObject };
  }

  function handleKeyup(e, key) {
    const element = e.target;
    if (element.innerHTML === "<br>" || element.innerHTML.trim() === "") {
      element.innerHTML = ""; // Limpia el contenido
    }

    if (varsConfig[key].type === "range" && varsConfig[key].unit) {
      let unit = varsConfig[key].unit;

      if (e.key === ".") {
      } else if (e.key === "Backspace" || e.key === "Delete") {
        if (isNumeric(element.innerText.replace(unit, ""))) {
          element.style.color = "unset";
        } else {
          element.style.color = "red";
        }
      } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      } else {
        if (isNumeric(element.innerText.replace(unit, ""))) {
          element.style.color = "unset";
        } else {
          element.style.color = "red";
        }
      }
    } else if (varsConfig[key].type === "color") {
      const isValid = isValidColor(element.innerText);

      if (!isValid) {
        element.style.color = "red";
        return;
      } else {
        element.style.color = "unset";
      }
    }
  }

  function handleKeydown(e, key) {
    const element = e.target;
    const type = varsConfig[key].type;

    if (e.key === "Enter") {
      e.preventDefault();
      applyValue(key, element);
      // loss focus
      element.blur();
      // delete range selection
      const selection = window.getSelection(); // Obtenemos la selección actual
      if (selection) {
        selection.removeAllRanges(); // Cancelamos cualquier rango seleccionado
      }
    }

    if (type === "range" && varsConfig[key].unit) {
      if (e.key === ".") {
        
        // comprobar si ya hay 1 '.' en innerText
        if (element.innerText.includes(".")) {
          e.preventDefault();
        }
      } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        // console.log("Arrows: " + element.innerText);
      } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault(); // Evitamos que se ejecute el comportamiento por defecto
        let currentValue = element.innerText.replace(varsConfig[key].unit, ""); // Obtenemos el valor actual como cadena
        // alert(currentValue)

        // Dividimos en parte entera y parte decimal
        let [integerPart, decimalPart] = currentValue.split(".");

        integerPart = parseInt(integerPart); // Convertimos la parte entera a número

        if (e.key === "ArrowUp") {
          integerPart += 1; // Incrementamos la parte entera
        } else if (e.key === "ArrowDown") {
          integerPart -= 1; // Decrementamos la parte entera
        }

        // Reconstruimos el número con la parte decimal intacta
        element.innerText = decimalPart
          ? `${integerPart}.${decimalPart}%`
          : `${integerPart}%`;

        varsObject[key] = element.innerText;

        applyValue(key, element);
        // Seleccionamos el texto completo
        selectElementText(element);
      }
    } else if (
      ["multi-value", "border-radius", "padding", "margin"].includes(type)
    ) {
      let totalPositions = element.innerText.trim().split(" ").length;

      if (e.key === " ") {
        if (element.innerHTML.endsWith("&nbsp;") || totalPositions === 4) {
          // Verificamos si ya hay un espacio al final
          // Prevenimos que se añada otro espacio
          e.preventDefault();
        }
      }

      detectCursorPosition(element, type);
    }
  }

  function toggleView() {
    view = view === "tags" ? "css" : "tags";
  }

  function applyValue(key, element) {
    if (varsConfig[key].type === "range" && varsConfig[key].unit) {
      if (isNumeric(element.innerText.replace(varsConfig[key].unit, ""))) {
        element.style.color = "unset";
      } else {
        element.style.color = "red";
      }
    } else {
      // varsObject[key] = element.innerText;
    }
  }

  function rangeInputHandler(e, key) {
    const unit = varsConfig[key]?.unit || "%";
    const value = e.target.value + unit;
    varsObject[key] = value;

    const data = { key, value };
    emitUpdate("modified", data);
  }

  function rangeChangeHandler(e, key) {
    // Nothin at the moment
  }

  function handleColorChange(e, key) {
    varsObject[key] = e.target.value;

    const data = { key, value: e.target.value };
    emitUpdate("modified", data);
  }

  // Función para seleccionar el texto de un elemento
  function selectElementText(el, start = null, end = null) {
    const range = document.createRange(); // Creamos un rango
    const selection = window.getSelection(); // Obtenemos la selección actual

    if (start !== null && end !== null) {
      // Selección parcial basada en start y end
      range.setStart(el.firstChild, start);
      range.setEnd(el.firstChild, end);
    } else {
      // Selección completa del contenido del nodo por defecto
      range.selectNodeContents(el);
    }

    selection.removeAllRanges(); // Limpiamos cualquier rango previo
    selection.addRange(range); // Añadimos el rango actual
  }

  function cssVarsToObject(cssString) {
    return Object.fromEntries(
      cssString
        .match(/--\w+:\s*[^;]+;/g) // Busca pares clave-valor completos terminados en ';'
        .map((declaration) => {
          const [key, ...valueParts] = declaration.split(/:\s*/); // Divide en clave y resto
          const value = valueParts.join(":").replace(/;$/, "").trim(); // Reconstruye el valor y elimina el ';'
          return [key.trim().slice(2), value]; // Remueve '--' de la clave
        })
    );
  }

  function detectCursorPosition(
    element,
    type: "multi-value" | "border-radius" | "padding" | "margin"
  ) {
    setTimeout(() => {
      const value = element.innerText;
      const selection = window.getSelection();
      const cursorPosition = selection.anchorOffset;
      const values = value.split(/\s+/); // Dividir por espacios
      console.log({ values });
      const positions = []; // Índices de cada valor

      // Calcular los índices en el texto original
      let index = 0;
      for (let value of values) {
        if (value !== "") {
          positions.push({ start: index, end: index + value.length });
          index += value.length + 1; // +1 por el espacio
        } else {
          // index += 1;
        }
      }

      // Determinar qué valor está siendo modificado
      let activeValue = null;
      for (let i = 0; i < positions.length; i++) {
        if (
          cursorPosition >= positions[i].start &&
          cursorPosition <= positions[i].end
        ) {
          activeValue = i;
          break;
        }
      }

      // Identificar la propiedad basada en la cantidad de valores
      if (type === "multi-value" || type === "padding" || type === "margin") {
        if (values.length === 1) {
          activeProperty = "all";
        } else if (values.length === 2) {
          activeProperty = activeValue === 0 ? "y" : "x";
        } else if (values.length === 3) {
          activeProperty = ["top", "x", "bottom"][activeValue];
        } else if (values.length === 4) {
          const properties = ["top", "right", "bottom", "left"];
          activeProperty = properties[activeValue];
        } else {
          activeProperty = null;
        }
      } else if (type === "border-radius") {
        if (values.length === 1) {
          activeProperty = "all";
        } else if (values.length === 2) {
          activeProperty =
            activeValue === 0
              ? "top-left bottom-right"
              : "top-right bottom-left";
        } else if (values.length === 3) {
          activeProperty = [
            "top-left",
            "top-right bottom-left",
            "bottom-right",
          ][activeValue];
        } else if (values.length === 4) {
          const properties = [
            "top-left",
            "top-right",
            "bottom-right",
            "bottom-left",
          ];
          activeProperty = properties[activeValue];
        } else {
          activeProperty = null;
        }
      }
    }, 0); // Timeout para esperar a que el cursor se posicione
  }

  // Dropdown and labels editor
  let showLabelsEditor = false;
  let showConfig = false;

  function toggleLabelsEditor(e) {
    e.stopPropagation();
    showLabelsEditor = !showLabelsEditor;
    recalculateDropdownPosition();
  }

  function toggleConfig(e) {
    e.stopPropagation();
    showConfig = !showConfig;
    recalculateDropdownPosition();
  }

  function handleClickOptions(key) {
    openedKey = key;
  }

  function handleCloseDropdown() {
    openedKey = null;
    // showLabelsEditor = false;
    console.log("closed");
  }

  function handleOpenDropdown(e) {
    // console.log(e.detail.openedId)
  }

  // Cambiar la clave del idioma
  function updateLangKey(index, oldKey, e) {
    let newKey = e.target.value.trim();

    if (!newKey) {
      console.warn("La nueva clave no puede estar vacía.");
      return; // Evita claves vacías como nuevo valor
    }

    // Iterar sobre todos los elementos de varsConfig
    for (const key in varsConfig) {
      if (
        varsConfig[key].label &&
        varsConfig[key].label.hasOwnProperty(oldKey)
      ) {
        const entries = Object.entries(varsConfig[key].label);
        const updated = Object.fromEntries(
          entries.map(([k, value], i) =>
            k === oldKey ? [newKey, value] : [k, value]
          )
        );
        varsConfig[key].label = updated;
      }
    }
  }

  // Cambiar el valor asociado al idioma
  function updateLangValue(lang, e) {
    let newValue = e.target.value;
    varsConfig[openedKey].label[lang] = newValue;
  }

  function addLabelItem() {
    for (const key in varsConfig) {
      if (varsConfig[key].label) {
        // Evitar múltiples entradas vacías
        if (!Object.keys(varsConfig[key].label).includes("")) {
          varsConfig[key].label = {
            ...varsConfig[key].label,
            "": "",
          };
        } else {
          console.warn(`El item "${key}" ya tiene un label vacío.`);
        }
      } else {
        // Inicializar label si no existe
        varsConfig[key].label = { "": "" };
      }
    }
  }

  function removeLabelItemHandler(e, index) {
    e.preventDefault();
    e.stopPropagation();

    // Obtener la clave que se debe eliminar según el índice
    const targetKey = Object.keys(varsConfig[openedKey].label)[index];

    if (targetKey === undefined) {
      console.warn("No se encontró la clave a eliminar.");
      return;
    }

    // Iterar sobre todos los elementos de varsConfig y eliminar la clave
    for (const key in varsConfig) {
      if (varsConfig[key].label) {
        varsConfig[key].label = Object.fromEntries(
          Object.entries(varsConfig[key].label).filter(
            ([k]) => k !== targetKey && k !== ""
          )
        );
      }
    }

    console.log("Actualizado varsConfig después de eliminar:", varsConfig);
  }

  // Get CSS code

  export function getCSS() {
    return Object.entries(varsObject)
      .map(([key, value]) => `--${key}: ${value};`)
      .join("\n");
  }

  // CSS editor
  let editor;
  let value = null; // If value is null provides a sample code

  function onTokenize(e) {
    console.log(e);
  }

  function onUpdate(e) {
    const { eventType, code } = e.detail;

    if (eventType === "update") {
      const currentVarsObject = varsObject; // Estado actual
      const newVarsObject = parseCssVars(code, currentVarsObject); // Generar nuevo estado con validación

      if (!isEqual(currentVarsObject, newVarsObject)) {
        varsObject = newVarsObject;

        varsConfig = updateVarsConfig();
        refreshDropdown();
      }
    }
  }

  // Función para parsear CSS vars y conservar claves con valores vacíos
  function parseCssVars(cssString, currentVars) {
    const newVars = {};
    const matches = cssString.match(/--\w+:\s*[^;]*;?/g) || []; // Permite valores vacíos

    matches.forEach((declaration) => {
      const [key, ...valueParts] = declaration.split(/:\s*/);
      const value = valueParts.join(":").replace(/;$/, "").trim(); // Captura valores vacíos
      if (key) {
        newVars[key.trim().slice(2)] = value || ""; // Asigna valor vacío si no se especifica
      }
    });

    // Conserva claves de currentVars que no pudieron parsearse
    Object.keys(currentVars).forEach((key) => {
      if (!(key in newVars)) {
        const regexKey = new RegExp(`--${key}\\b`);
        if (regexKey.test(cssString)) {
          newVars[key] = currentVars[key]; // Mantén claves que aún existen parcialmente
        }
      }
    });

    return newVars;
  }

  // Función para comparar dos objetos profundamente
  function isEqual(obj1, obj2) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    return keys1.every(
      (key) => obj2.hasOwnProperty(key) && obj1[key] === obj2[key]
    );
  }

  // Función para obtener diferencias entre objetos
  function getObjectDifferences(obj1, obj2) {
    const differences = {
      added: {},
      removed: {},
      modified: {},
    };

    if (obj1 === null || obj2 === null) return;

    // Detectar claves añadidas o modificadas
    Object.keys(obj2).forEach((key) => {
      if (!obj1.hasOwnProperty(key)) {
        const value = obj2[key];
        const data = { key, value };
        differences.added[key] = data;

        emitUpdate("added", data);
      } else if (obj1[key] !== obj2[key]) {
        const data = { key, prev_value: obj1[key], value: obj2[key] };
        differences.modified[key] = data;

        emitUpdate("modified", data);
      }
    });

    // Detectar claves eliminadas
    Object.keys(obj1).forEach((key) => {
      if (!obj2.hasOwnProperty(key)) {
        const data = { key };
        differences.removed[key] = data;

        emitUpdate("removed", data);
      }
    });

    return differences;
  }

  function getLangs() {
    // Check if varsConfig object has min a 1 key
    const objectKeys = Object.keys(varsConfig);
    if (objectKeys.length === 0) {
      return defaultLangs;
    } else {
      // get first varConfig item.label keys
      const firstVarConfig = Object.keys(varsConfig[objectKeys[0]].label);

      return firstVarConfig;
    }
  }

  function updateVarsConfig() {
    const langs = getLangs();
    // Recorre las claves del objeto para completar varsConfig
    Object.keys(varsObject).forEach((key) => {
      if (!varsConfig[key]) {
        // Si la clave no está en VarsConfig, se crea un nuevo item
        // Set varsConfig
        let type = autoTypeVar(key, varsObject[key]);
        setVarConfig(key, type);
      }
    });

    return varsConfig;
  }

  function setVarConfig(key, type = "text") {
    const langs = getLangs();
    varsConfig[key] = {
      label: Object.fromEntries(
        langs.map((lang) => [lang, ""]) // Crea objetos con claves de idiomas y valores vacíos
      ),
      type,
    };
  }

  let closeDropdown = null;

  function deleteVariable(e) {
    // remove object key from varsObject and varsConfig in svelte reactivity
    delete varsObject[openedKey];
    delete varsConfig[openedKey];

    varsObject = varsObject;
    varsConfig = varsConfig;
    // update CSS code in svelte

    editor.setOptions({ value: getCSS() });
    closeDropdown();
  }

  function handleChangeType(e) {
    varsConfig[openedKey].type = e.target.value;
  }
</script>

<div class="tags-field css-vars-field" id={id} class:editable-mode={editable}>
  <div class="tags-field-content" class:editable-mode={editable}>
    {#if Object.keys(varsObject).length > 0}
      <div class:hide={view !== "tags"} class="tags-field-tags" style={styleConfigCSSVariables}>
        {#each Object.entries(varsObject) as [key, value], tagIndex (key)}
          <div class="css-var-tag">
            <div class="tag-header">
              <span class="label"
                >{varsConfig[key]?.label?.[lang] || `--${key}`}</span
              >
              {#if editable}
                <button
                  class="tag-options-btn"
                  on:click={() => handleClickOptions(key)}
                  data-dropdown-toggle="dropdown"
                  data-dropdown-trigger="click"
                  data-dropdown-key={key}
                  type="button"
                  aria-label="More options"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 0 24 24"
                    width="24px"
                    fill="currentColor"
                    class="s-k-Zd1o_TbrPY s-FoWgdxtd47B6"
                    style="font-size: 16px;height: 16px;width: 16px;"
                    ><path
                      d="M0 0h24v24H0V0z"
                      fill="none"
                      class="s-k-Zd1o_TbrPY s-FoWgdxtd47B6"
                    ></path><path
                      d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
                      class="s-k-Zd1o_TbrPY s-FoWgdxtd47B6"
                    ></path></svg
                  >
                </button>
              {/if}
            </div>

            <div
              class="tag-content tag-content--{varsConfig[key]?.type || 'text'}"
              class:is-hex={value.startsWith("#")}
              class:focus={activeKey === key}
            >
              <!-- <small class="tag-key">--{key} :</small> -->

              {#if varsConfig[key]?.type === "color"}
                <div class="color-box">
                  <label class="color-box-label" style="background: {value};">
                    <input
                      class="color-box-input"
                      type="color"
                      value={formatColor(value)}
                      on:input={(e) => handleColorChange(e, key)}
                    />
                  </label>
                </div>

                <span
                  tabindex="0"
                  role="textbox"
                  on:blur={(e) => handleBlur(e, key)}
                  on:keyup={(e) => handleKeyup(e, key)}
                  on:keydown={(e) => handleKeydown(e, key)}
                  on:focus={(e) => handleFocus(e, key)}
                  class="editable-box"
                  placeholder={"Add a value"}
                  contenteditable
                  class:with-unit={varsConfig[key].unit}
                  data-unit={varsConfig[key].unit}>{value}</span
                >
              {:else if varsConfig[key]?.type === "text"}
                <input
                  bind:this={textInputs[key]}
                  type="text"
                  {value}
                  on:blur={(e) => handleBlur(e, key)}
                  on:keyup={(e) => handleKeyup(e, key)}
                  on:keydown={(e) => handleKeydown(e, key)}
                />
                <span
                  tabindex="0"
                  role="button"
                  on:click={(e) => handleClickText(e, key)}
                  on:focus={(e) => handleFocus(e, key)}
                  class="editable-box"
                  placeholder={"Add a value"}
                  class:with-unit={varsConfig[key].unit}
                  data-unit={varsConfig[key].unit}>{value}</span
                >
              {:else if varsConfig[key]?.type === "url"}
                <input
                  bind:this={textInputs[key]}
                  type="text"
                  {value}
                  on:blur={(e) => handleBlur(e, key)}
                  on:keyup={(e) => handleKeyup(e, key)}
                  on:keydown={(e) => handleKeydown(e, key)}
                />

                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <span
                  tabindex="0"
                  role="button"
                  on:click={(e) => handleClickText(e, key)}
                  class="editable-box"
                  placeholder={"Add a value"}
                  class:with-unit={varsConfig[key].unit}
                  data-unit={varsConfig[key].unit}
                >
                  {#if isValidCSSUrl(value)}
                    url(
                    <span class="url-value">
                      {#if isCtrlPressed}
                        <a
                          href={getHref(value)}
                          target="_blank"
                          rel="noopener noreferrer">{getHref(value)}</a
                        >
                      {:else}
                        <!-- svelte-ignore a11y_missing_attribute -->
                        <a
                          title={getHref(value) +
                            " (Ctrl + click to open in a new tab)"}
                          >{getHref(value)}</a
                        >
                      {/if}
                    </span>
                    )
                  {:else}
                    <span
                      class="url-value"
                      class:invalid={!isValidCSSUrl(value)}>{value}</span
                    >
                  {/if}
                </span>
              {:else if varsConfig[key]?.type === "multi-value"}
                <div
                  class="multi-value-box padding-box {activeProperty &&
                  activeKey === key
                    ? activeProperty
                    : ''}"
                >
                  {@html varsConfig[key].svgIcon}
                </div>

                <span
                  tabindex="0"
                  role="textbox"
                  on:blur={(e) => handleBlur(e, key)}
                  on:keyup={(e) => handleKeyup(e, key)}
                  on:keydown={(e) => handleKeydown(e, key)}
                  on:click={(e) => handleClick(e, key)}
                  bind:innerText={varsObject[key]}
                  class="editable-box"
                  placeholder={"Add a value"}
                  contenteditable
                  class:with-unit={varsConfig[key].unit}
                  data-unit={varsConfig[key].unit}>{value}</span
                >
              {:else if varsConfig[key]?.type === "border-radius" || varsConfig[key]?.type === "padding" || varsConfig[key]?.type === "margin"}
                <div
                  class="multi-value-box padding-box {activeProperty &&
                  activeKey === key
                    ? activeProperty
                    : ''}"
                >
                  {#if varsConfig[key].svgIcon}
                    {@html varsConfig[key].svgIcon}
                  {:else if varsConfig[key].type === "border-radius"}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 -960 960 960"
                      width="24px"
                      fill="currentColor"
                    >
                      <!-- Esquina superior izquierda -->
                      <path
                        class="top-left"
                        d="M120-600v-160q0-33 23.5-56.5T200-840h160v80H200v160h-80Z"
                      />
                      <!-- Esquina superior derecha -->
                      <path
                        class="top-right"
                        d="M760-600v-160H600v-80h160q33 0 56.5 23.5T840-760v160h-80Z"
                      />
                      <!-- Esquina inferior izquierda -->
                      <path
                        class="bottom-left"
                        d="M200-120q-33 0-56.5-23.5T120-200v-160h80v160h160v80H200Z"
                      />
                      <!-- Esquina inferior derecha -->
                      <path
                        class="bottom-right"
                        d="M600-120v-80h160v-160h80v160q0 33-23.5 56.5T760-120H600Z"
                      />
                    </svg>
                  {:else if varsConfig[key].type === "padding"}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="icon icon-padding"
                      style="height: 26px;min-width: 26px;"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                      <path
                        d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"
                      ></path>
                      <path class="left bottom" d="M8 16v.01"></path>
                      <path class="left" d="M8 12v.01"></path>
                      <path class="left top" d="M8 8v.01"></path>
                      <path class="right bottom" d="M16 16v.01"></path>
                      <path class="right" d="M16 12v.01"></path>
                      <path class="right top" d="M16 8v.01"></path>
                      <path class="top" d="M12 8v.01"></path>
                      <path class="bottom" d="M12 16v.01"></path>
                    </svg>
                  {:else if varsConfig[key].type === "margin"}
                    <svg
                      style="height: 26px;min-width: 26px;"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      width="24"
                      height="24"
                      stroke-width="2"
                    >
                      <path d="M8 8h8v8h-8z"></path>
                      <path class="top left" d="M4 4v.01"></path>
                      <path class="top" d="M8 4v.01"></path>
                      <path class="top" d="M12 4v.01"></path>
                      <path class="top" d="M16 4v.01"></path>
                      <path class="top right" d="M20 4v.01"></path>
                      <path class="bottom left" d="M4 20v.01"></path>
                      <path class="bottom" d="M8 20v.01"></path>
                      <path class="bottom" d="M12 20v.01"></path>
                      <path class="bottom" d="M16 20v.01"></path>
                      <path class="bottom right" d="M20 20v.01"></path>
                      <path class="right" d="M20 16v.01"></path>
                      <path class="right" d="M20 12v.01"></path>
                      <path class="right" d="M20 8v.01"></path>
                      <path class="left" d="M4 16v.01"></path>
                      <path class="left" d="M4 12v.01"></path>
                      <path class="left" d="M4 8v.01"></path>
                    </svg>
                  {/if}
                </div>

                <span
                  tabindex="0"
                  role="textbox"
                  on:blur={(e) => handleBlur(e, key)}
                  on:keyup={(e) => handleKeyup(e, key)}
                  on:keydown={(e) => handleKeydown(e, key)}
                  on:click={(e) => handleClick(e, key)}
                  bind:innerText={varsObject[key]}
                  class="editable-box"
                  placeholder={"Add a value"}
                  contenteditable
                  class:with-unit={varsConfig[key].unit}
                  data-unit={varsConfig[key].unit}>{value}</span
                >
              {:else if varsConfig[key]?.type === "range"}
                <div class="range-box">
                  <input
                    on:input={(e) => rangeInputHandler(e, key)}
                    on:change={(e) => rangeChangeHandler(e, key)}
                    type="range"
                    value={value.replace(varsConfig[key].unit, "")}
                    name=""
                    id=""
                  />
                </div>

                <span
                  bind:this={textInputs[key]}
                  tabindex="0"
                  role="textbox"
                  on:blur={(e) => handleBlur(e, key)}
                  on:keyup={(e) => handleKeyup(e, key)}
                  on:keydown={(e) => handleKeydown(e, key)}
                  on:focus={(e) => handleFocus(e, key)}
                  bind:innerText={varsObject[key]}
                  class="editable-box editable-box--range"
                  placeholder={"Add a value"}
                  contenteditable
                  class:with-unit={varsConfig[key].unit}
                  data-unit={varsConfig[key].unit}
                ></span>
              {:else}
                <input
                  bind:this={textInputs[key]}
                  type="text"
                  {value}
                  on:blur={(e) => handleBlur(e, key)}
                  on:keyup={(e) => handleKeyup(e, key)}
                  on:keydown={(e) => handleKeydown(e, key)}
                />
                <span
                  tabindex="0"
                  role="button"
                  on:click={(e) => handleClickText(e, key)}
                  on:focus={(e) => handleFocus(e, key)}
                  class="editable-box"
                  placeholder={"Add a value"}
                  class:with-unit={varsConfig[key]?.unit}
                  data-unit={varsConfig[key]?.unit}>{value}</span
                >
              {/if}

              <!-- <button
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
              </button> -->
            </div>
          </div>
        {/each}
      </div>

      <div
        class:hide={view !== "css"}
        class="css-code"
        style="text-align: left;"
      >
        <!-- {#each Object.entries(varsObject) as [key, value], tagIndex}
          <div class="css-var-declaration">
            <span class="css-var-key">--{key}</span>
            <span class="css-var-separator">:</span>
            <span class="css-var-value">{value};</span>
          </div>
        {/each} -->
        <PrismCodeEditor
          bind:editor
          on:update={(e) => onUpdate(e)}
          on:tokenize={(e) => onTokenize(e)}
          language="css"
          id={`${id}__code-editor` || "example-code-editor"}
          value={getCSS()}
          className="no-drag"
        />
      </div>
    {/if}

    {#if editable}
      <div class="tags-field-input-box">
        <input
          type="text"
          {placeholder}
          on:keydown={handleKewDown}
          class="add-tags-input"
        />

        <input
          type="hidden"
          name="{name}__flexi-tags-field"
          value={JSON.stringify(tags)}
        />

        <div class="tags-field-rigth-actions">
          <div class="toggle-view">
            <button
              type="button"
              class:active={view === "tags"}
              on:click={toggleView}>Tags</button
            >
            <button
              type="button"
              class:active={view === "css"}
              on:click={toggleView}>CSS</button
            >
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<Dropdown
  bind:refreshDropdown
  bind:calculatePosition={recalculateDropdownPosition}
  bind:close={closeDropdown}
  position="bottom-right"
  yOffset={2}
  xOffset={0}
  id="dropdown"
  on:close={handleCloseDropdown}
  on:open={handleOpenDropdown}
>
  {#if !showLabelsEditor && !showConfig}
    <DropdownItem on:clicked={(e) => toggleConfig(e)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="16"
        viewBox="0 -960 960 960"
        width="16"
        fill="currentColor"
        ><path
          d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm112-260q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Z"
        /></svg
      >
      Configuración
    </DropdownItem>
    <DropdownItem on:clicked={(e) => toggleLabelsEditor(e)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="16"
        viewBox="0 -960 960 960"
        width="16"
        fill="currentColor"
        ><path
          d="m476-80 182-480h84L924-80h-84l-43-122H603L560-80h-84ZM160-200l-56-56 202-202q-35-35-63.5-80T190-640h84q20 39 40 68t48 58q33-33 68.5-92.5T484-720H40v-80h280v-80h80v80h280v80H564q-21 72-63 148t-83 116l96 98-30 82-122-125-202 201Zm468-72h144l-72-204-72 204Z"
        /></svg
      >
      Editar labels
    </DropdownItem>
    <DropdownItem on:clicked={(e) => deleteVariable(e)}>
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
        class="delete-icon"
        ><path d="M3 6h18"></path><path
          d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"
        ></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg
      >
      Eliminar
    </DropdownItem>
  {/if}

  {#if showLabelsEditor}
    <article class="labels-editor">
      <header class="labels-editor-header">
        <div class="title-container">
          <button on:click={(e) => toggleLabelsEditor(e)} class="back-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="22px"
              viewBox="0 -960 960 960"
              width="22px"
              fill="currentColor"
              ><path
                d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z"
              /></svg
            >
          </button>

          <h3 class="labels-editor-title">Labels</h3>
        </div>
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <button on:click={(e) => addLabelItem()} class="add-label-btn">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="20"
            viewBox="0 -960 960 960"
            width="20"
            fill="currentColor"
            ><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"
            ></path></svg
          >
        </button>
      </header>

      <div class="label-items">
        {#each Object.entries(varsConfig[openedKey].label) as [lang, value], index}
          <div class="label-item">
            <!-- Input para cambiar el idioma (clave) -->
            <input
              class="label-item-input label-item-input--lang"
              value={lang}
              on:blur={(e) => updateLangKey(index, lang, e)}
            />

            <!-- Input para cambiar el valor del idioma -->
            <input
              class="label-item-input label-item-input--value"
              {value}
              on:input={(e) => updateLangValue(lang, e)}
            />

            {#if !varsConfigFixed[Object.keys(varsConfigFixed)[0]]?.label[lang]}
              <button
                type="button"
                aria-label="Delete label item"
                class="delete-label-item-btn"
                on:click={(e) => removeLabelItemHandler(e, index)}
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
                  class="delete-icon"
                  ><path d="M3 6h18"></path><path
                    d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"
                  ></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
                  ></path></svg
                >
              </button>
            {/if}
          </div>
        {/each}
      </div>
    </article>
  {/if}

  {#if showConfig}
    <article class="labels-editor">
      <header class="labels-editor-header">
        <div class="title-container">
          <button on:click={(e) => toggleConfig(e)} class="back-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="22px"
              viewBox="0 -960 960 960"
              width="22px"
              fill="currentColor"
              ><path
                d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z"
              /></svg
            >
          </button>

          <h3 class="labels-editor-title">Configuración</h3>
        </div>
      </header>

      <div class="config-panel">
        <label>
          <select on:change={(e) => handleChangeType(e)}>
            <option
              selected={varsConfig[openedKey].type === "text"}
              value="text">Text</option
            >
            <option
              selected={varsConfig[openedKey].type === "color"}
              value="color">Color</option
            >
            <option
              selected={varsConfig[openedKey].type === "range"}
              value="range">Range</option
            >
            <option
              selected={varsConfig[openedKey].type === "margin"}
              value="margin">Margin</option
            >
            <option
              selected={varsConfig[openedKey].type === "padding"}
              value="padding">Padding</option
            >
            <option
              selected={varsConfig[openedKey].type === "border-radius"}
              value="border-radius">Border Radius</option
            >
            <option selected={varsConfig[openedKey].type === "url"} value="url"
              >Url</option
            >
          </select>
        </label>
      </div>
    </article>
  {/if}
</Dropdown>

<style>
  @import "./styles.css";

  :global(.dropdown-item) svg {
    margin-left: -2px;
  }

  .config-panel label {
    display: flex;
    gap: 5px;
    text-transform: uppercase;
    font-size: 12px;
    font-weight: 500;
    flex-direction: column;
    text-align: left;
  }

  select {
    flex: auto;
    padding: 6px 4px;
    background: #232323;
    border: none;
    border-right: 4px solid #232323;
    border-radius: 8px;
    font-size: 14px;
    color: #c4c4c4;
  }

  .hide {
    display: none;
  }

  .labels-editor {
    background: transparent;
    border-radius: 9px;
  }

  .labels-editor-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .title-container {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .back-btn {
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    cursor: pointer;
  }

  .labels-editor-title {
    font-size: 15px;
    font-weight: 500;
    margin: 0;
    padding-right: 14px;
  }

  .add-label-btn {
    background: #ffffff0f;
    color: #ffffffe6;
    border: none;
    padding: 2px;
    cursor: pointer;
    border-radius: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .label-items {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 238px;
    overflow: auto;
    scrollbar-width: thin;
  }

  .label-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .delete-label-item-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    width: 22px;
    height: 22px;

    svg {
      width: 14px;
      height: 14px;
    }
  }

  .label-item-input {
    border: none;
    padding: 6px 9px;
    border-radius: 8px;
    font-size: 13px;
    color: #ffffffc4;
    flex: auto;
    box-sizing: border-box;
    height: 27px;
    width: 160px;
    background: transparent;

    &.label-item-input--lang {
      text-align: center;
      font-weight: 500;
      box-sizing: border-box;
      width: 100%;
      max-width: 50px;
      font-size: 14px;
      background: #ffffff0a;
    }
  }

  .dropdown {
    position: relative;
  }
  .dropdown-button {
    padding: 10px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
  }
  .dropdown-menu {
    position: absolute;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-top: 4px;
    list-style: none;
    padding: 0;
    z-index: 1000;
  }
  .dropdown-item {
    padding: 10px;
    cursor: pointer;
  }
  .dropdown-item:hover {
    background-color: #f0f0f0;
  }
  .arrow {
    margin-left: 8px;
  }

  .tags-field-rigth-actions {
    display: flex;
    gap: 1rem;
    align-items: center;

    .remove-all-btn {
      padding: 0;
      background-color: transparent;
      border: none;
      color: red;
      font-size: 14px;
      border-radius: 0;
      outline: none;
    }
  }

  .padding-box,
  .margin-box {
    padding: 8px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
  }

  
  .padding-box,
  .margin-box,
  .multi-value-box {
    --active-color: #6cf0ff;
    &.all {
      .left,
      .right,
      .top,
      .bottom {
        stroke: var(--active-color);
      }
    }

    &.x {
      .left,
      .right {
        stroke: var(--active-color);
      }
    }

    &.y {
      .top,
      .bottom {
        stroke: var(--active-color);
      }
    }

    &.top {
      svg .top {
        stroke: var(--active-color);
      }
    }

    &.right {
      svg .right {
        stroke: var(--active-color);
      }
    }

    &.bottom {
      svg .bottom {
        stroke: var(--active-color);
      }
    }

    &.left {
      svg .left {
        stroke: var(--active-color);
      }
    }
  }

  .multi-value-box {
    --active-color: #6cffd7;
    &.all {
      .top-left,
      .top-right,
      .bottom-right,
      .bottom-left {
        fill: var(--active-color);
      }
    }

    &.top-left {
      .top-left {
        fill: var(--active-color);
      }
    }

    &.top-right {
      .top-right {
        fill: var(--active-color);
      }
    }

    &.bottom-left {
      .bottom-left {
        fill: var(--active-color);
      }
    }

    &.bottom-right {
      .bottom-right {
        fill: var(--active-color);
      }
    }

    &.top-left.bottom-right {
      .top-left,
      .bottom-right {
        fill: var(--active-color);
      }
    }

    &.top-right.bottom-left {
      .top-right,
      .bottom-left {
        fill: var(--active-color);
      }
    }
  }
  

  .color-box {
    display: flex;
    align-items: center;
    padding: 8px;
    box-sizing: border-box;
    height: 40px;
    width: 40px;
    justify-content: center;
  }

  .range-box {
    padding: 8px;
    box-sizing: border-box;
    display: flex;
    flex: auto;
    height: 40px;

    input {
      width: 100%;
      accent-color: #fff;
      margin: 0;
    }
  }

  .css-code {
    text-align: left;
    white-space: normal;
  }

  :global(.code-editor) {
    min-height: auto;
  }
</style>
