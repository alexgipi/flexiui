<script lang="ts">
  import { CSSVars } from "@flexiui/svelte-cssvars";

  const field = {
    label: {
      es: "Variables de CSS",
      en: "CSS variables",
    },
    labels: {
      singular: "CSS variable",
      plural: "CSS variables",
    },
  };

  const varsCSS = `
    --bgColor: #ffffff;
    --bgImage: url(https://hola.com/media/imagen.jpg);
    --textColor: #000000;
    --textOpacity: 100%;
    --padding: 1rem;
    --margin: 1rem 0;
    --buttonRadius: 6px 12px;
    --sectionMargin: 1rem 0;
    --sectionPadding: 2rem;
  `;

  let varsObject: any = null;

  function onUpdate(e: any) {
    const { type, data } = e.detail;
    console.log({ type, data });
  }
</script>

<CSSVars
  id="css-vars"
  editable={false}
  on:update={(e) => onUpdate(e)}
  {varsCSS}
  bind:varsObject
  name="tags"
  labels={field.labels}
  tags={[]}
  ruleSeparator=":"
  separator=";"
  placeholder={"Press enter to add a new CSS Variable"}
  required={false}
  styleConfig={{
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: "0.5rem",
  }}
/>
