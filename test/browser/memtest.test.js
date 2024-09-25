const path = require('path');
const {
  runCommand,
  buildMupen64PlusWithArgs,
  prepareBenchmark
} = require('./test-utils');

beforeAll(async () => {
  await buildMupen64PlusWithArgs('config=memtest -j8');
  await prepareBenchmark();
}, 300 * 1000);

test('memtest', async () => {
  await runCommand('npm run benchmark', path.join(__dirname, '../../mupen64plus-web-benchmark'));
}, 60000);
