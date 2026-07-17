const esbuild = require('esbuild');
esbuild.build({
  entryPoints: ['game.js'],
  bundle: true,
  outfile: 'dist/game.bundle.js',
  format: 'iife',
  target: ['es2018'],
}).then(() => console.log('✅ 构建完成')).catch(e => { console.error(e); process.exit(1); });
