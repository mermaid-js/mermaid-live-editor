import elkLayouts from '@mermaid-js/layout-elk';
import zenuml from '@mermaid-js/mermaid-zenuml';
import type { MermaidConfig, RenderResult } from 'mermaid';
import mermaid from 'mermaid';

mermaid.registerLayoutLoaders(elkLayouts);
const init = mermaid.registerExternalDiagrams([zenuml]);





//-----------------------------------------

class ExtensionData {
  name: string;
  url: string;
}

class alias {
  parent: string;
}
class Aliases {
  [x: string] : alias;
}

class Icon {
  body: string;
  width: number;
  height: number;
}

class IconNameData {
  [x: string] : Icon;
}

class Module {
  lastModified: number;
  height: number;
  width: number;
  prefix: string;
  icons: IconNameData;
  aliases: Aliases;
}

class MermaidRegisterObject {
  name: string;
  loader: Function;
}

async function loader_function(url){
  const module = await import(url) as Module;
  return module;
}

async function UrlsToRegisterObject(extension_value: ExtensionData): MermaidRegisterObject {
    const name = extension_value.name// as string;
    const url = extension_value.url// as string;

    const module = await loader_function(url);

    function wrap(){return module.icons;}

    return {
        name: name,
        loader: wrap,
    }
}

function checkIfExtensionIsPresent(){
  //Just to have true false value instead of null document
  if (document.querySelector('#extension-data')){return true;}
  else {return false;}
}

// Tipar la función loadInputs correctamente
async function loadInputs(): MermaidRegisterObject[] | null {
  //waitSync(1000); //Just to try to see if it loads the data
  if (!checkIfExtensionIsPresent()){return null;}

  const dataElement = document.querySelector('#extension-data');
  const extension_data = JSON.parse(dataElement.textContent) as ExtensionData[];

  const data: MermaidRegisterObject[] = [];
  for (const item of extension_data) {
    const mermaidRegister = await UrlsToRegisterObject(item);
    data.push(mermaidRegister);
  }
  //
  
  return data;
}
  
  // La función mermaidRegisterProcess
async function mermaidRegisterProcess() {
    const inputs = await loadInputs();
    if (inputs) {
      mermaid.registerIconPacks(inputs);
    }
}



//-------

export const render = async (
  config: MermaidConfig,
  code: string,
  id: string
): Promise<RenderResult> => {
  await init;

  // Should be able to call this multiple times without any issues.
  mermaid.initialize(config);
  await mermaidRegisterProcess();
  return await mermaid.render(id, code);
};

export const parse = async (code: string): Promise<unknown> => {
  return await mermaid.parse(code);
};
