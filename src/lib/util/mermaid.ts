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

function UrlsToRegisterObject(extension_value: ExtensionData): MermaidRegisterObject {
    const name = extension_value.name as string;
    const url = extension_value.url as string;

    async function loader_function(url){
      const module = await import(url) as Module;
      return module.icons;
    }

    async function wrap(){await loader_function(url);}

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
function loadInputs(): MermaidRegisterObject[] | null {
  //waitSync(1000); //Just to try to see if it loads the data
  if (!checkIfExtensionIsPresent()){return null;}

  const dataElement = document.querySelector('#extension-data');
  const extension_data = JSON.parse(dataElement.textContent) as ExtensionData[];

  let data: MermaidRegisterObject[] = [];
  for (let i = 0; i < extension_data.length; i++) {
    const mermaidRegister = UrlsToRegisterObject(extension_data[i]);
    data.push(mermaidRegister);
  }
  //
  
  return data;
}
  
  // La función mermaidRegisterProcess
async function mermaidRegisterProcess() {
    const inputs = loadInputs();
    if (inputs) {
      await mermaid.registerIconPacks(inputs);
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
