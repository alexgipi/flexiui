<script lang="ts">
    import { Quote } from '@flexiui/svelte-quote';
    import { TagsInput }from '@flexiui/svelte-tags-input';
    import { CSSVars } from '@flexiui/svelte-cssvars';

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
</script>

<!-- <TagsInput 
name="tags" 
field={field}
labels={field.labels}
tags={[]} 
min={1} 
max={3} 
allowDuplicates={false} 
bidimensional={true}
bidimensionalSeparator='->' 
placeholder={'Presiona enter para agregar una nueva etiqueta'} 
required={false} /> -->

<!-- <CSSVars 

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
    required={false} /> -->
    
<Quote
  className="my-quote"
  id="flexi-quote"
  bgColor="transparent"
  editable={true}
  bind:value={content}
  on:focus={handleFocus}
  on:keydown={handleKeyDown}
  on:input={handleInput}
>
</Quote>
