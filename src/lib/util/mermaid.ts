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

interface Dummy {
  parent: string
}

interface DummyParent {
  [x:string]: Dummy[]
}

interface IconType {
  body: string;
  width: number;
  height: number;
}

interface IconKeyValue {
  [x: string]: IconType
}

interface IconsModule {
  aliases: DummyParent;
  height: number;
  icons: IconKeyValue[];
  lastModified: number;
  prefix: string;
  width: number;
}


  //This with chat gpt to pass the type thing, idk about typescript
interface UrlObject {
  name: string;
  url: IconsModule;
}
  
  // Definir la función correctamente tipada
function UrlsToRegisterObject(UrlOb: UrlObject) {
    const { name, url } = UrlOb;

    console.log('------');
    console.log(name);
    console.log(url);
    console.log(typeof url);
    console.log('------');
    const iconsM = url as IconsModule;
    const icons = iconsM.icons as IconKeyValue[];

    console.log('---- AAAAAAA -----');
    console.log(iconsM);
    console.log(icons);
    console.log('---- AAAAAAA -----');

    
    return {
      name,
      loader: () => {
        return icons; // Aseguramos que module tiene la propiedad icons
      },
    };
  }
  
  /*
  function waitSync(milliseconds) {
    const start = Date.now();
    while (Date.now() - start < milliseconds) {
      // Bucle vacío para bloquear el tiempo
    }
  }
  */

  // Tipar la función loadInputs correctamente
  function loadInputs(): UrlObject[] | null {
    //waitSync(1000); //Just to try to see if it loads the data
    const dataElement = document.querySelector('#extension-data');
    
    if (dataElement) {
      // Parseamos los datos asumiendo que siempre son correctos
      const datastring = dataElement.textContent as string;
      
      while (datastring === 'default string for extension check'){
        //Loop till data loads if extension is present
      }
      const parsedData = JSON.parse(datastring) as UrlObject[];
      console.log('--- PARSED DATA ---');
      console.log(parsedData);
      console.log('--- PARSED DATA ---');
      if (parsedData){
        return parsedData.length > 0 ? parsedData : null;
      }
      else {return null;}
    }
    return null;
  }
  
  // La función mermaidRegisterProcess
function mermaidRegisterProcess() {
    const inputs = loadInputs();
    if (inputs) {
      mermaid.registerIconPacks(inputs.map((x) => UrlsToRegisterObject(x)));
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
