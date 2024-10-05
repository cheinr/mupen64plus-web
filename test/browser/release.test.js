const path = require('path');
const { toMatchImageSnapshot } = require('jest-image-snapshot');
const { exec } = require('child_process');
const puppeteer = require('puppeteer');
const {
  runCommand,
  buildMupen64PlusWithArgs,
  prepareBenchmark
} = require('./test-utils');

const maybeUsePreExistingBuildArg = process.argv.filter((x) => x.startsWith('--use-pre-existing-build'))[0];
const shouldRebuildMupen64Plus = maybeUsePreExistingBuildArg
                               ? !maybeUsePreExistingBuildArg.split('=')[1] == 'true'
                               : true;

expect.extend({ toMatchImageSnapshot });

beforeAll(async () => {
  if (shouldRebuildMupen64Plus) {
    await buildMupen64PlusWithArgs('config=release -j8');
  }
  await prepareBenchmark();
}, 300 * 1000);

test('release benchmark', async () => {
  await runCommand('npm run benchmark', path.join(__dirname, '../../mupen64plus-web-benchmark'));
}, 60000);


async function sleepAsync(timeoutMillis) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeoutMillis);
  });
}

async function startTestHarnessServer() {
  const cwd = path.join(__dirname, '../../mupen64plus-web-benchmark');

  let devServerProcess;
  const execPromise = new Promise((resolve, reject) => {
    devServerProcess = exec('npm start', { cwd, maxBuffer: 1024 * 10000 }, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });

  await sleepAsync(3000);

  if (devServerProcess.exitCode) {
    throw 'Failed to start test harness server!';
  }

  return devServerProcess;
}

describe('Functionality Tests', () => {

  let devServerProcess;
  let browser;
  
  beforeAll(async () => {
    devServerProcess = await startTestHarnessServer();
    browser = await puppeteer.launch({headless: false });
  });

  afterAll(async () => {
    if (devServerProcess) {
      devServerProcess.kill();
    }
    browser.close();
  });

  test('keyboard: pause', async () => {
    const page = await browser.newPage();

    await page.goto('http://localhost:1337/?maxVIs=25');

    const elementHandle = await page.$("input[type=file]");
    await elementHandle.uploadFile(path.join(__dirname, '../../mupen64plus-web-benchmark/m64p_test_rom.v64'));

    await page.waitForSelector('#done', { timeout: 60000 });

    await page.keyboard.press('p');

    const canvas = await page.waitForSelector('#canvas');
    const image = await canvas.screenshot({
      encoding: 'base64'
    });

    expect(image).toMatchImageSnapshot();
  }, 30000);

  test('keyboard: pause, frame advance, resume', async () => {

    const page = await browser.newPage();

    await page.goto('http://localhost:1337/?maxVIs=25');

    const elementHandle = await page.$("input[type=file]");
    await elementHandle.uploadFile(path.join(__dirname, '../../mupen64plus-web-benchmark/m64p_test_rom.v64'));

    await page.waitForSelector('#done', { timeout: 60000 });

    await page.keyboard.press('p');

    const canvas = await page.waitForSelector('#canvas');

    const screenshotAfterPause = await canvas.screenshot({
      encoding: 'base64'
    });
    
    await page.keyboard.press('?');
    await page.keyboard.press('?');
    await page.keyboard.press('?');

    const screenshotAfterFrameAdvance = await canvas.screenshot({
      encoding: 'base64'
    });

    expect(screenshotAfterFrameAdvance).toMatchImageSnapshot();
    expect(screenshotAfterFrameAdvance).not.toEqual(screenshotAfterPause);

    await page.keyboard.press('p');

    const screenshotAfterResume = await canvas.screenshot({
      encoding: 'base64'
    });

    expect(screenshotAfterResume).not.toEqual(screenshotAfterFrameAdvance);
  }, 30000);

  test('heap usage', async () => {
    const page = await browser.newPage();

    await page.goto('http://localhost:1337/?maxVIs=150');

    const elementHandle = await page.$("input[type=file]");
    await elementHandle.uploadFile(path.join(__dirname, '../../mupen64plus-web-benchmark/m64p_test_rom.v64'));

    await page.waitForSelector('#done', { timeout: 60000 });

    const { JSHeapUsedSize, JSHeapTotalSize } = await page.metrics();

    console.log("JSHeapUsedSize: %o", JSHeapUsedSize);

    expect(JSHeapUsedSize).toBeLessThan(32 * 1000000);

  }, 15000);
});

