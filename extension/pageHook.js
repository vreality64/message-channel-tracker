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
  };

  // Receive enable/disable messages from the content script
  window.addEventListener(
    "message",
    (event) => {
      try {
        if (event?.source !== window) return;
        const data = event?.data;
        if (!data || typeof data !== "object") return;
        if (data.type === "MCT:SET_ENABLED") {
          state.enabled = Boolean(data.enabled);
          logInternalInfo(state.enabled ? "Tracking enabled" : "Tracking disabled");
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
  };

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
        console.log("event:", event);
        if (event?.data !== undefined) console.log("data:", event.data);
        if (event?.origin !== undefined) console.log("origin:", event.origin);
        if (event?.source !== undefined) console.log("source:", event.source);
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
          console.log("message:", message);
          console.log("targetOrigin:", targetOrigin);
          if (transfer !== undefined) console.log("transfer:", transfer);
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
          const titlePairs = [
            ["%cMCT", styles.badgeBase],
            ["%c↔", styles.arrowPort],
            ["%cMessagePort.postMessage", styles.meta],
            [`%c${nowIso()}`, styles.meta],
          ];
          logGroupCollapsedStyled(titlePairs);
          console.log("port:", this);
          console.log("message:", message);
          if (transfer !== undefined) console.log("transfer:", transfer);
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
          const titlePairs = [
            ["%cMCT", styles.badgeBase],
            ["%c←", styles.arrowIn],
            ["%cMessagePort.message", styles.meta],
            [`%c${nowIso()}`, styles.meta],
          ];
          logGroupCollapsedStyled(titlePairs);
          console.log("port:", this);
          console.log("event:", event);
          if (event?.data !== undefined) console.log("data:", event.data);
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
          const titlePairs = [
            ["%cMCT", styles.badgeBase],
            ["%cnew", styles.meta],
            ["%cMessageChannel", styles.meta],
            [`%c${nowIso()}`, styles.meta],
          ];
          logGroupCollapsedStyled(titlePairs);
          console.log("channel:", channel);
          console.log("port1:", channel.port1);
          console.log("port2:", channel.port2);
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
            console.log("channel:", bc);
            console.log("name:", name);
            console.log("message:", message);
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
              console.log("channel:", bc);
              console.log("name:", name);
              console.log("event:", event);
              if (event?.data !== undefined) console.log("data:", event.data);
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
                console.log("worker:", worker);
                console.log("message:", message);
                if (transfer !== undefined) console.log("transfer:", transfer);
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
                console.log("worker:", worker);
                console.log("event:", event);
                if (event?.data !== undefined) console.log("data:", event.data);
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
              console.log("serviceWorker:", this);
              console.log("message:", message);
              if (transfer !== undefined) console.log("transfer:", transfer);
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
            console.log("event:", event);
            if (event?.data !== undefined) console.log("data:", event.data);
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
            console.log("event:", event);
            endGroup();
          } catch (_) {}
        },
        { capture: true },
      );
    } catch (_) {}
  })();
})();
