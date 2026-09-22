// Luau Web Worker
// Runs Luau scripts in an isolated thread

import { LuauState } from 'luau-web';

let state: LuauState | null = null;

interface WorkerMessage {
  type: 'init' | 'execute' | 'stop' | 'set-global';
  code?: string;
  name?: string;
  value?: any;
  id?: string;
}

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const msg = e.data;

  switch (msg.type) {
    case 'init': {
      try {
        const mod = await import('luau-web');
        state = await mod.LuauState.createAsync({});
        self.postMessage({ type: 'ready' });
      } catch (error) {
        self.postMessage({ type: 'error', error: String(error) });
      }
      break;
    }

    case 'execute': {
      if (!state) {
        self.postMessage({ type: 'error', error: 'Luau not initialized' });
        return;
      }

      const output: string[] = [];
      try {
        // Capture print output
        state.env.set('print', (...args: any[]) => {
          const msg = args.map(a => String(a)).join('\t');
          output.push(msg);
          self.postMessage({ type: 'print', message: msg });
        }, true);

        state.env.set('warn', (...args: any[]) => {
          const msg = args.map(a => String(a)).join('\t');
          const fullMsg = `[WARN] ${msg}`;
          output.push(fullMsg);
          self.postMessage({ type: 'print', message: fullMsg });
        }, true);

        const func = state.loadstring(msg.code || '', msg.name || 'script.luau', false);
        if (typeof func === 'string') {
          self.postMessage({ type: 'result', success: false, error: func, output });
          return;
        }

        await func();
        self.postMessage({ type: 'result', success: true, output });
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        self.postMessage({ type: 'result', success: false, error: errMsg, output });
      }
      break;
    }

    case 'set-global': {
      if (!state) return;
      try {
        state.env.set(msg.name || '', msg.value, true);
      } catch (error) {
        self.postMessage({ type: 'error', error: String(error) });
      }
      break;
    }

    case 'stop': {
      if (state) {
        state.destroy();
        state = null;
      }
      self.postMessage({ type: 'stopped' });
      break;
    }
  }
};
