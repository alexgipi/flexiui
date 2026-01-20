import { writable } from "svelte/store";

export const activeAudioId = writable<string | null>(null);

export const audioAttributes = writable<any>({});