import fs from 'fs';
import path from 'path';
import { parse } from 'node-html-parser';
import prettier from 'prettier';

// parse monaco version out of package.json
const packageJson = JSON.parse(fs.readFileSync('package.json'));
const monacoVersion = packageJson.dependencies['monaco-editor'].replace('^', '');

// fetch monaco sri info from cdnjs api
const cdnjsAPIResp = await fetch(
  `https://api.cdnjs.com/libraries/monaco-editor/${monacoVersion}?fields=sri`
);
if (cdnjsAPIResp.ok) {
  const respJson = await cdnjsAPIResp.json();
  const htmlPath = path.join('src', 'app.html');
  const appHtml = fs
    .readFileSync(htmlPath, 'utf8')
    // update monaco version of every asset in app.html
    .replaceAll(/[0-9.]+\/min\/vs/g, `${monacoVersion}/min/vs`);
  const root = parse(appHtml);
  const updateIntegrity = (tag, attr) => {
    for (const node of root
      .getElementsByTagName(tag)
      .filter((node) => node.getAttribute(attr)?.includes('monaco-editor'))) {
      const file = node.getAttribute(attr).split(`${monacoVersion}/`)[1];
      node.setAttribute('integrity', respJson.sri[file]);
    }
  };

  updateIntegrity('script', 'src');
  updateIntegrity('link', 'href');

  fs.writeFileSync(
    htmlPath,
    prettier.format(root.toString(), {
      singleQuote: false,
      parser: 'html',
      bracketSameLine: true,
      useTabs: true
    })
  );
} else {
  throw Error('Unable to fetch monaco sri data from cdnjs api.');
}
