import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        name: any;
        field: any;
        tags?: any[];
        min: any;
        max: any;
        separator?: any;
        allowDuplicates?: boolean;
        bidimensional?: boolean;
        bidimensionalSeparator?: any;
        lang?: string;
        placeholder?: string;
        required?: boolean;
        labels?: any;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type TagsInputProps = typeof __propDef.props;
export type TagsInputEvents = typeof __propDef.events;
export type TagsInputSlots = typeof __propDef.slots;
export default class TagsInput extends SvelteComponentTyped<TagsInputProps, TagsInputEvents, TagsInputSlots> {
}
export {};
