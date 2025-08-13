/* global SharedWorker */

const log = (...args) => console.log("[PG]", ...args);

// window.postMessage
const btnPostSelf = document.getElementById("btn-post-self");
const btnPostIframe = document.getElementById("btn-post-iframe");
const btnPostX = document.getElementById("btn-post-xorigin");
const childFrame = document.getElementById("child-frame");

window.addEventListener("message", (e) => {
  log("window.message", e.origin, e.data);
});

btnPostSelf.addEventListener("click", () => {
  window.postMessage({ kind: "self", t: Date.now() }, "*");
});

btnPostIframe.addEventListener("click", () => {
  const target = childFrame?.contentWindow;
  target?.postMessage({ kind: "to-iframe", t: Date.now() }, "*");
});

btnPostX.addEventListener("click", () => {
  // Cross-origin target for message demo only
  const w = window.open("https://example.com", "_blank", "width=400,height=300");
  if (!w) return;
  setTimeout(() => {
    try {
      w.postMessage({ kind: "x-origin", t: Date.now() }, "*");
    } catch {}
  }, 500);
});

// MessageChannel / MessagePort
let channel = null;
let portA = null;
let portB = null;

const btnMcInit = document.getElementById("btn-mc-init");
const btnMcPing = document.getElementById("btn-mc-ping");

btnMcInit.addEventListener("click", () => {
  channel = new MessageChannel();
  portA = channel.port1;
  portB = channel.port2;

  portA.addEventListener("message", (e) => log("portA <-", e.data));
  portB.addEventListener("message", (e) => log("portB <-", e.data));
  portA.start();
  portB.start();

  // Simple handshake
  portA.postMessage({ hello: "from A" });
  portB.postMessage({ hello: "from B" });
});

btnMcPing.addEventListener("click", () => {
  if (!portA || !portB) return;
  portA.postMessage({ ping: "A->B", t: Date.now() });
  portB.postMessage({ ping: "B->A", t: Date.now() });
});

// BroadcastChannel
let bc1 = null;
let bc2 = null;
const btnBcOpen = document.getElementById("btn-bc-open");
const btnBcSend = document.getElementById("btn-bc-send");

btnBcOpen.addEventListener("click", () => {
  bc1 = new BroadcastChannel("mct-demo");
  bc2 = new BroadcastChannel("mct-demo");
  bc1.addEventListener("message", (e) => log("bc1 <-", e.data));
  bc2.addEventListener("message", (e) => log("bc2 <-", e.data));
});

btnBcSend.addEventListener("click", () => {
  if (!bc1 || !bc2) return;
  bc1.postMessage({ from: "bc1", t: Date.now() });
  bc2.postMessage({ from: "bc2", t: Date.now() });
});

// Worker
let worker = null;
const btnWorkerStart = document.getElementById("btn-worker-start");
const btnWorkerPing = document.getElementById("btn-worker-ping");

btnWorkerStart.addEventListener("click", () => {
  if (worker) return;
  worker = new Worker("./worker.js");
  worker.addEventListener("message", (e) => log("worker <-", e.data));
});

btnWorkerPing.addEventListener("click", () => {
  if (!worker) return;
  worker.postMessage({ ping: "hello worker", t: Date.now() });
});

// SharedWorker
let shared = null;
let sharedPort = null;
const btnSharedStart = document.getElementById("btn-shared-start");
const btnSharedPing = document.getElementById("btn-shared-ping");

btnSharedStart.addEventListener("click", () => {
  if (shared) return;
  try {
    shared = new SharedWorker("./shared-worker.js", { name: "mct-shared" });
    sharedPort = shared.port;
    sharedPort.addEventListener("message", (e) => log("shared <-", e.data));
    sharedPort.start();
  } catch (e) {
    log("SharedWorker unsupported?", e.message);
  }
});

btnSharedPing.addEventListener("click", () => {
  if (!sharedPort) return;
  sharedPort.postMessage({ ping: "hello shared", t: Date.now() });
});

// Service Worker
const btnSwRegister = document.getElementById("btn-sw-register");
const btnSwPing = document.getElementById("btn-sw-ping");

btnSwRegister.addEventListener("click", async () => {
  if (!("serviceWorker" in navigator)) {
    return log("No ServiceWorker support");
  }
  const reg = await navigator.serviceWorker.register("./sw.js");
  log("SW registered", reg.scope);
});

btnSwPing.addEventListener("click", async () => {
  if (!("serviceWorker" in navigator)) return;
  const reg = await navigator.serviceWorker.getRegistration();
  const sw = reg?.active || reg?.waiting || reg?.installing;
  if (!sw) return log("No SW active");
  sw.postMessage({ ping: "hello sw", t: Date.now() });
});
