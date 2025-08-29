/* global SharedWorker */

interface MCTStyles {
  badgeBase: string;
  arrowOut: string;
  arrowIn: string;
  arrowPort: string;
  meta: string;
}

interface MCTData {
  data?: unknown;
  origin?: string;
  message?: unknown;
  posted?: unknown;
  targetOrigin?: string;
  port?: string;
  ch?: number;
  sent?: boolean;
  scope?: string;
  name?: string;
  handshake?: boolean;
  ping?: boolean;
  demo?: boolean;
}

const uiLogRoot = document.getElementById("console-log") as HTMLElement;
const log = (): void => {};

// Detect MCT dynamically to avoid stale value when tracker loads later
function isMctInstalled(): boolean {
  return !!(window as any).__MCT_INSTALLED__;
}

const mctStyles: MCTStyles = {
  badgeBase:
    "display:inline-block;padding:1px 5px;border-radius:10px;background:#3b82f6;color:white;font-weight:600;",
  arrowOut:
    "color:#22c55e;font-weight:700;background:#ffffff;border:1px solid #e5e7eb;padding:0 4px;border-radius:6px;",
  arrowIn:
    "color:#ef4444;font-weight:700;background:#ffffff;border:1px solid #e5e7eb;padding:0 4px;border-radius:6px;",
  arrowPort:
    "color:#a855f7;font-weight:700;background:#ffffff;border:1px solid #e5e7eb;padding:0 4px;border-radius:6px;",
  meta: "color:#64748b;",
};

function mctGroup(op: string): string[] {
  const iso = new Date().toISOString();
  if (op === "window.postMessage")
    return [
      "%cMCT",
      mctStyles.badgeBase,
      "%c→",
      mctStyles.arrowOut,
      "%cwindow.postMessage",
      mctStyles.meta,
      `%c${iso}`,
      mctStyles.meta,
    ];
  if (op === "window.message")
    return [
      "%cMCT",
      mctStyles.badgeBase,
      "%c←",
      mctStyles.arrowIn,
      "%cwindow.message",
      mctStyles.meta,
      `%c${iso}`,
      mctStyles.meta,
    ];
  if (op === "MessagePort.postMessage")
    return [
      "%cMCT",
      mctStyles.badgeBase,
      "%c↔",
      mctStyles.arrowPort,
      "%cMessagePort.postMessage",
      mctStyles.meta,
      `%c${iso}`,
      mctStyles.meta,
    ];
  if (op === "MessagePort.onmessage")
    return [
      "%cMCT",
      mctStyles.badgeBase,
      "%c←",
      mctStyles.arrowIn,
      "%cMessagePort.message",
      mctStyles.meta,
      `%c${iso}`,
      mctStyles.meta,
    ];
  if (op === "BroadcastChannel.postMessage")
    return [
      "%cMCT",
      mctStyles.badgeBase,
      "%c↔",
      mctStyles.arrowPort,
      "%cBroadcastChannel.postMessage",
      mctStyles.meta,
      `%c${iso}`,
      mctStyles.meta,
    ];
  if (op === "BroadcastChannel.onmessage")
    return [
      "%cMCT",
      mctStyles.badgeBase,
      "%c←",
      mctStyles.arrowIn,
      "%cBroadcastChannel.message",
      mctStyles.meta,
      `%c${iso}`,
      mctStyles.meta,
    ];
  if (op === "Worker.postMessage")
    return [
      "%cMCT",
      mctStyles.badgeBase,
      "%c→",
      mctStyles.arrowOut,
      "%cWorker.postMessage",
      mctStyles.meta,
      `%c${iso}`,
      mctStyles.meta,
    ];
  if (op === "Worker.onmessage")
    return [
      "%cMCT",
      mctStyles.badgeBase,
      "%c←",
      mctStyles.arrowIn,
      "%cWorker.message",
      mctStyles.meta,
      `%c${iso}`,
      mctStyles.meta,
    ];
  if (op === "SharedWorker.postMessage")
    return [
      "%cMCT",
      mctStyles.badgeBase,
      "%c→",
      mctStyles.arrowOut,
      "%cSharedWorker.postMessage",
      mctStyles.meta,
      `%c${iso}`,
      mctStyles.meta,
    ];
  if (op === "SharedWorker.onmessage")
    return [
      "%cMCT",
      mctStyles.badgeBase,
      "%c←",
      mctStyles.arrowIn,
      "%cSharedWorker.message",
      mctStyles.meta,
      `%c${iso}`,
      mctStyles.meta,
    ];
  if (op === "ServiceWorker.register")
    return [
      "%cMCT",
      mctStyles.badgeBase,
      "%cnew",
      mctStyles.meta,
      "%cServiceWorker.register",
      mctStyles.meta,
      `%c${iso}`,
      mctStyles.meta,
    ];
  if (op === "ServiceWorker.postMessage")
    return [
      "%cMCT",
      mctStyles.badgeBase,
      "%c→",
      mctStyles.arrowOut,
      "%cServiceWorker.postMessage",
      mctStyles.meta,
      `%c${iso}`,
      mctStyles.meta,
    ];
  if (op === "ServiceWorker.message")
    return [
      "%cMCT",
      mctStyles.badgeBase,
      "%c←",
      mctStyles.arrowIn,
      "%cServiceWorker.message",
      mctStyles.meta,
      `%c${iso}`,
      mctStyles.meta,
    ];
  return ["%cMCT", mctStyles.badgeBase, `%c${iso}`, mctStyles.meta];
}

function mctOpenGroup(op: string): void {
  const pairs = mctGroup(op);
  const fmtParts: string[] = [];
  const params: string[] = [];
  for (let i = 0; i < pairs.length; i += 2) {
    const rawFmt = String(pairs[i] || "");
    const style = String(pairs[i + 1] || "");
    fmtParts.push(rawFmt);
    params.push(style);
    const hasNext = i + 2 < pairs.length;
    if (hasNext) {
      const nextRawFmt = String(pairs[i + 2] || "");
      const nextIsArrow = /[←→↔]/.test(nextRawFmt);
      if (!nextIsArrow) {
        fmtParts.push("%c ");
        params.push("");
      }
    }
  }
  const fmt = fmtParts.join("");
  // eslint-disable-next-line no-console
  console.groupCollapsed(fmt, ...params);
}

function mctCloseGroup(): void {
  // eslint-disable-next-line no-console
  (console.groupEnd as (() => void))?.();
}

const mctDemoLog = (op: string, data?: MCTData): void => {
  if (isMctInstalled()) return;
  try {
    mctOpenGroup(op);
    switch (op) {
      case "window.message":
        if (data?.data !== undefined) console.log("data:", data.data);
        if (data?.origin !== undefined) console.log("origin:", data.origin);
        break;
      case "window.postMessage":
        console.log("message:", data?.message ?? { posted: data?.posted ?? true });
        console.log("targetOrigin:", data?.targetOrigin ?? "*");
        break;
      case "MessagePort.onmessage":
        if (data?.data !== undefined) console.log("data:", data.data);
        break;
      case "MessagePort.postMessage":
        console.log("message:", data?.message ?? { ping: true });
        break;
      case "BroadcastChannel.onmessage":
        if (data?.name !== undefined) console.log("name:", data.name);
        if (data?.data !== undefined) console.log("data:", data.data);
        break;
      case "BroadcastChannel.postMessage":
        console.log("message:", data?.message ?? { sent: true });
        break;
      case "Worker.onmessage":
        if (data !== undefined) console.log("data:", data);
        break;
      case "Worker.postMessage":
        console.log("message:", data?.message ?? { ping: true });
        break;
      case "SharedWorker.onmessage":
        if (data !== undefined) console.log("data:", data);
        break;
      case "SharedWorker.postMessage":
        console.log("message:", data?.message ?? { ping: true });
        break;
      case "ServiceWorker.register":
        if (data?.scope) console.log("scope:", data.scope);
        break;
      case "ServiceWorker.postMessage":
        console.log("message:", data?.message ?? { ping: true });
        break;
      case "ServiceWorker.message":
        if (data?.data !== undefined) console.log("data:", data.data);
        break;
      default:
        if (data !== undefined) console.log("data:", data);
    }
  } finally {
    mctCloseGroup();
  }
};

document.getElementById("clear-log")?.addEventListener("click", () => {
  uiLogRoot.innerHTML = "";
});

// Theme toggle handled globally by docs/assets/site.js

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
  const groupBodies: HTMLElement[] = [];
  const groupStack: boolean[] = [];
  const isMctArgs = (args: unknown[]): boolean =>
    args.some(
      (a) => typeof a === "string" && /(\[?MCT\]?|Message\s*Channel\s*Tracker|MCT:)/i.test(a),
    );
  const append = (parts: unknown[]): void => {
    const root =
      mctDepth > 0 && groupBodies.length ? groupBodies[groupBodies.length - 1] : uiLogRoot;
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
        if ((window as any).__MCT_PRETTY__) {
          container.appendChild(renderJson(item));
        } else {
          const p = document.createElement("p");
          p.className = "log-line";
          try {
            p.textContent = JSON.stringify(item);
          } catch {
            p.textContent = String(item);
          }
          container.appendChild(p);
        }
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

  function renderJson(value: unknown): HTMLElement {
    const pre = document.createElement("pre");
    pre.className = "json-block";
    pre.innerHTML = syntaxHighlightJSON(value, 2);
    return pre;
  }

  function syntaxHighlightJSON(value: unknown, space = 2): string {
    const json = JSON.stringify(value, null, space)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return json
      .replace(/\n/g, "\n")
      .replace(/(\s*)(\".*?\")(?=\s*:)/g, (m, s, k) => `${s}<span class=\"json-key\">${k}</span>`) // keys
      .replace(/:\s*\"([^\"]*)\"/g, (m, v) => `: <span class=\"json-string\">"${v}"</span>`) // strings
      .replace(/:\s*(\d+\.?\d*)/g, (m, v) => `: <span class=\"json-number\">${v}</span>`) // numbers
      .replace(/:\s*(true|false)/g, (m, v) => `: <span class=\"json-bool\">${v}</span>`) // bools
      .replace(/:\s*(null)/g, (m, v) => `: <span class=\"json-null\">${v}</span>`); // null
  }

  function renderStyledLine(fmt: string, rest: unknown[]): { line: HTMLElement; consumed: number } {
    // Parses tokens in order: %c (style), %s (string), %o (object)
    // Uses a single cursor into rest, matching native console formatting order
    let cursor = 0;
    let currentStyle = "";
    const container = document.createElement("div");
    const p = document.createElement("p");
    p.className = "log-line";
    container.appendChild(p);

    const pushText = (text: string): void => {
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
        currentStyle = String(rest[cursor++] ?? "");
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

  function renderStyledInline(fmt: string, rest: unknown[]): { node: DocumentFragment; consumed: number } {
    // Similar to renderStyledLine but returns an inline fragment for headers
    let cursor = 0;
    let currentStyle = "";
    const frag = document.createDocumentFragment();
    const pushText = (text: string): void => {
      if (!text) return;
      const span = document.createElement("span");
      span.textContent = text;
      if (currentStyle) span.setAttribute("style", String(currentStyle));
      frag.appendChild(span);
    };
    let i = 0;
    while (i < fmt.length) {
      const percent = fmt.indexOf("%", i);
      if (percent === -1 || percent === fmt.length - 1) {
        pushText(fmt.slice(i));
        break;
      }
      if (percent > i) pushText(fmt.slice(i, percent));
      const token = fmt[percent + 1];
      if (token === "c") {
        currentStyle = String(rest[cursor++] ?? "");
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
        pushText(typeof val === "string" ? val : JSON.stringify(val));
        i = percent + 2;
        continue;
      }
      pushText(fmt.slice(percent, percent + 2));
      i = percent + 2;
    }
    return { node: frag, consumed: cursor };
  }
  console.log = (...args: unknown[]): void => {
    if (mctDepth > 0 || isMctArgs(args)) append(args);
    return (orig.log as (...args: unknown[]) => void).apply(console, args);
  };
  console.info = (...args: unknown[]): void => {
    if (mctDepth > 0 || isMctArgs(args)) append(args);
    return (orig.info as (...args: unknown[]) => void).apply(console, args);
  };
  console.warn = (...args: unknown[]): void => {
    if (mctDepth > 0 || isMctArgs(args)) append(["[warn]", ...args]);
    return (orig.warn as (...args: unknown[]) => void).apply(console, args);
  };
  console.error = (...args: unknown[]): void => {
    if (mctDepth > 0 || isMctArgs(args)) append(["[error]", ...args]);
    return (orig.error as (...args: unknown[]) => void).apply(console, args);
  };
  function createGroup(titleParts: unknown[], collapsed: boolean): { body: HTMLElement } {
    const group = document.createElement("div");
    group.className = `group${collapsed ? " collapsed" : ""}`;
    const header = document.createElement("div");
    header.className = "group-header";
    const arrow = document.createElement("span");
    arrow.className = "group-arrow";
    arrow.textContent = "▾";
    const title = document.createElement("span");
    title.className = "group-title";
    // If first argument is a styled format, render styled header using its styles
    if (
      Array.isArray(titleParts) &&
      typeof titleParts[0] === "string" &&
      /%[cso]/.test(titleParts[0])
    ) {
      const { node } = renderStyledInline(String(titleParts[0]), titleParts.slice(1));
      title.replaceChildren(node);
    } else {
      const joined = titleParts.map((p) => (typeof p === "string" ? p : "")).join(" ");
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

  if (orig.group)
    console.group = (...args: unknown[]): void => {
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
        const created = createGroup(args, false);
        groupBodies.push(created.body);
        indent = 1;
        mctDepth = 1;
      }
      groupStack.push(isTopLevelMct);
      return (orig.group as (...args: unknown[]) => void)(...args);
    };
  if (orig.groupCollapsed)
    console.groupCollapsed = (...args: unknown[]): void => {
      const isTopLevelMct = isMctArgs(args);
      if (!isTopLevelMct && mctDepth === 0 && groupBodies.length) {
        groupBodies.length = 0;
        indent = 0;
      }
      if (isTopLevelMct) {
        groupBodies.length = 0;
        indent = 0;
        mctDepth = 0;
        const created = createGroup(args, true);
        groupBodies.push(created.body);
        indent = 1;
        mctDepth = 1;
      }
      groupStack.push(isTopLevelMct);
      return (orig.groupCollapsed as (...args: unknown[]) => void)(...args);
    };
  if (orig.groupEnd)
    console.groupEnd = (): void => {
      const isTopLevelMct = !!groupStack.pop();
      if (isTopLevelMct && mctDepth > 0) {
        if (groupBodies.length) groupBodies.pop();
        indent = Math.max(0, indent - 1);
        mctDepth = Math.max(0, mctDepth - 1);
      }
      return (orig.groupEnd as () => void)();
    };
})();

// Emit a demo line so users immediately see output without clicking
mctDemoLog("ready", { demo: true });

// window.postMessage
const btnPostSelf = document.getElementById("btn-post-self") as HTMLButtonElement;
const btnPostIframe = document.getElementById("btn-post-iframe") as HTMLButtonElement;
const btnPostX = document.getElementById("btn-post-xorigin") as HTMLButtonElement;
const childFrame = document.getElementById("child-frame") as HTMLIFrameElement;

window.addEventListener("message", (e: MessageEvent) => {
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
let channel: MessageChannel | null = null;
let portA: MessagePort | null = null;
let portB: MessagePort | null = null;

const btnMcInit = document.getElementById("btn-mc-init") as HTMLButtonElement;
const btnMcPing = document.getElementById("btn-mc-ping") as HTMLButtonElement;

btnMcInit.addEventListener("click", () => {
  channel = new MessageChannel();
  portA = channel.port1;
  portB = channel.port2;

  // mirror suppressed for port events
  portA.addEventListener("message", (e: MessageEvent) =>
    mctDemoLog("MessagePort.onmessage", { port: "A", data: e.data }),
  );
  portB.addEventListener("message", (e: MessageEvent) =>
    mctDemoLog("MessagePort.onmessage", { port: "B", data: e.data }),
  );
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
let bc1: BroadcastChannel | null = null;
let bc2: BroadcastChannel | null = null;
const btnBcOpen = document.getElementById("btn-bc-open") as HTMLButtonElement;
const btnBcSend = document.getElementById("btn-bc-send") as HTMLButtonElement;

btnBcOpen.addEventListener("click", () => {
  bc1 = new BroadcastChannel("mct-demo");
  bc2 = new BroadcastChannel("mct-demo");
  // mirror suppressed for bc message handlers
  bc1.addEventListener("message", (e: MessageEvent) =>
    mctDemoLog("BroadcastChannel.onmessage", { ch: 1, data: e.data }),
  );
  bc2.addEventListener("message", (e: MessageEvent) =>
    mctDemoLog("BroadcastChannel.onmessage", { ch: 2, data: e.data }),
  );
});

btnBcSend.addEventListener("click", () => {
  if (!bc1 || !bc2) return;
  bc1.postMessage({ from: "bc1", t: Date.now() });
  bc2.postMessage({ from: "bc2", t: Date.now() });
  // mirror suppressed
  mctDemoLog("BroadcastChannel.postMessage", { sent: true });
});

// Worker
let worker: Worker | null = null;
const btnWorkerStart = document.getElementById("btn-worker-start") as HTMLButtonElement;
const btnWorkerPing = document.getElementById("btn-worker-ping") as HTMLButtonElement;

btnWorkerStart.addEventListener("click", () => {
  if (worker) return;
  worker = new Worker("./worker.js");
  // mirror suppressed
  worker.addEventListener("message", (e: MessageEvent) => mctDemoLog("Worker.onmessage", e.data));
});

btnWorkerPing.addEventListener("click", () => {
  if (!worker) return;
  worker.postMessage({ ping: "hello worker", t: Date.now() });
  // mirror suppressed
  mctDemoLog("Worker.postMessage", { ping: true });
});

// SharedWorker
let shared: SharedWorker | null = null;
let sharedPort: MessagePort | null = null;
const btnSharedStart = document.getElementById("btn-shared-start") as HTMLButtonElement;
const btnSharedPing = document.getElementById("btn-shared-ping") as HTMLButtonElement;

btnSharedStart.addEventListener("click", () => {
  if (shared) return;
  try {
    shared = new SharedWorker("./shared-worker.js", { name: "mct-shared" });
    sharedPort = shared.port;
    // mirror suppressed
    sharedPort.addEventListener("message", (e: MessageEvent) => mctDemoLog("SharedWorker.onmessage", e.data));
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
const btnSwRegister = document.getElementById("btn-sw-register") as HTMLButtonElement;
const btnSwPing = document.getElementById("btn-sw-ping") as HTMLButtonElement;

btnSwRegister.addEventListener("click", async () => {
  if (!("serviceWorker" in navigator)) {
    return;
  }
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
