import elkLayouts from '@mermaid-js/layout-elk';
import zenuml from '@mermaid-js/mermaid-zenuml';
import type { MermaidConfig, RenderResult } from 'mermaid';
import mermaid from 'mermaid';

mermaid.registerLayoutLoaders(elkLayouts);
const init = mermaid.registerExternalDiagrams([zenuml]);

function UrlsToRegisterObject(UrlOb){
    let name = UrlOb.name;
    let url = UrlOb.url;
    return {
        name: name,
        loader: () => import(url).then((module) => module.icons),
    }
}

function loadInputs() {
    const data = JSON.parse(document.getElementById('extension-data').innerText);
    //extension-data doesn't exist by itself, but should exist if the extension is installed
    /*
    data has the shape:
    [
        {
            url: part of url for lazy loading of icons (example: @iconify-json/logos)
            name: 'some name all minus no spaces no numbers, just lower case lyrics'
        }
    ]
    */
    return data;
}

function mermaidRegisterProcess(){
    let inputs = loadInputs();
    if (inputs){
        mermaid.registerIconPacks(
            loadInputs().map(UrlsToRegisterObject)
        )
    }
    return undefined;
}

mermaidRegisterProcess();



export const render = async (
  config: MermaidConfig,
  code: string,
  id: string
): Promise<RenderResult> => {
  await init;

  // Should be able to call this multiple times without any issues.
  mermaid.initialize(config);
  return await mermaid.render(id, code);
};

export const parse = async (code: string): Promise<unknown> => {
  return await mermaid.parse(code);
};
