
declare module 'vite-plugin-backloop.dev' {
  import { Plugin } from 'vite';
  
  export interface BackloopOptions {
    rootDir?: string;
    port?: number;
    customDeps?: string[];
    env?: Record<string, string>;
    verbose?: boolean;
  }
  
  export default function backloopDev(): Plugin;
}
