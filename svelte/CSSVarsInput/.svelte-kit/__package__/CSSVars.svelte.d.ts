import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        name: any;
        id: any;
        required?: false;
        editable?: boolean;
        styleConfig?: {};
        tags?: any[];
        separator?: string;
        ruleSeparator?: string;
        lang?: string;
        placeholder?: string;
        labels?: any;
        varsCSS?: any;
        varsCSSFixed?: any;
        varsConfigFixed?: {};
        varsConfig?: {};
        varsObjectFixed?: {
            [k: string]: any;
        };
        varsObject?: {
            [x: string]: any;
        };
        getCSS?: () => string;
    };
    events: {
        update: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type CssVarsProps = typeof __propDef.props;
export type CssVarsEvents = typeof __propDef.events;
export type CssVarsSlots = typeof __propDef.slots;
export default class CssVars extends SvelteComponentTyped<CssVarsProps, CssVarsEvents, CssVarsSlots> {
    get required(): false;
    get getCSS(): () => string;
}
export {};
