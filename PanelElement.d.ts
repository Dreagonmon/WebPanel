
export interface TextElement {
    type: "text";
    text: string;
    /** render as header | default false */
    header?: boolean;
}

export interface ImageElement {
    type: "img";
    src: string;
    /** use iframe to overcome cors | default false */
    iframe?: boolean;
}

export interface InputElement {
    type: "input";
    id: string;
    /** input type | default "text" */
    subtype?: "text" | "password" | "textarea";
    hint?: string;
    value?: string;
}

export interface ButtonsElement {
    type: "buttons";
    ids: [string];
    labels: [string];
    /** if the button is disabled | default false */
    disabled?: [boolean] | boolean;
    /** should we close the page after click | default false */
    close?: [boolean] | boolean;
}

export type PanelElement = TextElement | ImageElement | InputElement | ButtonsElement
