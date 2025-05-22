
declare module 'vite-plugin-backloop.dev' {
  import { Plugin } from 'vite';
  export default function backloop(computerId?: string): Plugin;
}
