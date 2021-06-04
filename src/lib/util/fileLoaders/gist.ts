/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { MermaidData } from '$lib/types';

const codeFileName = 'code.mmd';
const configFileName = 'config.json';

const isValidGist = (files: any): boolean => {
	return codeFileName in files;
};

const getFileContent = async (file: any): Promise<string> => {
	if (file.truncated) {
		return await (await fetch(file.raw_url)).text();
	}
	return file.content;
};

export const getGistData = async (gistURL: string): Promise<MermaidData> => {
	const gistID = gistURL.split('/').pop();
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const { files } = await (await fetch(`https://api.github.com/gists/${gistID}`)).json();

	if (isValidGist(files)) {
		const code = await getFileContent(files[codeFileName]);
		if (!(configFileName in files)) {
			return { code };
		}
		const config = await getFileContent(files[configFileName]);
		return { config, code };
	} else {
		throw 'Invalid gist provided';
	}
};
