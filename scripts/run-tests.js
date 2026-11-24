const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fralda-online-tests-'));

try {
  const tscBin = require.resolve('typescript/bin/tsc', { paths: [rootDir] });

  execFileSync(
    process.execPath,
    [tscBin, '-p', 'tsconfig.test.json', '--outDir', outDir],
    {
      stdio: 'inherit',
      cwd: rootDir,
    }
  );

  const compiledTestsDir = path.join(outDir, 'tests');
  const testFiles = fs
    .readdirSync(compiledTestsDir)
    .filter((name) => name.endsWith('.test.js'))
    .sort()
    .map((name) => path.join(compiledTestsDir, name));

  if (testFiles.length === 0) {
    throw new Error('Nenhum arquivo de teste compilado encontrado.');
  }

  execFileSync(process.execPath, ['--test', ...testFiles], {
    stdio: 'inherit',
    cwd: rootDir,
  });
} catch (err) {
  process.exit(err && typeof err.status === 'number' && err.status !== 0 ? err.status : 1);
} finally {
  fs.rmSync(outDir, { recursive: true, force: true });
}
