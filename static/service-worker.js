self.addEventListener('fetch', (e) => {
	// @ts-ignore Will add types later
	console.log(`[Service Worker] Fetched resource ${e.request.url}`);
});
