export type RuntimePlatform = 'wechat' | 'browser' | 'unknown';

export function detectRuntimePlatform(globalObject: unknown): RuntimePlatform {
  if (typeof globalObject !== 'object' || globalObject === null) {
    return 'unknown';
  }

  const runtime = globalObject as {
    wx?: { getSystemInfoSync?: unknown };
    window?: unknown;
  };

  if (typeof runtime.wx?.getSystemInfoSync === 'function') {
    return 'wechat';
  }

  if (runtime.window !== undefined) {
    return 'browser';
  }

  return 'unknown';
}
