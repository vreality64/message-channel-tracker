self.addEventListener("message", (e) => {
  self.postMessage({ workerEcho: e.data, at: Date.now() });
});
