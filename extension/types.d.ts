// Extension-specific type definitions

interface Window {
  __MCT_INSTALLED__?: boolean;
  postMessage: (message: unknown, targetOrigin: string, transfer?: Transferable[]) => void;
  MessageChannel: typeof MessageChannel;
  BroadcastChannel: typeof BroadcastChannel;
  Worker: typeof Worker;
  SharedWorker: typeof SharedWorker;
  ServiceWorker: typeof ServiceWorker;
}

// Chrome API augmentations
declare namespace chrome {
  namespace tabs {
    interface Tab {
      id?: number;
      url?: string;
      title?: string;
    }
  }
}

// Simplified types for tracker functionality
interface MCTWrappedFunction {
  __MCT_WRAPPED__?: boolean;
}

declare const MessageChannel: {
  new (): MessageChannel;
  prototype: MessageChannel;
};

declare const BroadcastChannel: {
  new (name: string): BroadcastChannel;
  prototype: BroadcastChannel;
};

declare const Worker: {
  new (scriptURL: string | URL, options?: WorkerOptions): Worker;
  prototype: Worker;
};

declare const SharedWorker: {
  new (scriptURL: string | URL, options?: string | WorkerOptions): SharedWorker;
  prototype: SharedWorker;
};
