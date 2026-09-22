declare module 'luau-web' {
  export class LuauState {
    destroyed: boolean;
    env: LuauEnv;
    static createAsync(initialEnv?: Record<string, any>): Promise<LuauState>;
    loadstring(source: string, chunkname?: string, throwOnCompilationError?: boolean): LuauFunction | string;
    destroy(): void;
  }

  export interface LuauEnv {
    set(key: string, value: any, bypassReadonly?: boolean): void;
    get(key: string): any;
    global: LuauTable;
    [key: string]: any;
  }

  export interface LuauTable {
    get(key: any): any;
    set(key: any, value: any, bypassReadonly?: boolean): boolean;
    keys(): any[];
    [key: string]: any;
  }

  export type LuauFunction = (...args: any[]) => any;

  export function Mutable<T extends object>(object: T): Map<keyof T, T[keyof T]> & T;

  export const InternalLuauWasmModule: {
    securityTransmitList: Map<any, boolean>;
    options: Map<string, boolean>;
  };
}
