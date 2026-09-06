import assert from 'node:assert/strict';
import test from 'node:test';

import { AppSession } from '../assets/scripts/core/AppSession.ts';

test('a new session starts cold and snapshots immutable state', () => {
  const session = new AppSession();
  const snapshot = session.snapshot();

  assert.equal(session.phase, 'cold');
  assert.deepEqual(snapshot, { phase: 'cold', error: undefined });
  assert.equal(Object.isFrozen(snapshot), true);
  assert.throws(() => {
    snapshot.phase = 'ready';
  }, TypeError);
});

test('a session advances from cold through booting to ready', () => {
  const session = new AppSession();

  session.start();
  assert.equal(session.phase, 'booting');
  session.ready();

  assert.deepEqual(session.snapshot(), { phase: 'ready', error: undefined });
});

test('a session rejects lifecycle transitions outside the allowed path', () => {
  const session = new AppSession();

  assert.throws(() => session.ready());
  session.start();
  assert.throws(() => session.start());
  session.ready();
  assert.throws(() => session.fail('late failure'));
});

test('a session can fail from cold or booting with a non-empty error', () => {
  const coldSession = new AppSession();
  coldSession.fail('startup unavailable');

  assert.equal(coldSession.phase, 'failed');
  assert.equal(coldSession.snapshot().error, 'startup unavailable');

  const bootingSession = new AppSession();
  bootingSession.start();
  bootingSession.fail('network unavailable');

  assert.equal(bootingSession.phase, 'failed');
  assert.equal(bootingSession.snapshot().error, 'network unavailable');
  assert.ok(bootingSession.snapshot().error.length > 0);
});
