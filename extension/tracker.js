(() => {
  // Guard to avoid double-installation
  if (window.__MCT_INSTALLED__) return;
  Object.defineProperty(window, "__MCT_INSTALLED__", {
    value: true,
    configurable: false,
    enumerable: false,
    writable: false,
  });

  // State management
  const state = {
    enabled: true,
    prettyJson: false,
  };

  // Receive enable/disable messages from the content script
  window.addEventListener(
    "message",
    (event) => {
      try {
        const data = event?.data;
        if (!data || typeof data !== "object") return;
        // Accept control messages regardless of event.source to be robust across environments
        if (data.type === "MCT:SET_ENABLED") {
          state.enabled = Boolean(data.enabled);
          logInternalInfo(state.enabled ? "Tracking enabled" : "Tracking disabled");
          return;
        }
        if (data.type === "MCT:SET_PRETTY_JSON") {
          state.prettyJson = Boolean(data.pretty);
          logInternalInfo(state.prettyJson ? "Pretty JSON: On" : "Pretty JSON: Off");
          return;
        }
      } catch (_) {
        // Swallow
      }
    },
    true,
  );

  // Utility: timestamp
  function nowIso() {
    try {
      return new Date().toISOString();
    } catch (_) {
      return String(Date.now());
    }
  }

  // Utility: safe stringify preview for titles
  function preview(value) {
    try {
      if (typeof value === "string") {
        return value.length > 80 ? `${value.slice(0, 77)}...` : value;
      }
      if (value === null) return "null";
      if (typeof value === "undefined") return "undefined";
      if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint")
        return String(value);
      if (typeof value === "symbol") return String(value);
      if (Array.isArray(value)) return `Array(${value.length})`;
      if (value instanceof MessagePort) return "MessagePort";
      if (value?.constructor?.name) return value.constructor.name;
      return Object.prototype.toString.call(value);
    } catch (_) {
      return typeof value;
    }
  }

  // Console formatting helpers
  const styles = {
    badgeBase:
      "display:inline-block;padding:1px 5px;border-radius:10px;background:#3b82f6;color:white;font-weight:600;",
    badgeWarn:
      "display:inline-block;padding:1px 5px;border-radius:10px;background:#f59e0b;color:black;font-weight:700;",
    // Improve arrow visibility with a light chip background (no leading gap)
    arrowOut:
      "color:#22c55e;font-weight:700;background:#ffffff;border:1px solid #e5e7eb;padding:0 4px 0 4px;border-radius:6px;",
    arrowIn:
      "color:#ef4444;font-weight:700;background:#ffffff;border:1px solid #e5e7eb;padding:0 4px 0 4px;border-radius:6px;",
    arrowPort:
      "color:#a855f7;font-weight:700;background:#ffffff;border:1px solid #e5e7eb;padding:0 4px 0 4px;border-radius:6px;",
    meta: "color:#64748b;",
    labelEmph: "font-weight:900;color:#0ea5e9;",
    jsonKey: "color:#93c5fd;",
    jsonString: "color:#86efac;",
    jsonNumber: "color:#fca5a5;",
    jsonBool: "color:#fcd34d;",
    jsonNull: "color:#c4b5fd;",
  };

  // MessageChannel/MessagePort metadata to clarify directionality
  let nextChannelId = 1;
  const portMeta = new WeakMap(); // MessagePort -> { channelId: number, label: 'p1' | 'p2' }
  function setPortMeta(port, channelId, label) {
    try {
      portMeta.set(port, { channelId, label });
    } catch (_) {}
  }
  function getPortMeta(port) {
    try {
      return portMeta.get(port) || null;
    } catch (_) {
      return null;
    }
  }
  function ensurePortMeta(port) {
    try {
      let meta = portMeta.get(port);
      if (!meta) {
        const id = nextChannelId++;
        meta = { channelId: id, label: "p1" };
        portMeta.set(port, meta);
      }
      return meta;
    } catch (_) {
      return null;
    }
  }

  function logStyledJson(value) {
    try {
      const json = JSON.stringify(value, null, 2);
      const segs = [];
      let i = 0;
      const len = json.length;
      while (i < len) {
        const ch = json[i];
        // string
        if (ch === '"') {
          let j = i + 1;
          let esc = false;
          while (j < len) {
            const c = json[j];
            if (esc) {
              esc = false;
              j++;
              continue;
            }
            if (c === '\\') {
              esc = true;
              j++;
              continue;
            }
            if (c === '"') break;
            j++;
          }
          const strToken = json.slice(i, Math.min(j + 1, len));
          // lookahead to see if this is a key (next non-ws is ':')
          let k = j + 1;
          while (k < len && /\s/.test(json[k])) k++;
          const isKey = k < len && json[k] === ':';
          segs.push([strToken, isKey ? styles.jsonKey : styles.jsonString]);
          i = Math.min(j + 1, len);
          continue;
        }
        // number
        if (/[0-9\-]/.test(ch)) {
          let j = i + 1;
          while (j < len && /[0-9eE+\-.]/.test(json[j])) j++;
          segs.push([json.slice(i, j), styles.jsonNumber]);
          i = j;
          continue;
        }
        // true/false/null
        if (json.startsWith('true', i)) {
          segs.push(['true', styles.jsonBool]);
          i += 4;
          continue;
        }
        if (json.startsWith('false', i)) {
          segs.push(['false', styles.jsonBool]);
          i += 5;
          continue;
        }
        if (json.startsWith('null', i)) {
          segs.push(['null', styles.jsonNull]);
          i += 4;
          continue;
        }
        // punctuation or whitespace/default
        segs.push([json[i], styles.meta]);
        i++;
      }
      // build console format
      const fmtParts = [];
      const params = [];
      for (const [text, style] of segs) {
        fmtParts.push(`%c${text}`);
        params.push(style);
      }
      // eslint-disable-next-line no-console
      console.log(fmtParts.join(''), ...params);
    } catch {
      // eslint-disable-next-line no-console
      console.log(value);
    }
  }

  function logData(label, value) {
    try {
      if (state.prettyJson) {
        // If the payload is a JSON string, parse it first
        if (typeof value === "string") {
          try {
            const parsed = JSON.parse(value);
            if (parsed && typeof parsed === "object") {
              console.log(label);
              logStyledJson(parsed);
              return;
            }
          } catch (_) {
            // not a JSON string; fall through
          }
        }
        // If the payload is an object/array, pretty print directly
        if (value && typeof value === "object") {
          try {
            console.log(label);
            logStyledJson(value);
            return;
          } catch (_) {
            // fall through to default
          }
        }
      }
      // Default: log inline
      console.log(label, value);
    } catch (_) {}
  }

  // titlePairs must be an array of [fmtWithPercentC, styleString] pairs
  // Insert a neutral space AFTER tokens except when the next token is an arrow.
  // This keeps no space before arrows while preventing background bleed.
  function logGroupCollapsedStyled(titlePairs) {
    try {
      const fmtParts = [];
      const params = [];
      for (let i = 0; i < titlePairs.length; i++) {
        const pair = titlePairs[i] || ["", ""];
        const rawFmt = String(pair[0] || "");
        const style = String(pair[1] || "");
        fmtParts.push(rawFmt);
        params.push(style);

        const hasNext = i < titlePairs.length - 1;
        if (hasNext) {
          const nextRawFmt = String(titlePairs[i + 1]?.[0] || "");
          const nextIsArrow = /[←→↔]/.test(nextRawFmt);
          if (!nextIsArrow) {
            fmtParts.push("%c ");
            params.push("");
          }
        }
      }
      const fmt = fmtParts.join("");
      console.groupCollapsed(fmt, ...params);
    } catch (_) {
      try {
        console.groupCollapsed("[MCT]", nowIso());
      } catch (_) {}
    }
  }
  function endGroup() {
    try {
      console.groupEnd();
    } catch (_) {}
  }
  function logInternalInfo(message) {
    try {
      console.log("%cMCT%c — %c%s", styles.badgeBase, "", styles.meta, message);
    } catch (_) {}
  }

  // Attach a capturing listener to log inbound window messages non-invasively
  window.addEventListener(
    "message",
    (event) => {
      if (!state.enabled) return;
      try {
        // Ignore our own control messages
        const t = event?.data?.type;
        if (typeof t === "string" && t.startsWith("MCT:")) return;
        const titlePairs = [
          ["%cMCT", styles.badgeBase],
          ["%c←", styles.arrowIn],
          ["%cwindow.message", styles.meta],
          [`%c${nowIso()}`, styles.meta],
        ];
        logGroupCollapsedStyled(titlePairs);
        if (event?.data !== undefined) logData("data:", event.data);
        endGroup();
      } catch (_) {}
    },
    true,
  );

  // Wrap window.postMessage
  (function wrapPostMessage() {
    const original = window.postMessage;
    if (!original || original.__MCT_WRAPPED__) return;

    function wrappedPostMessage(message, targetOrigin, transfer) {
      if (state.enabled) {
        try {
          const titlePairs = [
            ["%cMCT", styles.badgeBase],
            ["%c→%c", styles.arrowOut],
            ["%cwindow.postMessage", styles.meta],
            [`%c${nowIso()}`, styles.meta],
          ];
          logGroupCollapsedStyled(titlePairs);
          logData("message:", message);
          endGroup();
        } catch (_) {}
      }
      return original.apply(this, [message, targetOrigin, transfer]);
    }

    try {
      Object.defineProperty(wrappedPostMessage, "name", { value: "postMessage" });
    } catch (_) {}
    Object.defineProperty(wrappedPostMessage, "__MCT_WRAPPED__", { value: true });

    try {
      Object.defineProperty(window, "postMessage", {
        configurable: true,
        writable: true,
        value: wrappedPostMessage,
      });
    } catch (_) {
      // If defineProperty fails, fall back to direct assignment
      try {
        window.postMessage = wrappedPostMessage;
      } catch (_) {}
    }
  })();

  // MessagePort instrumentation (covers MessageChannel ports and ports from worker/bc)
  (function wrapMessagePort() {
    const PortProto = window.MessagePort?.prototype;
    if (!PortProto) return;
    if (PortProto.postMessage?.__MCT_WRAPPED__) return;

    const originalPostMessage = PortProto.postMessage;

    function wrappedPortPostMessage(message, transfer) {
      if (state.enabled) {
        try {
          const metaInfo = getPortMeta(this) || ensurePortMeta(this);
          const other = metaInfo ? (metaInfo.label === "p1" ? "p2" : "p1") : null;
          const titlePairs = [
            ["%cMCT", styles.badgeBase],
            ["%c↔", styles.arrowPort],
            [`%cMessagePort.postMessage (ch#${metaInfo?.channelId ?? "?"} `, styles.meta],
            [`%c${metaInfo?.label ?? "p?"}`, styles.labelEmph],
            ["%c\u2192", styles.meta],
            [`%c${other ?? "p?"}`, styles.labelEmph],
            ["%c)", styles.meta],
            [`%c${nowIso()}`, styles.meta],
          ];
          logGroupCollapsedStyled(titlePairs);
          logData("message:", message);
          endGroup();
        } catch (_) {}
      }
      return originalPostMessage.apply(this, [message, transfer]);
    }

    try {
      Object.defineProperty(wrappedPortPostMessage, "name", { value: "postMessage" });
    } catch (_) {}
    Object.defineProperty(wrappedPortPostMessage, "__MCT_WRAPPED__", { value: true });

    try {
      Object.defineProperty(PortProto, "postMessage", {
        configurable: true,
        writable: true,
        value: wrappedPortPostMessage,
      });
    } catch (_) {
      try {
        PortProto.postMessage = wrappedPortPostMessage;
      } catch (_) {}
    }

    // Capture incoming messages on ports without interfering
    try {
      const origAddEventListener = PortProto.addEventListener;
      const listenerSet = new WeakMap();
      const captureLogger = (event) => {
        if (!state.enabled) return;
        try {
          const metaInfo = getPortMeta(this) || ensurePortMeta(this);
          const other = metaInfo ? (metaInfo.label === "p1" ? "p2" : "p1") : null;
          const titlePairs = [
            ["%cMCT", styles.badgeBase],
            ["%c←", styles.arrowIn],
            [`%cMessagePort.message (ch#${metaInfo?.channelId ?? "?"} `, styles.meta],
            [`%c${other ?? "p?"}`, styles.labelEmph],
            ["%c\u2192", styles.meta],
            [`%c${metaInfo?.label ?? "p?"}`, styles.labelEmph],
            ["%c)", styles.meta],
            [`%c${nowIso()}`, styles.meta],
          ];
          logGroupCollapsedStyled(titlePairs);
          if (event?.data !== undefined) logData("data:", event.data);
          endGroup();
        } catch (_) {}
      };

      function wrappedAddEventListener(type, listener, options) {
        if (type === "message" && !listenerSet.has(this)) {
          try {
            // Attach our passive logger once per port instance
            origAddEventListener.call(this, "message", captureLogger, { capture: true });
            listenerSet.set(this, true);
          } catch (_) {}
        }
        return origAddEventListener.apply(this, [type, listener, options]);
      }

      try {
        Object.defineProperty(wrappedAddEventListener, "name", { value: "addEventListener" });
      } catch (_) {}
      try {
        Object.defineProperty(PortProto, "addEventListener", {
          configurable: true,
          writable: true,
          value: wrappedAddEventListener,
        });
      } catch (_) {
        try {
          PortProto.addEventListener = wrappedAddEventListener;
        } catch (_) {}
      }
    } catch (_) {}
  })();

  // MessageChannel constructor: log creation and ports
  (function wrapMessageChannel() {
    const OriginalMC = window.MessageChannel;
    if (!OriginalMC || OriginalMC.__MCT_WRAPPED__) return;

    function WrappedMessageChannel() {
      const channel = new OriginalMC();
      if (state.enabled) {
        try {
          const id = nextChannelId++;
          setPortMeta(channel.port1, id, "p1");
          setPortMeta(channel.port2, id, "p2");
          const titlePairs = [
            ["%cMCT", styles.badgeBase],
            ["%cnew", styles.meta],
            [`%cMessageChannel (ch#${id} `, styles.meta],
            ["%cp1", styles.labelEmph],
            ["%c\u2194", styles.meta],
            ["%cp2", styles.labelEmph],
            ["%c)", styles.meta],
            [`%c${nowIso()}`, styles.meta],
          ];
          logGroupCollapsedStyled(titlePairs);
          endGroup();
        } catch (_) {}
      }
      return channel;
    }

    try {
      Object.defineProperty(WrappedMessageChannel, "name", { value: "MessageChannel" });
    } catch (_) {}
    Object.defineProperty(WrappedMessageChannel, "__MCT_WRAPPED__", { value: true });
    WrappedMessageChannel.prototype = OriginalMC.prototype;

    try {
      Object.defineProperty(window, "MessageChannel", {
        configurable: true,
        writable: true,
        value: WrappedMessageChannel,
      });
    } catch (_) {
      try {
        window.MessageChannel = WrappedMessageChannel;
      } catch (_) {}
    }
  })();

  // BroadcastChannel
  (function wrapBroadcastChannel() {
    const OriginalBC = window.BroadcastChannel;
    if (!OriginalBC || OriginalBC.__MCT_WRAPPED__) return;

    function WrappedBroadcastChannel(name) {
      const bc = new OriginalBC(name);

      // Wrap postMessage on instance
      const originalPostMessage = bc.postMessage;
      function wrappedBCPostMessage(message) {
        if (state.enabled) {
          try {
            const titlePairs = [
              ["%cMCT", styles.badgeBase],
              ["%c↔", styles.arrowPort],
              ["%cBroadcastChannel.postMessage", styles.meta],
              [`%c${nowIso()}`, styles.meta],
            ];
            logGroupCollapsedStyled(titlePairs);
            logData("message:", message);
            endGroup();
          } catch (_) {}
        }
        return originalPostMessage.apply(this, [message]);
      }
      try {
        Object.defineProperty(wrappedBCPostMessage, "name", { value: "postMessage" });
      } catch (_) {}
      try {
        bc.postMessage = wrappedBCPostMessage;
      } catch (_) {}

      // Capture incoming messages
      try {
        bc.addEventListener(
          "message",
          (event) => {
            if (!state.enabled) return;
            try {
              const titlePairs = [
                ["%cMCT", styles.badgeBase],
                ["%c←", styles.arrowIn],
                ["%cBroadcastChannel.message", styles.meta],
                [`%c${nowIso()}`, styles.meta],
              ];
              logGroupCollapsedStyled(titlePairs);
              if (event?.data !== undefined) logData("data:", event.data);
              endGroup();
            } catch (_) {}
          },
          { capture: true },
        );
      } catch (_) {}

      return bc;
    }

    try {
      Object.defineProperty(WrappedBroadcastChannel, "name", { value: "BroadcastChannel" });
    } catch (_) {}
    Object.defineProperty(WrappedBroadcastChannel, "__MCT_WRAPPED__", { value: true });
    WrappedBroadcastChannel.prototype = OriginalBC.prototype;

    try {
      Object.defineProperty(window, "BroadcastChannel", {
        configurable: true,
        writable: true,
        value: WrappedBroadcastChannel,
      });
    } catch (_) {
      try {
        window.BroadcastChannel = WrappedBroadcastChannel;
      } catch (_) {}
    }
  })();

  // Worker and SharedWorker
  (function wrapWorkers() {
    const OriginalWorker = window.Worker;
    const OriginalSharedWorker = window.SharedWorker;

    function wrapWorkerConstructor(Original, label) {
      if (!Original || Original.__MCT_WRAPPED__) return Original;

      function WrappedWorker(specifier, options) {
        const worker = new Original(specifier, options);

        // Outbound messages
        try {
          const originalPostMessage = worker.postMessage;
          function wrappedWorkerPostMessage(message, transfer) {
            if (state.enabled) {
              try {
                const titlePairs = [
                  ["%cMCT", styles.badgeBase],
                  ["%c→%c", styles.arrowOut],
                  [`%c${label}.postMessage`, styles.meta],
                  [`%c${nowIso()}`, styles.meta],
                ];
                logGroupCollapsedStyled(titlePairs);
                logData("message:", message);
                endGroup();
              } catch (_) {}
            }
            return originalPostMessage.apply(this, [message, transfer]);
          }
          try {
            Object.defineProperty(wrappedWorkerPostMessage, "name", { value: "postMessage" });
          } catch (_) {}
          try {
            worker.postMessage = wrappedWorkerPostMessage;
          } catch (_) {}
        } catch (_) {}

        // Inbound messages
        try {
          worker.addEventListener(
            "message",
            (event) => {
              if (!state.enabled) return;
              try {
                const titlePairs = [
                  ["%cMCT", styles.badgeBase],
                  ["%c←", styles.arrowIn],
                  [`%c${label}.message`, styles.meta],
                  [`%c${nowIso()}`, styles.meta],
                ];
                logGroupCollapsedStyled(titlePairs);
                if (event?.data !== undefined) logData("data:", event.data);
                endGroup();
              } catch (_) {}
            },
            { capture: true },
          );
        } catch (_) {}

        return worker;
      }

      try {
        Object.defineProperty(WrappedWorker, "name", { value: label });
      } catch (_) {}
      Object.defineProperty(WrappedWorker, "__MCT_WRAPPED__", { value: true });
      WrappedWorker.prototype = Original.prototype;

      return WrappedWorker;
    }

    const MaybeWrappedWorker = wrapWorkerConstructor(OriginalWorker, "Worker");
    if (MaybeWrappedWorker && MaybeWrappedWorker !== OriginalWorker) {
      try {
        Object.defineProperty(window, "Worker", {
          configurable: true,
          writable: true,
          value: MaybeWrappedWorker,
        });
      } catch (_) {
        try {
          window.Worker = MaybeWrappedWorker;
        } catch (_) {}
      }
    }

    const MaybeWrappedSharedWorker = wrapWorkerConstructor(OriginalSharedWorker, "SharedWorker");
    if (MaybeWrappedSharedWorker && MaybeWrappedSharedWorker !== OriginalSharedWorker) {
      try {
        Object.defineProperty(window, "SharedWorker", {
          configurable: true,
          writable: true,
          value: MaybeWrappedSharedWorker,
        });
      } catch (_) {
        try {
          window.SharedWorker = MaybeWrappedSharedWorker;
        } catch (_) {}
      }
    }
  })();

  // Service Worker: wrap postMessage on ServiceWorker instances and log inbound messages
  (function wrapServiceWorkers() {
    try {
      const SWProto = window.ServiceWorker?.prototype;
      if (SWProto?.postMessage && !SWProto.postMessage.__MCT_WRAPPED__) {
        const originalSWPost = SWProto.postMessage;
        function wrappedSWPostMessage(message, transfer) {
          if (state.enabled) {
            try {
              const titlePairs = [
                ["%cMCT", styles.badgeBase],
                ["%c→", styles.arrowOut],
                ["%cServiceWorker.postMessage", styles.meta],
                [`%c${nowIso()}`, styles.meta],
              ];
              logGroupCollapsedStyled(titlePairs);
              logData("message:", message);
              endGroup();
            } catch (_) {}
          }
          return originalSWPost.apply(this, [message, transfer]);
        }
        try {
          Object.defineProperty(wrappedSWPostMessage, "name", { value: "postMessage" });
        } catch (_) {}
        Object.defineProperty(wrappedSWPostMessage, "__MCT_WRAPPED__", { value: true });
        try {
          Object.defineProperty(SWProto, "postMessage", {
            configurable: true,
            writable: true,
            value: wrappedSWPostMessage,
          });
        } catch (_) {
          try {
            SWProto.postMessage = wrappedSWPostMessage;
          } catch (_) {}
        }
      }
    } catch (_) {}

    try {
      const swc = navigator.serviceWorker;
      if (!swc) return;
      swc.addEventListener(
        "message",
        (event) => {
          if (!state.enabled) return;
          try {
            const titlePairs = [
              ["%cMCT", styles.badgeBase],
              ["%c←", styles.arrowIn],
              ["%cServiceWorker.message", styles.meta],
              [`%c${nowIso()}`, styles.meta],
            ];
            logGroupCollapsedStyled(titlePairs);
            if (event?.data !== undefined) logData("data:", event.data);
            endGroup();
          } catch (_) {}
        },
        { capture: true },
      );

      swc.addEventListener(
        "messageerror",
        (event) => {
          if (!state.enabled) return;
          try {
            const titlePairs = [
              ["%cMCT", styles.badgeBase],
              ["%c←", styles.arrowIn],
              ["%cServiceWorker.messageerror", styles.meta],
              [`%c${nowIso()}`, styles.meta],
            ];
            logGroupCollapsedStyled(titlePairs);
            // no-op; only errors are signaled here without user data
            endGroup();
          } catch (_) {}
        },
        { capture: true },
      );
    } catch (_) {}
  })();
})();
