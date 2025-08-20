/* global SharedWorker */

const uiLogRoot = document.getElementById("console-log");
const log = () => {};

const hasMct = Boolean(window.__MCT_INSTALLED__);
const mctDemoLog = (kind, payload) => {
  if (hasMct) return; // real MCT will print its own logs
  try {
    // Mimic MCT style: group and key/value lines
    // eslint-disable-next-line no-console
    console.groupCollapsed("[MCT]", new Date().toISOString());
    // eslint-disable-next-line no-console
    console.log("kind:", kind);
    if (payload !== undefined) {
      // eslint-disable-next-line no-console
      console.log("data:", payload);
    }
  } finally {
    // eslint-disable-next-line no-console
    console.groupEnd?.();
  }
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
  let mctDepth = 0;
  const groupBodies = [];
  const groupStack = [];
  const isMctArgs = (args) => args.some((a) => typeof a === "string" && /(\[?MCT\]?|Message\s*Channel\s*Tracker|MCT:)/i.test(a));
  const append = (parts) => {
    const root = mctDepth > 0 && groupBodies.length ? groupBodies[groupBodies.length - 1] : uiLogRoot;
    const container = document.createElement("div");
    const time = new Date().toLocaleTimeString();
    const prefix = document.createElement("p");
    prefix.className = "log-line";
    prefix.textContent = `${"  ".repeat(indent)}${time} —`;
    container.appendChild(prefix);

    // Support styled console logs with %c segments
    const remaining = parts;
    let idx = 0;
    while (idx < remaining.length) {
      const item = remaining[idx];
      if (typeof item === "string" && /%[cso]/.test(item)) {
        const { line, consumed } = renderStyledLine(item, remaining.slice(idx + 1));
        container.appendChild(line);
        idx += 1 + consumed;
        continue;
      }
      if (typeof item === "string") {
        // Render simple keys like "event:" "data:" with color separator
        const m = item.match(/^(\w+):$/);
        if (m) {
          const p = document.createElement("p");
          p.className = "log-line";
          const k = document.createElement("span");
          k.className = "kv-key";
          k.textContent = m[1];
          const sep = document.createElement("span");
          sep.className = "kv-sep";
          sep.textContent = ":";
          p.append(k, sep);
          container.appendChild(p);
          idx += 1;
          continue;
        }
        const p = document.createElement("p");
        p.className = "log-line";
        const cleaned = item.includes("%c") ? item.replace(/%c/g, "") : item;
        p.textContent = cleaned;
        container.appendChild(p);
        idx += 1;
      } else if (typeof item === "object" && item != null) {
        container.appendChild(renderJson(item));
        idx += 1;
      } else {
        const p = document.createElement("p");
        p.className = "log-line";
        p.textContent = String(item);
        container.appendChild(p);
        idx += 1;
      }
    }

    root.appendChild(container);
    root.scrollTop = root.scrollHeight;
  };

  function renderJson(value) {
    const pre = document.createElement("pre");
    pre.className = "json-block";
    pre.innerHTML = syntaxHighlightJSON(value, 2);
    return pre;
  }

  function syntaxHighlightJSON(value, space = 2) {
    const json = JSON.stringify(value, null, space)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return json
      .replace(/\n/g, "\n")
      .replace(/(\s*)(\".*?\")(?=\s*:)/g, (m, s, k) => `${s}<span class=\"json-key\">${k}</span>`) // keys
      .replace(/:\s*\"([^\"]*)\"/g, (m, v) => `: <span class=\"json-string\">"${v}"</span>`) // strings
      .replace(/:\s*(\d+\.?\d*)/g, (m, v) => `: <span class=\"json-number\">${v}</span>`) // numbers
      .replace(/:\s*(true|false)/g, (m, v) => `: <span class=\"json-bool\">${v}</span>`) // bools
      .replace(/:\s*(null)/g, (m, v) => `: <span class=\"json-null\">${v}</span>`); // null
  }

  function renderStyledLine(fmt, rest) {
    // Parses tokens in order: %c (style), %s (string), %o (object)
    // Uses a single cursor into rest, matching native console formatting order
    let cursor = 0;
    let currentStyle = "";
    const container = document.createElement("div");
    const p = document.createElement("p");
    p.className = "log-line";
    container.appendChild(p);

    const pushText = (text) => {
      if (!text) return;
      const span = document.createElement("span");
      span.textContent = text;
      if (currentStyle) span.setAttribute("style", String(currentStyle));
      p.appendChild(span);
    };

    let i = 0;
    while (i < fmt.length) {
      const percent = fmt.indexOf("%", i);
      if (percent === -1 || percent === fmt.length - 1) {
        pushText(fmt.slice(i));
        break;
      }
      // flush literal up to token
      if (percent > i) pushText(fmt.slice(i, percent));
      const token = fmt[percent + 1];
      if (token === "c") {
        // style switch
        currentStyle = rest[cursor++] ?? "";
        i = percent + 2;
        continue;
      }
      if (token === "s") {
        const val = rest[cursor++];
        pushText(String(val ?? ""));
        i = percent + 2;
        continue;
      }
      if (token === "o") {
        const val = rest[cursor++];
        try {
          const pre = document.createElement("pre");
          pre.className = "json-block";
          pre.innerHTML = syntaxHighlightJSON(val, 2);
          container.appendChild(pre);
        } catch {
          pushText(String(val));
        }
        i = percent + 2;
        continue;
      }
      // unknown token, print as-is
      pushText(fmt.slice(percent, percent + 2));
      i = percent + 2;
    }
    return { line: container, consumed: cursor };
  }
  console.log = (...args) => { if (mctDepth > 0 || isMctArgs(args)) append(args); return orig.log.apply(console, args); };
  console.info = (...args) => { if (mctDepth > 0 || isMctArgs(args)) append(args); return orig.info.apply(console, args); };
  console.warn = (...args) => { if (mctDepth > 0 || isMctArgs(args)) append(["[warn]", ...args]); return orig.warn.apply(console, args); };
  console.error = (...args) => { if (mctDepth > 0 || isMctArgs(args)) append(["[error]", ...args]); return orig.error.apply(console, args); };
  function createGroup(titleParts, collapsed) {
    const group = document.createElement("div");
    group.className = `group${collapsed ? " collapsed" : ""}`;
    const header = document.createElement("div");
    header.className = "group-header";
    const arrow = document.createElement("span");
    arrow.className = "group-arrow";
    arrow.textContent = "▾";
    const title = document.createElement("span");
    title.className = "group-title";
    const joined = titleParts.map((p) => (typeof p === "string" ? p : "")).join(" ");
    if (/\bMCT\b/i.test(joined)) {
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = "MCT";
      const meta = document.createElement("span");
      meta.className = "meta";
      const iso = joined.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)?.[0] || new Date().toLocaleTimeString();
      meta.textContent = ` — ${iso}`;
      title.replaceChildren(badge, meta);
    } else {
      title.textContent = joined;
    }
    header.append(arrow, title);
    const body = document.createElement("div");
    body.className = "group-body";
    group.append(header, body);
    header.addEventListener("click", () => group.classList.toggle("collapsed"));
    const parent = groupBodies.length ? groupBodies[groupBodies.length - 1] : uiLogRoot;
    parent.appendChild(group);
    parent.scrollTop = parent.scrollHeight;
    return { body };
  }

  if (orig.group) console.group = (...args) => {
    const isTopLevelMct = isMctArgs(args);
    if (!isTopLevelMct && mctDepth === 0 && groupBodies.length) {
      // Defensive: ensure no residual group body captures root-level logs
      groupBodies.length = 0;
      indent = 0;
    }
    if (isTopLevelMct) {
      // Always isolate each new MCT message into its own top-level UI group
      groupBodies.length = 0;
      indent = 0;
      mctDepth = 0;
      const created = createGroup(["[group]", ...args], false);
      groupBodies.push(created.body);
      indent = 1;
      mctDepth = 1;
    }
    groupStack.push(isTopLevelMct);
    return orig.group(...args);
  };
  if (orig.groupCollapsed) console.groupCollapsed = (...args) => {
    const isTopLevelMct = isMctArgs(args);
    if (!isTopLevelMct && mctDepth === 0 && groupBodies.length) {
      groupBodies.length = 0;
      indent = 0;
    }
    if (isTopLevelMct) {
      groupBodies.length = 0;
      indent = 0;
      mctDepth = 0;
      const created = createGroup(["[group]", ...args], true);
      groupBodies.push(created.body);
      indent = 1;
      mctDepth = 1;
    }
    groupStack.push(isTopLevelMct);
    return orig.groupCollapsed(...args);
  };
  if (orig.groupEnd) console.groupEnd = () => {
    const isTopLevelMct = Boolean(groupStack.pop());
    if (isTopLevelMct && mctDepth > 0) {
      if (groupBodies.length) groupBodies.pop();
      indent = Math.max(0, indent - 1);
      mctDepth = Math.max(0, mctDepth - 1);
    }
    return orig.groupEnd();
  };
})();

// Emit a demo line so users immediately see output without clicking
mctDemoLog("ready", { demo: true });

// window.postMessage
const btnPostSelf = document.getElementById("btn-post-self");
const btnPostIframe = document.getElementById("btn-post-iframe");
const btnPostX = document.getElementById("btn-post-xorigin");
const childFrame = document.getElementById("child-frame");

window.addEventListener("message", (e) => {
  // mirror suppressed
  mctDemoLog("window.message", { origin: e.origin, data: e.data });
});

btnPostSelf.addEventListener("click", () => {
  window.postMessage({ kind: "self", t: Date.now() }, "*");
  // mirror suppressed
  mctDemoLog("window.postMessage", { posted: "self" });
});

btnPostIframe.addEventListener("click", () => {
  const target = childFrame?.contentWindow;
  target?.postMessage({ kind: "to-iframe", t: Date.now() }, "*");
  // mirror suppressed
  mctDemoLog("window.postMessage", { posted: "to-iframe" });
});

btnPostX.addEventListener("click", () => {
  // Cross-origin target for message demo only
  const w = window.open("https://example.com", "_blank", "width=400,height=300");
  if (!w) return;
  setTimeout(() => {
    try {
      w.postMessage({ kind: "x-origin", t: Date.now() }, "*");
      // mirror suppressed
      mctDemoLog("window.postMessage", { posted: "x-origin" });
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

  // mirror suppressed for port events
  portA.addEventListener("message", (e) => mctDemoLog("MessagePort.onmessage", { port: "A", data: e.data }));
  portB.addEventListener("message", (e) => mctDemoLog("MessagePort.onmessage", { port: "B", data: e.data }));
  portA.start();
  portB.start();

  // Simple handshake
  portA.postMessage({ hello: "from A" });
  portB.postMessage({ hello: "from B" });
  mctDemoLog("MessageChannel", { handshake: true });
});

btnMcPing.addEventListener("click", () => {
  if (!portA || !portB) return;
  portA.postMessage({ ping: "A->B", t: Date.now() });
  portB.postMessage({ ping: "B->A", t: Date.now() });
  // mirror suppressed
  mctDemoLog("MessagePort.postMessage", { ping: true });
});

// BroadcastChannel
let bc1 = null;
let bc2 = null;
const btnBcOpen = document.getElementById("btn-bc-open");
const btnBcSend = document.getElementById("btn-bc-send");

btnBcOpen.addEventListener("click", () => {
  bc1 = new BroadcastChannel("mct-demo");
  bc2 = new BroadcastChannel("mct-demo");
  // mirror suppressed for bc message handlers
  bc1.addEventListener("message", (e) => mctDemoLog("BroadcastChannel.onmessage", { ch: 1, data: e.data }));
  bc2.addEventListener("message", (e) => mctDemoLog("BroadcastChannel.onmessage", { ch: 2, data: e.data }));
});

btnBcSend.addEventListener("click", () => {
  if (!bc1 || !bc2) return;
  bc1.postMessage({ from: "bc1", t: Date.now() });
  bc2.postMessage({ from: "bc2", t: Date.now() });
  // mirror suppressed
  mctDemoLog("BroadcastChannel.postMessage", { sent: true });
});

// Worker
let worker = null;
const btnWorkerStart = document.getElementById("btn-worker-start");
const btnWorkerPing = document.getElementById("btn-worker-ping");

btnWorkerStart.addEventListener("click", () => {
  if (worker) return;
  worker = new Worker("./worker.js");
  // mirror suppressed
  worker.addEventListener("message", (e) => mctDemoLog("Worker.onmessage", e.data));
});

btnWorkerPing.addEventListener("click", () => {
  if (!worker) return;
  worker.postMessage({ ping: "hello worker", t: Date.now() });
  // mirror suppressed
  mctDemoLog("Worker.postMessage", { ping: true });
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
    // mirror suppressed
    sharedPort.addEventListener("message", (e) => mctDemoLog("SharedWorker.onmessage", e.data));
    sharedPort.start();
  } catch (e) {
    // mirror suppressed
  }
});

btnSharedPing.addEventListener("click", () => {
  if (!sharedPort) return;
  sharedPort.postMessage({ ping: "hello shared", t: Date.now() });
  // mirror suppressed
  mctDemoLog("SharedWorker.postMessage", { ping: true });
});

// Service Worker
const btnSwRegister = document.getElementById("btn-sw-register");
const btnSwPing = document.getElementById("btn-sw-ping");

btnSwRegister.addEventListener("click", async () => {
  if (!("serviceWorker" in navigator)) { return; }
  const reg = await navigator.serviceWorker.register("./sw.js");
  // mirror suppressed
  mctDemoLog("ServiceWorker.register", { scope: reg.scope });
});

btnSwPing.addEventListener("click", async () => {
  if (!("serviceWorker" in navigator)) return;
  const reg = await navigator.serviceWorker.getRegistration();
  const sw = reg?.active || reg?.waiting || reg?.installing;
  if (!sw) return;
  sw.postMessage({ ping: "hello sw", t: Date.now() });
  // mirror suppressed
  mctDemoLog("ServiceWorker.postMessage", { ping: true });
});
