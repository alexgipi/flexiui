/// <reference types="svelte" />
import type { Props } from './RichText.svelte';

declare module "*.svelte" {
  interface $$Props extends Props {}
}