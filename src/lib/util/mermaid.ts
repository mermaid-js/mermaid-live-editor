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
    icons: Record<string, unknown>; // Asumiendo que icons es un objeto JSON con claves de tipo string
  }
  
  // Definir la función correctamente tipada
  async function UrlsToRegisterObject(UrlOb: UrlObject) {
    const { name, url } = UrlOb;
  
    return {
      name,
      loader: async () => {
        const module = await import(url) as IconsModule;
        return module.icons; // Aseguramos que module tiene la propiedad icons
      },
    };
  }
  
  // Tipar la función loadInputs correctamente
  function loadInputs(): UrlObject[] | null {
    const dataElement = document.querySelector('#extension-data');
    if (dataElement) {
      // Parseamos los datos asumiendo que siempre son correctos
      const parsedData = JSON.parse(dataElement.textContent) as UrlObject[];
      return parsedData.length > 0 ? parsedData : null;
    }
    return null;
  }
  
  // La función mermaidRegisterProcess
  async function mermaidRegisterProcess() {
    const inputs = loadInputs();
    if (inputs) {
      await mermaid.registerIconPacks(inputs.map(async (x) => await UrlsToRegisterObject(x)));
    }
}

// Llamar al proceso
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
