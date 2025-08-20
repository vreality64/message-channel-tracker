self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  self.clients.claim();
});

self.addEventListener("message", (e) => {
  // Echo back to the specific client if possible
  const data = e.data;
  e.waitUntil(
    (async () => {
      try {
        const allClients = await self.clients.matchAll({
          includeUncontrolled: true,
          type: "window",
        });
        for (const client of allClients) {
          if (client.id === e.source?.id) {
            client.postMessage({ swEcho: data, at: Date.now() });
            return;
          }
        }
        // Fallback: broadcast
        for (const client of allClients) {
          client.postMessage({ swBroadcast: data, at: Date.now() });
        }
      } catch (_) {}
    })(),
  );
});
