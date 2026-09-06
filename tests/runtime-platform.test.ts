import assert from 'node:assert/strict';
import test from 'node:test';

import { detectRuntimePlatform } from '../assets/scripts/platform/RuntimePlatform.ts';

test('detects WeChat from its system-info capability', () => {
  assert.equal(
    detectRuntimePlatform({ wx: { getSystemInfoSync() {} } }),
    'wechat',
  );
});

test('detects a browser from a window capability', () => {
  assert.equal(detectRuntimePlatform({ window: {} }), 'browser');
});

test('returns unknown when no runtime capability is available', () => {
  assert.equal(detectRuntimePlatform({}), 'unknown');
});
