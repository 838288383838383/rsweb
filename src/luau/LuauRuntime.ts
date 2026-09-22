import { LuauState, Mutable } from 'luau-web';

let currentState: LuauState | null = null;

export interface LuauMessage {
  type: 'init' | 'execute' | 'stop' | 'result' | 'print' | 'error';
  code?: string;
  id?: string;
}

export interface LuauResult {
  success: boolean;
  output: string[];
  error?: string;
}

// Initialize the Luau WASM module
export async function initLuau(): Promise<void> {
  if (currentState) return;

  try {
    currentState = await LuauState.createAsync({});
    console.log('[Luau] WASM module initialized');
  } catch (error) {
    console.error('[Luau] Failed to initialize:', error);
    throw error;
  }
}

// Execute code in the current Luau state
export async function executeLuau(code: string): Promise<LuauResult> {
  if (!currentState) {
    await initLuau();
  }

  const output: string[] = [];
  const errors: string[] = [];

  try {
    const state = currentState!;

    // Override print to capture output
    const printCapture = (...args: any[]) => {
      const msg = args.map(a => String(a)).join('\t');
      output.push(msg);
    };

    // Inject print function
    state.env.set('print', printCapture, true);
    state.env.set('warn', (...args: any[]) => {
      const msg = args.map(a => String(a)).join('\t');
      output.push(`[WARN] ${msg}`);
    }, true);

    const func = state.loadstring(code, 'script.luau', false);
    if (typeof func === 'string') {
      return { success: false, output, error: func };
    }

    await func();
    return { success: true, output };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    errors.push(msg);
    return { success: false, output, error: msg };
  }
}

// Stop/cleanup
export function stopLuau(): void {
  if (currentState) {
    currentState.destroy();
    currentState = null;
  }
}

// Get the current state (for injecting globals)
export function getLuauState(): LuauState | null {
  return currentState;
}
