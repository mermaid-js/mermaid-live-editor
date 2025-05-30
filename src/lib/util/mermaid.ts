import elkLayouts from '@mermaid-js/layout-elk';
import zenuml from '@mermaid-js/mermaid-zenuml';
import type { RenderResult } from 'mermaid';
import type { ExtendedMermaidConfig } from './ExtendedMermaidConfig';
import mermaid from 'mermaid';

mermaid.registerLayoutLoaders(elkLayouts);
const init = mermaid.registerExternalDiagrams([zenuml]);


//--------------------------------------

class MermaidIconsPack {
  [x: string]: string
}
/*
Mermaid Icons Pack

refers to a dict of the shape
{
  name: package
}

where each name is the name that you want to use for the icon pack
and package is the icon npm package

must be the package. For example

@iconify-json/mdi-light

*/

class Alias {
  parent: string;
}
class Aliases {
  [x: string] : Alias;
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

type WrapFunction = () => Module; 

class MermaidRegisterObject {
  name: string;
  loader: WrapFunction;
}

async function loader_function(url: string): Promise<Module> {
  const response = await fetch(url);  // Type: Respones
  const module = await response.json() as Module;  // `json()` type is `any` we assign it to Module, which is the expected structure.
  return module;
}

async function UrlsToRegisterObject(name: string, package_: string): Promise<MermaidRegisterObject> {
    
    const start = 'https://unpkg.com/';
    const end =  '/icons.json';
    const url = start + package_ + end;

    const module = await loader_function(url);

    function wrap(): Module {return module;}

    return {
        name: name,
        loader: wrap,
    }
}

async function mermaidRegisterProcess(config: ExtendedMermaidConfig): Promise<void> {
  const icon_packs: MermaidRegisterObject[] = [];
  for (const name in config.icons){
    const pack_name = config.icons[name];
    const icon_pack = await UrlsToRegisterObject(name, pack_name);
    icon_packs.push(icon_pack);
  }
  if (icon_packs){
    mermaid.registerIconPacks(icon_packs);
  }
}


//--------------------------------------


export const render = async (
  config: ExtendedMermaidConfig,
  code: string,
  id: string
): Promise<RenderResult> => {
  await init;

  // Should be able to call this multiple times without any issues.
  mermaid.initialize(config);
  await mermaidRegisterProcess(config);
  return await mermaid.render(id, code);
};

export const parse = async (code: string) => {
  return await mermaid.parse(code);
};

export const standardizeDiagramType = (diagramType: string) => {
  switch (diagramType) {
    case 'class':
    case 'classDiagram': {
      return 'classDiagram';
    }
    case 'graph':
    case 'flowchart':
    case 'flowchart-elk':
    case 'flowchart-v2': {
      return 'flowchart';
    }
    default: {
      return diagramType;
    }
  }
};
