<script lang="ts">
    import PreviewCard from './PreviewCard.svelte';
    import { Quote } from '@flexiui/svelte-quote';
    import { TagsInput }from '@flexiui/svelte-tags-input';
    import { CSSVars } from '@flexiui/svelte-cssvars';
    import { Dropdown, DropdownItem } from '@flexiui/svelte-dropdown';

    import Alert from './ui/Alert.svelte';
    import Button from './ui/Button.svelte';
    import Accordion from './ui/Accordion/Accordion.svelte';
    import AccordionItem from './ui/Accordion/AccordionItem.svelte';
    import AccordionSummary from './ui/Accordion/AccordionSummary.svelte'
    import AccordionContent from './ui/Accordion/AccordionContent.svelte';

    import Tabs from './ui/Tabs/Tabs.svelte';
    
    import ButtonPreview from '../content/docs/Button/examples/ButtonPreview.svelte';
    import Input from './ui/Input.svelte';
    import Textarea from './ui/Textarea.svelte';

    export let component;

    let field = {
        labels: {
            plural: 'Etiquetas',
            singular: 'Etiqueta'
        }
    };

    let content = `This is a simple and flexible "Quote" component designed to highlight phrases or important content. It allows easy customization of styles, icons, colors, and more. Additionally, it includes an editable mode for use in forms, block editors, and visual editors.`;

    function handleFocus(e: any) {
        console.log("focus");
        console.log(e);
    }

    function handleKeyDown(e: any) {
        console.log("keydown");
        console.log(e);
    }

    function handleInput(e: any) {
        console.log("input");
        console.log(e);
    }


    const varsCSSFixed = `
    --bgColor: #ffffff;
    --bgImage: url(https://hola.com/media/imagen.jpg);
    --textColor: #000000;
    --textOpacity: 100%;
    --padding: 1rem;
    --margin: 1rem 0;
    --buttonRadius: 6px 12px;
  `

  const varsCSS = `
    --bgColor: #ffffff;
    --bgImage: url(https://hola.com/media/imagen.jpg);
    --textColor: #000000;
    --textOpacity: 100%;
    --padding: 1rem;
    --margin: 1rem 0;
    --buttonRadius: 6px 12px;
    --sectionMargin: 1rem 0;
  `

  const varsConfigFixed = {
      bgColor: {
        label: {
          es: "Color de fondooooo",
          en: "Background color",
        },
        type: "color"
      },
      bgImage: {
        label: {
          es: "Imagen de fondo",
          en: "Background image",
        },
        type: "url"
      },
      textColor: {
        label: {
          es: "Color del texto",
          en: "Text color",
        },
        type: "color"        
      },
      textOpacity: {
        label: {
          es: "Opacidad del texto",
          en: "Text opacity",
        },
        type: "range",
        min: 0,
        max: 100,
        step: 1,
        unit: "%",
      },
      padding: {
        label: {
          es: "Padding",
          en: "Padding",
        },
        type: "padding",    
      },
      margin: {
        label: {
          es: "Margin",
          en: "Margin",
        },
        type: "margin",
      },
      buttonRadius: {
        label: {
          es: "Border radius del botón",
          en: "Button border radius"
        },
        type: "border-radius",
      }
  }

  let varsConfig = {
      bgColor: {
        label: {
          es: "Color de fondooooo",
          en: "Background color",
        },
        type: "color"
      },
      bgImage: {
        label: {
          es: "Imagen de fondo",
          en: "Background image",
        },
        type: "url"
      },
      textColor: {
        label: {
          es: "Color del texto",
          en: "Text color",
        },
        type: "color"        
      },
      textOpacity: {
        label: {
          es: "Opacidad del texto",
          en: "Text opacity",
        },
        type: "range",
        min: 0,
        max: 100,
        step: 1,
        unit: "%",
      },
      padding: {
        label: {
          es: "Padding",
          en: "Padding",
        },
        type: "padding",
      },
      margin: {
        label: {
          es: "Margin",
          en: "Margin",
        },
        type: "margin",
      },
      buttonRadius: {
        label: {
          es: "Border radius del botón",
          en: "Button border radius"
        },
        type: "border-radius",
      },
      sectionMargin: {
        label: {
          es: "Margin del sectionsss",
          en: "Section margin"
        },
        type: "margin",
      }
  }

  let varsObject:any = null;

  function onUpdate(e:any){
    const { type, data } = e.detail;
    console.log({type, data})
  }

  let recalculateDropdownPosition:any = null;

  function handleOpenDropdown(e:any) {
    console.log(e);
  }

  function handleCloseDropdown(e:any) {
    console.log(e);
  }


  function dropdownItemClickHandler(e:any) {
    console.log(e.detail);
  }

  let activePosition: "top-left" | "top-center" | "top-right" | 
                        "bottom-left" | "bottom-center" | "bottom-right" | 
                        "left-top" | "left-center" | "left-bottom" | 
                        "right-top" | "right-center" | "right-bottom" = "bottom-right";

  const positions = [
    ["top-left", "top-center", "top-right"], 
    ["bottom-left", "bottom-center", "bottom-right"], 
    ["left-top", "left-center", "left-bottom"], 
    ["right-top", "right-center", "right-bottom"]
  ];

  function changeDropdownPosition(position:any) {
    activePosition = position;
  }

  let activeTab = 0;
  let tabs: any = [
    // required
    {
      name: "exercise_content",
      label: "Contenido del ejercicio",
    },
    {
      name: "exercise_settings",
      label: "Ajustes del ejercicio",
    },
  ]
</script>

    
{#if component === 'quote'}
    <PreviewCard rounded outlined>
      <Quote
        className="my-quote"
        id="flexi-quote"
        bgColor="transparent"
        editable={true}
        value={content}
        on:focus={handleFocus}
        on:keydown={handleKeyDown}
        on:input={handleInput}
      >
      </Quote>
    </PreviewCard>
  {:else if component === 'cssvars'}
    <PreviewCard rounded outlined>
      <CSSVars
      id="my-cssvars"
      on:update={e => onUpdate(e)}
      {varsCSSFixed}
      {varsConfigFixed}
      {varsCSS}
      bind:varsConfig={varsConfig}
      bind:varsObject={varsObject}
      name="tags"
      labels={field.labels}
      tags={[]}
      ruleSeparator=':'
      separator=';'
      placeholder={'Press enter to add a new CSS Variable'}
      required={false} />
    </PreviewCard>
  {:else if component === 'tags-input'}
    <PreviewCard rounded outlined>
      <TagsInput
      name="tags"
      field={field}
      labels={field.labels}
      tags={['Banana', 'Apple', 'Mango', 'Grape', 'Orange', 'Pineapple', 'Strawberry', 'Blueberry', 'Watermelon']}
      min={1}
      max={3}
      allowDuplicates={false}
      bidimensional={false}
      bidimensionalSeparator='->'
      placeholder={'Presiona enter para agregar una nueva etiqueta'}
      required={false} />
    </PreviewCard>
  {:else if component === 'alert'}
    <PreviewCard rounded outlined>
      <Alert severity="info">
        <span>Here is a information message that you may want to display to your users</span>
      </Alert>

      <Alert severity="success">
        <span>Here is a gentle confirmation that your action was successful</span>
      </Alert>
    </PreviewCard>
  {:else if component === 'button'}
    <PreviewCard rounded outlined>
      <ButtonPreview />
    </PreviewCard>
  {:else if component === 'accordion'}
    <PreviewCard rounded outlined>
      <Accordion>
        <AccordionItem state="open">
          <AccordionSummary slot="summary">
            Is it accessible?
          </AccordionSummary>
          <AccordionContent>
            Yes. It adheres to the WAI-ARIA design pattern.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem>
          <AccordionSummary slot="summary">
            Is it styled?
          </AccordionSummary>
          <AccordionContent>
            Yes. It comes with default styles that matches the other components' aesthetic.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem>
          <AccordionSummary slot="summary">
            Is it animated?
          </AccordionSummary>        
          <AccordionContent>
            Yes! You can animate the Accordion with CSS or JavaScript.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </PreviewCard>
  {:else if component === 'dropdown'}
    <PreviewCard rounded outlined>
        <div class="btn-groups">
          {#each positions as positionRow}
            <div class="btn-group">
              {#each positionRow as position }
                <Button variant="contained"
                on:click={() => changeDropdownPosition(position)}>
                {position.replaceAll('-', ' ')}
                </Button>
              {/each}        
            </div>
          {/each}
        </div>
    
        <Dropdown 
        bind:calculatePosition={recalculateDropdownPosition} 
        position={activePosition}
        yOffset={0} 
        xOffset={0}
        margin={8}
        id="dropdown" 
        on:close={handleCloseDropdown} 
        on:open={handleOpenDropdown}>
    
          <DropdownItem>
            <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16" fill="currentColor"><path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm112-260q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Z"/></svg>
            Settings
          </DropdownItem>
          <DropdownItem on:clicked={dropdownItemClickHandler}>
            <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16" fill="currentColor"><path d="m476-80 182-480h84L924-80h-84l-43-122H603L560-80h-84ZM160-200l-56-56 202-202q-35-35-63.5-80T190-640h84q20 39 40 68t48 58q33-33 68.5-92.5T484-720H40v-80h280v-80h80v80h280v80H564q-21 72-63 148t-83 116l96 98-30 82-122-125-202 201Zm468-72h144l-72-204-72 204Z"/></svg>
            Language
          </DropdownItem>
    
        </Dropdown>
    </PreviewCard>
  {:else if component === 'tabs'}
    <PreviewCard rounded outlined>
      <Tabs {tabs} bind:activeTab>

        <div class="tab-panel" class:active={activeTab === 0}>
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sapiente perferendis quod incidunt ullam necessitatibus rerum sunt fugiat et consequatur in at similique molestias nesciunt dolores, impedit modi aliquid! Fuga, vero?
        </div>
        <div class="tab-panel" class:active={activeTab === 1}>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Odit illo quisquam aspernatur voluptatem laborum itaque dolores nemo culpa aliquid. Ipsum at dolorum a nulla nemo fugiat enim repudiandae ut quae!
        </div>
      </Tabs>
    </PreviewCard>
  {:else if component === 'input'}
    <PreviewCard rounded outlined>
      <Input placeholder="Type something" />
    </PreviewCard>
  {:else if component === 'textarea'}
    <PreviewCard rounded outlined>
      <Textarea placeholder="Type something" />
    </PreviewCard>
  {:else}
  <div class="card">
    No preview available for this component.
  </div>
{/if}

<style>
  .btn-groups {
    flex-direction: column;
  }

  .btn-groups, .btn-group {
    display: flex;
    gap: 10px;
  }
  

  .tab-panel {
    display: none;
    width: 100%;
    flex-direction: column;
    gap: 1.75rem;
  }
  .tab-panel.active {
    display: flex;
  }
</style>