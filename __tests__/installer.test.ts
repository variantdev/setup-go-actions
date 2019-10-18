import io = require('@actions/io');
import fs = require('fs');
import os = require('os');
import path = require('path');
import nock = require('nock');

const toolDir = path.join(__dirname, 'runner', 'tools');
const tempDir = path.join(__dirname, 'runner', 'temp');
const dataDir = path.join(__dirname, 'data');

process.env['RUNNER_TOOL_CACHE'] = toolDir;
process.env['RUNNER_TEMP'] = tempDir;
import * as installer from '../src/installer';

const IS_WINDOWS = process.platform === 'win32';

describe('installer tests', () => {
  beforeAll(async () => {
    await io.rmRF(toolDir);
    await io.rmRF(tempDir);
  }, 100000);

  afterAll(async () => {
    try {
      await io.rmRF(toolDir);
      await io.rmRF(tempDir);
    } catch {
      console.log('Failed to remove test directories');
    }
  }, 100000);

  it('Acquires version of variant if no matching version is installed', async () => {
    await installer.getTool('0.5.0');
    const variantDir = path.join(toolDir, 'go-actions', '0.5.0', os.arch());
    const binDir = path.join(variantDir);

    expect(fs.existsSync(`${variantDir}.complete`)).toBe(true);
    if (IS_WINDOWS) {
      expect(fs.existsSync(path.join(binDir, 'actions.exe'))).toBe(true);
    } else {
      expect(fs.existsSync(path.join(binDir, 'actions'))).toBe(true);
    }
  }, 100000);

  describe('the latest release of a go-actions version', () => {
    beforeEach(() => {
      nock('https://api.github.com')
        .get('/repos/variantdev/go-actions/releases')
        .replyWithFile(200, path.join(dataDir, 'go-actions-release-dl.json'));
    });

    afterEach(() => {
      nock.cleanAll();
      nock.enableNetConnect();
    });

    it('Acquires latest release version of go-actions 0.5 if using 0.5 and no matching version is installed', async () => {
      await installer.getTool('0.5');
      const variantDir = path.join(toolDir, 'go-actions', '0.5.0', os.arch());
      const binDir = path.join(variantDir);

      expect(fs.existsSync(`${variantDir}.complete`)).toBe(true);
      if (IS_WINDOWS) {
        expect(fs.existsSync(path.join(binDir, 'actions.exe'))).toBe(true);
      } else {
        expect(fs.existsSync(path.join(binDir, 'actions'))).toBe(true);
      }
    }, 100000);

    it('Acquires latest release version of go-actions 0.5 if using 0.5.x and no matching version is installed', async () => {
      await installer.getTool('0.5.x');
      const variantDir = path.join(toolDir, 'go-actions', '0.5.0', os.arch());
      const binDir = path.join(variantDir);

      expect(fs.existsSync(`${variantDir}.complete`)).toBe(true);
      if (IS_WINDOWS) {
        expect(fs.existsSync(path.join(binDir, 'actions.exe'))).toBe(true);
      } else {
        expect(fs.existsSync(path.join(binDir, 'actions'))).toBe(true);
      }
    }, 100000);

    it('Acquires latest release version of go-actions if using 0.x and no matching version is installed', async () => {
      await installer.getTool('0.x');
      const variantDir = path.join(toolDir, 'go-actions', '0.5.0', os.arch());
      const binDir = path.join(variantDir);

      expect(fs.existsSync(`${variantDir}.complete`)).toBe(true);
      if (IS_WINDOWS) {
        expect(fs.existsSync(path.join(binDir, 'actions.exe'))).toBe(true);
      } else {
        expect(fs.existsSync(path.join(binDir, 'actions'))).toBe(true);
      }
    }, 100000);
  });

  it('Throws if no location contains correct go-actions version', async () => {
    let thrown = false;
    try {
      await installer.getTool('1000.0');
    } catch {
      thrown = true;
    }
    expect(thrown).toBe(true);
  });

  it('Uses version of go-actions installed in cache', async () => {
    const variantDir: string = path.join(
      toolDir,
      'go-actions',
      '250.0.0',
      os.arch()
    );
    await io.mkdirP(variantDir);
    fs.writeFileSync(`${variantDir}.complete`, 'hello');
    // This will throw if it doesn't find it in the cache (because no such version exists)
    await installer.getTool('250.0');
    return;
  });

  it('Doesnt use version of go-actions that was only partially installed in cache', async () => {
    const variantDir: string = path.join(
      toolDir,
      'go-actions',
      '251.0.0',
      os.arch()
    );
    await io.mkdirP(variantDir);
    let thrown = false;
    try {
      // This will throw if it doesn't find it in the cache (because no such version exists)
      await installer.getTool('251.0');
    } catch {
      thrown = true;
    }
    expect(thrown).toBe(true);
    return;
  });
});
