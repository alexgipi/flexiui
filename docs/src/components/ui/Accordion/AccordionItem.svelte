<script lang="ts">
  import { onMount, tick } from "svelte";

    export let state: 'open' | 'closed' = 'closed';
    export let name: string | null = null;

    let accordionContent: HTMLDivElement;
    let contentHeight: string;
    let contentWidth: string;
    let animateInitially: boolean = false;

    if (animateInitially || state === 'closed') {
        contentHeight = '0';
    }

    function toggleAccordion() {
        state = state === 'open' ? 'closed' : 'open';

        contentHeight = accordionContent.clientHeight + 'px';
        contentWidth = accordionContent.clientWidth + 'px';

        if(state === 'open'){
            setTimeout(() => {
                contentHeight = 'auto';
            }, 300);
        } else if(state === 'closed'){
            setTimeout(() => {
                contentHeight = '0';
            });
        }
    }


  

    onMount(async () => {
        contentHeight = state === 'open' ? accordionContent.clientHeight + 'px' : '0';
            contentWidth = accordionContent?.clientWidth + 'px';
            if (state === 'open') {
                await tick();
                contentHeight = 'auto';
            }
    })
</script>

<div class="fl-accordion-item border-b" data-state={state} data-orientation="vertical">
    <h3 class="fl-accordion-title flex" data-state={state} data-orientation="vertical">
        <button on:click={toggleAccordion} type="button" aria-expanded={state === 'open'} data-state={state} class="fl-accordion-trigger flex flex-1  hover:underline [&[data-state=open]>svg]:rotate-180">
            <slot name="summary"></slot>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-chevron-down"><path d="m6 9 6 6 6-6"></path></svg>
        </button>
    </h3>

    <div 
    class="fl-accordion-content-container" 
    data-state={state} 
    data-orientation="vertical" 
    role="region"
    style="--accordion-content-height: {contentHeight};--accordion-content-width: {contentWidth};"
    >
        <div bind:this={accordionContent}  class="fl-accordion-content">
            <slot></slot>
        </div>
    </div>
</div>

<style>
    /* :root {
        interpolate-size: allow-keywords; (Only in Chrome and Edge) Animate auto and other props.
    } */

    .border-b, .border-y {
        border-bottom-width: 1px;
    }

    .fl-accordion-item {
        background: #eeeeee0f;
        border-radius: 14px;
        overflow: hidden;
    }

    .fl-accordion-title {
        margin: 0;
    }

    .fl-accordion-trigger {
        display: flex;
        flex: 1;
        align-items: center;
        justify-content: space-between;
        padding-block: 1rem;
        padding-inline: 1.5rem;
        background: transparent;
        border: none;
        outline: none;

        .icon-chevron-down {
            transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
            width: 20px;
            width: 20px;
        }

        &[data-state=open] {
            .icon-chevron-down {
                transform: rotate(180deg);
            }
        }
    }

    .fl-accordion-content-container {
        object-fit: inherit;
        height: 0;
        overflow: hidden;
        transition: height 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;

        p {
            margin-top: 0;

            &:last-child {
                margin-bottom: 0;
            }
        }

        &[data-state=closed] {
            height: var(--accordion-content-height);
        }

        &[data-state=open] {
            display: block;
            height: var(--accordion-content-height);
        }
    }

    .fl-accordion-content {
        padding: 0 1.5rem 1.5rem;
        display: flex;
        flex-direction: column;
    }
</style>