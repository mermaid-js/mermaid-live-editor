import type { Mermaid } from 'mermaid';

let mer: Mermaid;
export const getMermaid = async (): Promise<Mermaid> => {
	if (!mer) {
		mer = await import('mermaid');
	}
	return mer;
};
