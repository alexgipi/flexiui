<script lang="ts">
  import Undo from "./action-buttons/Undo.svelte";
  import Redo from "./action-buttons/Redo.svelte";
  import ClearFormatting from "./action-buttons/ClearFormatting.svelte";
  import ClearNodes from "./action-buttons/ClearNodes.svelte";

  import HeadingsDropdownBtn from "./dropdown-buttons/HeadingsDropdownBtn.svelte";
  import ListsDropdownBtn from "./dropdown-buttons/ListsDropdownBtn.svelte";
  import LineHeightDropdownBtn from "./dropdown-buttons/LineHeightDropdownBtn.svelte";

  import CodeBlock from "./action-buttons/nodes/CodeBlock.svelte";
  import Blockquote from "./action-buttons/nodes/Blockquote.svelte";
  import HardBreakBtn from "./action-buttons/nodes/HardBreakBtn.svelte";
  import HorizontalRule from "./action-buttons/nodes/HorizontalRule.svelte";
  import Image from "./action-buttons/nodes/Image.svelte";
  import Audio from "./action-buttons/nodes/Audio.svelte";
  import InlineMath from "./action-buttons/nodes/InlineMath.svelte";
  import MediaGridBtn from "./action-buttons/nodes/MediaGridBtn.svelte";
  import Table from "./action-buttons/nodes/Table.svelte";

  import TextAlign from "./action-buttons/marks/TextAlign.svelte";
  import FontSize from "./action-buttons/marks/FontSize.svelte";
  import SpecialBox from "./action-buttons/marks/SpecialBox.svelte";
  import Bold from "./action-buttons/marks/Bold.svelte";
  import CodeMarkBtn from "./action-buttons/marks/CodeMarkBtn.svelte";
  import Italic from "./action-buttons/marks/Italic.svelte";
  import LinkBtn from "./action-buttons/marks/LinkBtn.svelte";
  import Strike from "./action-buttons/marks/Strike.svelte";
  import Underline from "./action-buttons/marks/Underline.svelte";
  import TextColorDropdownBtn from "./dropdown-buttons/TextColorDropdownBtn.svelte";
  import HighlightDropdownBtn from "./dropdown-buttons/HighlightDropdownBtn.svelte";
  
  let {
    type,
    editor,
    nodeCounters,
    nodesLimit,
    currentNodeCount,
    accentSoft,
    fontSize,
    onToggleDropdown,
  } = $props();

  function handleClick(event: MouseEvent, name: string) {
    onToggleDropdown?.(event, name);
  }
</script>

<!-- [] Todo: Mejorar el render para evitar tanto if. 
    A lo mejor crear un "diccionario/mapa" renderizar según el type.
-->
{#if type === "undo"}
  <Undo {editor} />
{:else if type === "redo"}
  <Redo {editor} />
{:else if type === "headings"}
  <HeadingsDropdownBtn
    {editor}
    {accentSoft}
    onToggleDropdown={(e: MouseEvent, dropdownName: string) => {
      handleClick(e, dropdownName);
    }}
  />
{:else if type === "lists"}
  <ListsDropdownBtn
    {editor}
    {accentSoft}
    onToggleDropdown={(e: MouseEvent, dropdownName: string) => {
      handleClick(e, dropdownName);
    }}
  />
{:else if type === "codeBlock"}
  <CodeBlock {editor} accenSoft={accentSoft} />
{:else if type === "blockquote"}
  <Blockquote {editor} accenSoft={accentSoft} />
{:else if type === "fontSize"}
  <FontSize {editor} accenSoft={accentSoft} {fontSize} />
{:else if type === "lineHeight"}
  <LineHeightDropdownBtn
    onToggleDropdown={(e: MouseEvent, dropdownName: string) => {
      handleClick(e, dropdownName);
    }}
  />
{:else if type === "horizontalRule"}
  <HorizontalRule {editor} />
{:else if type === "hardBreak"}
  <HardBreakBtn {editor} />
{:else if type === "inlineMath"}
  <InlineMath {editor} />
{:else if type === "image"}
  <Image {editor} {nodesLimit} {currentNodeCount} accenSoft={accentSoft} />
{:else if type === "audio"}
  <Audio {editor} {nodesLimit} {currentNodeCount} accenSoft={accentSoft} />
{:else if type === "mediaGrid"}
  <MediaGridBtn
    {editor}
    {nodesLimit}
    {currentNodeCount}
    accenSoft={accentSoft}
  />
{:else if type === "table"}
  <Table {editor} {nodesLimit} {currentNodeCount} accenSoft={accentSoft} />
{:else if type === "textAlignLeft"}
  <TextAlign position="left" {editor} accenSoft={accentSoft} />
{:else if type === "textAlignCenter"}
  <TextAlign position="center" {editor} accenSoft={accentSoft} />
{:else if type === "textAlignRight"}
  <TextAlign position="right" {editor} accenSoft={accentSoft} />
{:else if type === "clearFormatting"}
  <ClearFormatting {editor} />
{:else if type === "clearNodes"}
  <ClearNodes {editor} />

{:else if type === "bold"}
  <Bold {editor} accenSoft={accentSoft} />
{:else if type === "italic"}
  <Italic {editor} accenSoft={accentSoft} />
{:else if type === "underline"}
  <Underline {editor} accenSoft={accentSoft} />
{:else if type === "strike"}
  <Strike {editor} accenSoft={accentSoft} />
{:else if type === "code"}
  <CodeMarkBtn {editor} accenSoft={accentSoft} />
{:else if type === "link"}
  <LinkBtn {editor} accenSoft={accentSoft} />
{:else if type === "specialBox"}
  <SpecialBox {editor} accentSoft={accentSoft} />

{:else if type === "highlight"}
  <HighlightDropdownBtn
    onToggleDropdown={(e, dropdownName) => {
      handleClick(e, dropdownName);
    }}
  />
{:else if type === "textColor"}
  <TextColorDropdownBtn
    {editor}
    onToggleDropdown={(e, dropdownName) => {
      handleClick(e, dropdownName);
    }}
  />

{:else if type === "hardBreak"}
  <HardBreakBtn {editor} />
{:else}
  <p>Render {type}</p>
{/if}
