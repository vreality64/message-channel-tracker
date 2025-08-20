/* global SharedWorker */

const uiLogRoot = document.getElementById("console-log");
const log = (tag, payload) => {
  // mirror only for dev; UI console is filled by MCT logs capture below
  // eslint-disable-next-line no-console
  console.log("[PG]", tag, payload);
};

document.getElementById("clear-log")?.addEventListener("click", () => {
  uiLogRoot.innerHTML = "";
});

document.getElementById("theme-toggle")?.addEventListener("click", () => {
  const root = document.documentElement;
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
});

// Capture only MCT-tagged console logs and mirror to UI console
(function setupMctConsoleCapture() {
  const orig = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    group: console.group?.bind(console),
    groupCollapsed: console.groupCollapsed?.bind(console),
    groupEnd: console.groupEnd?.bind(console),
  };
  let indent = 0;
  const isMctArgs = (args) => args.some((a) => typeof a === "string" && /(\bMCT\b|Message\s*Channel\s*Tracker|MCT:)/i.test(a));
  const append = (parts) => {
    const line = document.createElement("p");
    line.className = "log-line";
    const time = new Date().toLocaleTimeString();
    const text = parts.map((p) => {
      if (typeof p === "string") return p;
      try { return JSON.stringify(p); } catch { return String(p); }
    }).join(" ");
    line.textContent = `${"  ".repeat(indent)}${time} — ${text}`;
    uiLogRoot.appendChild(line);
    uiLogRoot.scrollTop = uiLogRoot.scrollHeight;
  };
  console.log = (...args) => { if (isMctArgs(args)) append(args); return orig.log.apply(console, args); };
  console.info = (...args) => { if (isMctArgs(args)) append(args); return orig.info.apply(console, args); };
  console.warn = (...args) => { if (isMctArgs(args)) append(["[warn]", ...args]); return orig.warn.apply(console, args); };
  console.error = (...args) => { if (isMctArgs(args)) append(["[error]", ...args]); return orig.error.apply(console, args); };
  if (orig.group) console.group = (...args) => { if (isMctArgs(args)) append(["[group]", ...args]); indent++; return orig.group(...args); };
  if (orig.groupCollapsed) console.groupCollapsed = (...args) => { if (isMctArgs(args)) append(["[group]", ...args]); indent++; return orig.groupCollapsed(...args); };
  if (orig.groupEnd) console.groupEnd = () => { indent = Math.max(0, indent - 1); return orig.groupEnd(); };
})();

// window.postMessage
const btnPostSelf = document.getElementById("btn-post-self");
const btnPostIframe = document.getElementById("btn-post-iframe");
const btnPostX = document.getElementById("btn-post-xorigin");
const childFrame = document.getElementById("child-frame");

window.addEventListener("message", (e) => {
  log("window", { origin: e.origin, data: e.data });
});

btnPostSelf.addEventListener("click", () => {
  window.postMessage({ kind: "self", t: Date.now() }, "*");
  log("window", { posted: "self" });
});

btnPostIframe.addEventListener("click", () => {
  const target = childFrame?.contentWindow;
  target?.postMessage({ kind: "to-iframe", t: Date.now() }, "*");
  log("window", { posted: "to-iframe" });
});

btnPostX.addEventListener("click", () => {
  // Cross-origin target for message demo only
  const w = window.open("https://example.com", "_blank", "width=400,height=300");
  if (!w) return;
  setTimeout(() => {
    try {
      w.postMessage({ kind: "x-origin", t: Date.now() }, "*");
      log("window", { posted: "x-origin" });
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

  portA.addEventListener("message", (e) => log("mc", { port: "A", data: e.data }));
  portB.addEventListener("message", (e) => log("mc", { port: "B", data: e.data }));
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
  log("mc", { ping: true });
});

// BroadcastChannel
let bc1 = null;
let bc2 = null;
const btnBcOpen = document.getElementById("btn-bc-open");
const btnBcSend = document.getElementById("btn-bc-send");

btnBcOpen.addEventListener("click", () => {
  bc1 = new BroadcastChannel("mct-demo");
  bc2 = new BroadcastChannel("mct-demo");
  bc1.addEventListener("message", (e) => log("bc", { ch: 1, data: e.data }));
  bc2.addEventListener("message", (e) => log("bc", { ch: 2, data: e.data }));
});

btnBcSend.addEventListener("click", () => {
  if (!bc1 || !bc2) return;
  bc1.postMessage({ from: "bc1", t: Date.now() });
  bc2.postMessage({ from: "bc2", t: Date.now() });
  log("bc", { sent: true });
});

// Worker
let worker = null;
const btnWorkerStart = document.getElementById("btn-worker-start");
const btnWorkerPing = document.getElementById("btn-worker-ping");

btnWorkerStart.addEventListener("click", () => {
  if (worker) return;
  worker = new Worker("./worker.js");
  worker.addEventListener("message", (e) => log("worker", e.data));
});

btnWorkerPing.addEventListener("click", () => {
  if (!worker) return;
  worker.postMessage({ ping: "hello worker", t: Date.now() });
  log("worker", { ping: true });
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
    sharedPort.addEventListener("message", (e) => log("mc", { shared: true, data: e.data }));
    sharedPort.start();
  } catch (e) {
    log("SharedWorker unsupported?", e.message);
  }
});

btnSharedPing.addEventListener("click", () => {
  if (!sharedPort) return;
  sharedPort.postMessage({ ping: "hello shared", t: Date.now() });
  log("mc", { sharedPing: true });
});

// Service Worker
const btnSwRegister = document.getElementById("btn-sw-register");
const btnSwPing = document.getElementById("btn-sw-ping");

btnSwRegister.addEventListener("click", async () => {
  if (!("serviceWorker" in navigator)) {
    return log("No ServiceWorker support");
  }
  const reg = await navigator.serviceWorker.register("./sw.js");
  log("sw", { registered: reg.scope });
});

btnSwPing.addEventListener("click", async () => {
  if (!("serviceWorker" in navigator)) return;
  const reg = await navigator.serviceWorker.getRegistration();
  const sw = reg?.active || reg?.waiting || reg?.installing;
  if (!sw) return log("sw", { noActive: true });
  sw.postMessage({ ping: "hello sw", t: Date.now() });
  log("sw", { ping: true });
});
