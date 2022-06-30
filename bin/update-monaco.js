import fs from 'fs';
import path from 'path';

// parse monaco version out of package.json
const packageJson = JSON.parse(fs.readFileSync('package.json'));
const monacoVersion = packageJson.dependencies['monaco-editor'].substring(1);

// fetch monaco sri info from cdnjs api
const cdnjsAPIResp = await fetch(
	`https://api.cdnjs.com/libraries/monaco-editor/${monacoVersion}?fields=sri`
);
if (cdnjsAPIResp.ok) {
	const respJson = await cdnjsAPIResp.json();

	let appHtml = fs.readFileSync(path.join('src', 'app.html'), 'utf8');
	// update monaco version of every asset in app.html
	appHtml = appHtml.replaceAll(/[0-9.]+\/min\/vs/g, `${monacoVersion}/min/vs`);
	// update sri integrity value for each asset
	for (let monacoAssetMatch of appHtml.matchAll(/min\/vs\/[^"]+/g)) {
		let monacoAsset = monacoAssetMatch[0];
		appHtml = appHtml.replace(
			new RegExp(
				monacoAsset.replaceAll('/', '\\/').replaceAll('.', '\\.') + '" integrity=".+"',
				'g'
			),
			`${monacoAsset}" integrity="${respJson.sri[monacoAsset]}"`
		);
	}
	fs.writeFileSync(path.join('src', 'app.html'), appHtml);
} else {
	throw Error('Unable to fetch monaco sri data from cdnjs api.');
}
