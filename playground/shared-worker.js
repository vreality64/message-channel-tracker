const connections = new Set();

self.addEventListener('connect', (e) => {
  const port = e.ports[0];
  connections.add(port);
  port.addEventListener('message', (ev) => {
    port.postMessage({ sharedEcho: ev.data, at: Date.now() });
    // broadcast to others
    for (const p of connections) {
      if (p !== port) {
        try { p.postMessage({ broadcast: ev.data, at: Date.now() }); } catch {}
      }
    }
  });
  port.start();
});
