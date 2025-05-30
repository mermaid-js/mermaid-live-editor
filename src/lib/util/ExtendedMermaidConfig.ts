import type { MermaidConfig } from 'mermaid';

export interface ExtendedMermaidConfig extends MermaidConfig {
    icons?: {
        [key: string]: string;
    };
}

/*

This file exist just to add iconify support to mermaid live editor.

With this you should be able to add icons form iconify to the config in the live editor like this

{
    "theme": "dark"
    "icons": {
        "name": "npm package"
        .
        .
        .
        ...example next
        "logos": "@iconify-json/logos"
    }
}

*/