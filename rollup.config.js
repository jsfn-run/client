import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.ts',
  external: [],
  output: {
    dir: 'dist',
    format: 'es',
  },
  plugins: [typescript({ module: 'CommonJS' }), resolve(), terser()],
};
