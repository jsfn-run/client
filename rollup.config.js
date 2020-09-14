import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

const terserOptions = { ecma: 2020, module: true };

export default {
  input: 'src/index.ts',
  external: [],
  output: {
    dir: 'dist',
    format: 'es',
  },
  plugins: [typescript({ module: 'es2020' }), terser(terserOptions)],
};
