/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
const isValidGist = (files: any): boolean => {
	return 'diagram.mmd' in files;
};

const getFileContent = async (file: any): Promise<string> => {
	if (file.truncated) {
		return await (await fetch(file.raw_url)).text();
	}
	return file.content;
};

export const getGistData = async (gistURL: string): Promise<{ code: string; config?: string }> => {
	const gistID = gistURL.split('/').pop();
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const { files } = await (await fetch(`https://api.github.com/gists/${gistID}`)).json();

	if (isValidGist(files)) {
		const code = await getFileContent(files['diagram.mmd']);
		if (!('config.json' in files)) {
			return { code };
		}
		const config = await getFileContent(files['config.json']);
		return { config, code };
	} else {
		throw 'Invalid gist provided';
	}
};
