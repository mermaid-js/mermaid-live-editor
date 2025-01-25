import elkLayouts from '@mermaid-js/layout-elk';
import zenuml from '@mermaid-js/mermaid-zenuml';
import type { MermaidConfig, RenderResult } from 'mermaid';
import mermaid from 'mermaid';

mermaid.registerLayoutLoaders(elkLayouts);
const init = mermaid.registerExternalDiagrams([zenuml]);

/*
function UrlsToRegisterObject(UrlOb){
    const name = UrlOb.name as string;
    const url = UrlOb.url as string;
    return {
        name: name,
        loader: () => import(url).then((module) => module.icons),
    }
}
*/
//This with chat gpt to pass the type thing, idk about typescript
interface UrlObject {
    name: string;
    url: string;
  }
  
  // Tipo para el módulo importado
  interface IconsModule {
    icons: Record<string, unknown>; // Esto asume que icons es un objeto JSON con claves de tipo string
  }
  
  function UrlsToRegisterObject(UrlOb: UrlObject) {
    const name = UrlOb.name;
    const url = UrlOb.url;
  
    return {
      name: name,
      loader: async () => {
        const module = await import(url);
        // Aseguramos que el módulo tiene la propiedad 'icons' que es un objeto
        return (module as IconsModule).icons;
      },
    };
  }


function loadInputs() {
    if (document.querySelector('#extension-data')){
        return JSON.parse(document.querySelector('#extension-data').textContent);
    }
    else {
        return null;
    }

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
}

function mermaidRegisterProcess(){
    if (loadInputs()){
        mermaid.registerIconPacks(
            loadInputs().map(UrlsToRegisterObject)
        )
    }
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
