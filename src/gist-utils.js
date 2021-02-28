import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  userAgent: 'mermaid-live-editor',
  baseUrl: 'https://api.github.com',
});

const isValidGist = (files) => {
  return 'config.json' in files && 'mermaid.diagram' in files;
};

const getFileContent = async (file) => {
  if (file.truncated) {
    return await (await fetch(file.raw_url)).text();
  }
  return file.content;
};

export const getMermaidData = async (gist_id) => {
  const gist = await octokit.gists.get({
    gist_id,
  });
  const files = gist.data.files;
  if (isValidGist(files)) {
    const config = await getFileContent(files['config.json']);
    const code = await getFileContent(files['mermaid.diagram']);
    return { config, code };
  }
};
